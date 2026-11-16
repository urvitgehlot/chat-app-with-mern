import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Info, Shield, ChevronDown } from 'lucide-react';
import ChatBubble from '../../../components/ui/ChatBubble';
import SendMessageInput from '../components/SendMessageInput';
import GroupChatProfile from '../components/GroupChatProfile';
import IconButton from '../../../components/ui/IconButton';
import Avatar from '../../../components/ui/Avatar';
import { MessageSkeleton } from '../../../components/ui/Skeleton';
import { useAuth } from '../../auth/useAuth';
import { useChat } from '../useChat';
import { useMarkChatAsRead } from '../useMarkChatAsRead';
import { useGoToBottom } from '../useGoToBottom';
import { createChatKey } from '../../../utils/chatKey';

function GroupChat() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { userData } = useAuth();
    const { chats, messages, users, getGroupDetails, getChatMessagesByPage, joinChat, closeChat, markMessageAsRead } = useChat();

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const chatRef = useRef();
    const chatBottomRef = useRef();
    const chatTopRef = useRef();
    const isFetchingRef = useRef(false);

    const chatKey = useMemo(() => createChatKey('group', id), [id]);
    const chatMessagesState = messages.byChatKey[chatKey];
    const isLoading = chatMessagesState?.loading || false;
    const hasMore = chatMessagesState?.hasMore ?? true;
    const isInitialLoading = (isLoading || chats.loading) && (!chatMessagesState?.ids || chatMessagesState?.ids.length === 0);
    const messageIds = chatMessagesState?.ids || [];
    const { showGoToBottomBtn, scrollToBottom } = useGoToBottom({
        chatKey,
        scrollContainerRef: chatRef,
        bottomSentinelRef: chatBottomRef,
        isInitialLoading,
    });

    const existingChat = chats.entities?.[chatKey];

    // Group state initialized from router state or cache
    const [groupData, setGroupData] = useState(() => {
        if (location.state?.group) return location.state.group;
        if (existingChat) {
            return {
                _id: id,
                name: existingChat.name || `Group #${id ? id.slice(-4) : 'Chat'}`,
                description: existingChat.description || "",
                avatarUrl: existingChat.avatarUrl || null,
                participants: existingChat.participants || [],
                createdAt: existingChat.createdAt,
            };
        }
        return {
            _id: id,
            name: `Group #${id ? id.slice(-4) : 'Chat'}`,
            description: "",
            avatarUrl: null,
            participants: [],
            createdAt: new Date().toISOString(),
        };
    });

    // Update group state when existing store entity updates
    useEffect(() => {
        if (existingChat) {
            setGroupData((prev) => ({
                ...prev,
                ...existingChat,
                name: existingChat.name || prev.name,
                description: existingChat.description ?? prev.description,
                avatarUrl: existingChat.avatarUrl !== undefined ? existingChat.avatarUrl : prev.avatarUrl,
                participants: existingChat.participants?.length ? existingChat.participants : prev.participants,
                createdAt: existingChat.createdAt || prev.createdAt,
            }));
        }
    }, [existingChat]);

    // Fetch latest group details and members from backend API
    useEffect(() => {
        if (!id) return;

        let isMounted = true;
        getGroupDetails(id)
            .then((data) => {
                if (!isMounted || !data) return;
                setGroupData((prev) => ({
                    ...prev,
                    ...data,
                    _id: data._id || prev._id,
                    name: data.name || prev.name,
                    description: data.description ?? prev.description,
                    avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : prev.avatarUrl,
                    participants: data.participants || prev.participants,
                    createdAt: data.createdAt || prev.createdAt,
                }));
            })
            .catch((err) => {
                console.error("Failed to load group details:", err);
            });

        return () => {
            isMounted = false;
        };
    }, [id]);

    // Fetch paginated messages and join chat room via API & sockets
    useEffect(() => {
        if (!id || chats.loading) return;

        getChatMessagesByPage({
            chatId: id,
            page: 1,
            limit: 20,
            chatType: "group",
        });
        joinChat({ chatId: id, chatType: 'group' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, chats.loading]);

    useMarkChatAsRead({
        chatType: 'group',
        chatId: id,
        messageIds,
        messageEntities: messages.entities,
        currentUserId: userData?._id,
        existingChat,
        markMessageAsRead,
    });

    useEffect(() => {
        return () => {
            closeChat();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reset fetching ref once loading completes
    useEffect(() => {
        if (!isLoading) {
            isFetchingRef.current = false;
        }
    }, [isLoading]);

    const loadNextPage = () => {
        if (!hasMore || chats.loading || isFetchingRef.current) return;

        isFetchingRef.current = true;
        getChatMessagesByPage({
            chatId: id,
            page: (chatMessagesState?.currentPage || 1) + 1,
            limit: 20,
            chatType: "group",
        });
    };

    // Auto-fetch next page when 30% or less of the scroll distance to the top is left
    useEffect(() => {
        const scrollContainer = chatRef.current;
        if (!scrollContainer) return;

        const handleScroll = () => {
            if (!hasMore || chats.loading || isFetchingRef.current) return;

            const { scrollHeight, clientHeight, scrollTop } = scrollContainer;
            const maxScroll = scrollHeight - clientHeight;
            if (maxScroll <= 0) return;

            let remainingToTop = maxScroll;
            if (scrollTop < 0) {
                remainingToTop = maxScroll - Math.abs(scrollTop);
            } else if (scrollTop > 0) {
                remainingToTop = scrollTop;
            }

            const scrollPercentageLeft = remainingToTop / maxScroll;

            if (scrollPercentageLeft <= 0.3) {
                loadNextPage();
            }
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, hasMore, chats.loading, chatMessagesState?.currentPage, isInitialLoading]);

    // Top sentinel observer fallback
    useEffect(() => {
        if (isInitialLoading) return;
        const topElement = chatTopRef.current;
        const scrollContainer = chatRef.current;

        if (!topElement || !scrollContainer || !hasMore || chats.loading) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                loadNextPage();
            }
        }, {
            root: scrollContainer,
            threshold: 0.1,
        });

        observer.observe(topElement);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, hasMore, chatMessagesState?.currentPage, chats.loading, isInitialLoading]);

    const handleUserAdded = (newUser) => {
        setGroupData((prev) => ({
            ...prev,
            participants: [...(prev.participants || []), newUser],
        }));
    };

    const handleGroupUpdated = (updatedGroup) => {
        setGroupData((prev) => ({
            ...prev,
            name: updatedGroup.name ?? prev.name,
            description: updatedGroup.description ?? prev.description,
            avatarUrl: updatedGroup.avatarUrl ?? prev.avatarUrl,
            participants: updatedGroup.participants ?? prev.participants,
        }));
    };

    return (
        <div className="flex-1 flex min-w-0 h-full relative overflow-hidden bg-bg-app">
            <main className="flex-1 flex flex-col min-w-0 h-full relative">
                {/* Header */}
                <header className="h-15 flex items-center justify-between px-3 sm:px-5 border-b border-border bg-bg-surface/90 backdrop-blur-md shrink-0 z-10 select-none">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {/* Mobile Back Button */}
                        <div className="md:hidden">
                            <IconButton
                                icon={ArrowLeft}
                                size="md"
                                title="Back to conversations"
                                onClick={() => {
                                    closeChat();
                                    navigate('/');
                                }}
                            />
                        </div>

                        {/* Group Info Clickable */}
                        <div
                            onClick={() => setIsProfileOpen((prev) => !prev)}
                            className="flex items-center gap-2.5 cursor-pointer min-w-0 group p-1 -m-1 rounded-xl hover:bg-bg-hover transition-colors"
                        >
                            {groupData.avatarUrl ? (
                                <div className="size-10 rounded-xl overflow-hidden border border-primary/20 shadow-xs shrink-0 bg-bg-card">
                                    <img
                                        src={groupData.avatarUrl}
                                        alt={groupData.name || "Group"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="size-10 rounded-xl bg-gradient-to-tr from-primary/20 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-xs">
                                    <Users size={18} />
                                </div>
                            )}

                            <div className="min-w-0">
                                <h2 className="text-sm sm:text-base font-semibold text-text-primary leading-tight truncate group-hover:text-primary transition-colors">
                                    {groupData.name}
                                </h2>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[11px] text-text-muted truncate">
                                        {groupData.participants?.length || 0} members
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        <IconButton
                            icon={Info}
                            size="md"
                            title="Group info & members"
                            active={isProfileOpen}
                            onClick={() => setIsProfileOpen((prev) => !prev)}
                        />
                    </div>
                </header>

                {/* Messages Stream Area */}
                {isInitialLoading ? (
                    <div className="flex-1 flex flex-col justify-end">
                        <MessageSkeleton />
                    </div>
                ) : (
                    <div
                        ref={chatRef}
                        className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col-reverse scrollbar-hide relative select-text"
                    >
                        <div ref={chatBottomRef} className="h-px w-full shrink-0" aria-hidden="true">
                            {/* Bottom Sentinel */}
                        </div>

                        {/* Scroll to Bottom Button */}
                        {showGoToBottomBtn && (
                            <button
                                onClick={scrollToBottom}
                                title="Jump to recent"
                                className="sticky ml-auto bottom-3 right-3 size-9 rounded-full bg-bg-elevated hover:bg-bg-hover text-text-primary border border-border shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 z-20"
                            >
                                <ChevronDown size={18} />
                            </button>
                        )}

                        {/* Messages List with Dynamic Member Attribution */}
                        {messageIds.map((messageId, index) => {
                            const message = messages.entities[messageId];
                            if (!message) return null;

                            const senderIdStr = typeof message.senderId === 'object' ? message.senderId?._id : message.senderId;
                            const isReceived = senderIdStr !== userData?._id;
                            const sentAt = new Date(`${message.sentAt || message.createdAt || Date.now()}`);

                            const sender = groupData.participants?.find((p) => (p._id || p) === senderIdStr) ||
                                message.sender ||
                                users.entities?.[senderIdStr];

                            const senderName = isReceived ? (sender?.displayName || sender?.username || "Member") : null;
                            const senderAvatar = isReceived ? sender?.avatarUrl : null;

                            const prevMessage = messages.entities[messageIds[index + 1]];
                            const nextMessage = messages.entities[messageIds[index - 1]];

                            const prevSenderId = prevMessage
                                ? (typeof prevMessage.senderId === 'object' ? prevMessage.senderId?._id : prevMessage.senderId)
                                : null;
                            const nextSenderId = nextMessage
                                ? (typeof nextMessage.senderId === 'object' ? nextMessage.senderId?._id : nextMessage.senderId)
                                : null;

                            const isFirstInGroup = !prevMessage || prevSenderId !== senderIdStr;
                            const isLastInGroup = !nextMessage || nextSenderId !== senderIdStr;

                            return (
                                <ChatBubble
                                    key={messageId}
                                    message={message.content}
                                    isReceived={isReceived}
                                    senderAvatar={senderAvatar}
                                    senderName={senderName}
                                    msgDateTime={sentAt}
                                    status={message.status || "sent"}
                                    isRead={Boolean(message.isRead)}
                                    isFirstInGroup={isFirstInGroup}
                                    isLastInGroup={isLastInGroup}
                                />
                            );
                        })}

                        {/* Top Sentinel & Loading Indicator */}
                        <div
                            ref={chatTopRef}
                            style={{ overflowAnchor: 'none' }}
                            className="w-full flex justify-center py-2 min-h-[1px]"
                        >
                            {isLoading && !isInitialLoading && (
                                <div className="flex items-center gap-2 text-xs text-text-muted py-2">
                                    <span className="size-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <span>Loading older messages...</span>
                                </div>
                            )}
                            {!hasMore && messageIds.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[11px] text-text-disabled py-3">
                                    <Shield size={12} className="text-primary" />
                                    <span>Beginning of encrypted conversation in <strong>{groupData.name}</strong></span>
                                </div>
                            )}
                            {messageIds.length === 0 && !isLoading && (
                                <div className="w-full flex justify-center py-4">
                                    <div className="flex items-center gap-1.5 text-[11px] text-text-disabled py-2 px-3 rounded-full bg-bg-card/40 border border-border/30">
                                        <Shield size={12} className="text-primary" />
                                        <span>No messages yet in <strong>{groupData.name}</strong>. Start the conversation!</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Message Composer */}
                <SendMessageInput
                    inputType="group"
                    chatId={id}
                />
            </main>

            {/* Right Group Details Drawer */}
            <GroupChatProfile
                group={groupData}
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                onUserAdded={handleUserAdded}
                onGroupUpdated={handleGroupUpdated}
            />
        </div>
    );
}

export default GroupChat;
