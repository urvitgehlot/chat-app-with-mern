import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Info, Shield, Sparkles } from 'lucide-react';
import ChatBubble from '../../../components/ui/ChatBubble';
import DirectMessageProfile from '../components/DirectMessageProfile';
import SendMessageInput from '../components/SendMessageInput';
import ManageContactModal from '../components/ManageContactModal';
import Avatar from '../../../components/ui/Avatar';
import IconButton from '../../../components/ui/IconButton';
import { MessageSkeleton } from '../../../components/ui/Skeleton';
import { useChat } from '../useChat';
import { useAuth } from '../../auth/useAuth';
import { createChatKey } from '../../../utils/chatKey';

function DirectMessage() {
    const { directChatId } = useParams();
    const navigate = useNavigate();
    const { chats, messages, onlineUsers, joinChat, closeChat, getChatMessagesByPage } = useChat();
    const { userData } = useAuth();

    const [showGoToBottomBtn, setShowGoToBottomBtn] = useState(false);
    const [showManageContactModal, setShowManageContactModal] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const chatRef = useRef();
    const chatBottomRef = useRef();
    const chatTopRef = useRef();
    const isFetchingRef = useRef(false);

    const chatKey = useMemo(() => createChatKey("direct", directChatId), [directChatId]);
    const chatMessagesState = messages.byChatKey[chatKey];
    const isLoading = chatMessagesState?.loading || false;
    const hasMore = chatMessagesState?.hasMore ?? true;
    const isInitialLoading = (isLoading || chats.loading) && (!chatMessagesState?.ids || chatMessagesState?.ids.length === 0);

    const currentChatUser = useMemo(() => {
        const participants = chats.entities[chatKey]?.participants;
        if (!participants) return null;
        return participants.find((participant) => participant._id !== userData?._id);
    }, [chats.entities, chatKey, userData?._id]);

    const isUserOnline = currentChatUser?._id && Boolean(onlineUsers?.[currentChatUser._id]);

    useEffect(() => {
        if (chats.loading) return;

        getChatMessagesByPage({
            chatId: directChatId,
            page: 1,
            limit: 20,
            chatType: "direct",
        });
        joinChat({ chatId: directChatId, chatType: 'direct' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [directChatId, chats.loading]);

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
            chatId: directChatId,
            page: (chatMessagesState?.currentPage || 1) + 1,
            limit: 20,
            chatType: "direct",
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

            // In flex-col-reverse (Chromium/Firefox/Safari), scrollTop is 0 at bottom (newest) and -maxScroll at top (oldest).
            // In standard scroll, scrollTop is maxScroll at bottom and 0 at top.
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
    }, [directChatId, hasMore, chats.loading, chatMessagesState?.currentPage]);

    // Top sentinel observer fallback
    useEffect(() => {
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
    }, [directChatId, hasMore, chatMessagesState?.currentPage, chats.loading]);

    // Bottom sentinel observer for go-to-bottom button
    useEffect(() => {
        const bottomElement = chatBottomRef.current;
        const scrollContainer = chatRef.current;

        if (!bottomElement || !scrollContainer) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setShowGoToBottomBtn(false);
            } else {
                setShowGoToBottomBtn(true);
            }
        }, {
            root: scrollContainer,
            threshold: 0.1,
        });

        observer.observe(bottomElement);
        return () => observer.disconnect();
    }, [directChatId]);

    const messageIds = chatMessagesState?.ids || [];

    return (
        <div className="flex-1 flex min-w-0 h-full relative overflow-hidden bg-bg-app">
            <main className="flex-1 flex flex-col min-w-0 h-full relative">
                {/* Chat Header */}
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

                        {/* User Identity clickable for info */}
                        <div
                            onClick={() => setIsProfileOpen((prev) => !prev)}
                            className="flex items-center gap-2.5 cursor-pointer min-w-0 group p-1 -m-1 rounded-xl hover:bg-bg-hover transition-colors"
                        >
                            <Avatar
                                src={currentChatUser?.avatarUrl}
                                name={currentChatUser?.displayName || "User"}
                                size="md"
                                status={isUserOnline ? "online" : null}
                            />
                            <div className="min-w-0">
                                <h2 className="text-sm sm:text-base font-semibold text-text-primary leading-tight truncate group-hover:text-primary transition-colors">
                                    {currentChatUser?.displayName || "Direct Message"}
                                </h2>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span
                                        className={`size-1.5 rounded-full ${isUserOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                                            }`}
                                    />
                                    <span className="text-[11px] text-text-muted">
                                        {isUserOnline ? "Active now" : "Offline"}
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
                            title="Contact info & settings"
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
                        <div ref={chatBottomRef}>
                            {/* Bottom Sentinel */}
                        </div>

                        {/* Scroll to Bottom Button */}
                        {showGoToBottomBtn && (
                            <button
                                onClick={() => {
                                    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
                                    setShowGoToBottomBtn(false);
                                }}
                                title="Jump to recent"
                                className="sticky ml-auto bottom-3 right-3 size-9 rounded-full bg-bg-elevated hover:bg-bg-hover text-text-primary border border-border shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 z-20"
                            >
                                <ChevronDown size={18} />
                            </button>
                        )}

                        {/* Messages List with Smart Grouping */}
                        {messageIds.map((messageId, index) => {
                            const message = messages.entities[messageId];
                            if (!message) return null;

                            const isReceived = message.senderId !== userData?._id;
                            const sentAt = new Date(`${message.sentAt || message.createdAt || Date.now()}`);

                            // Grouping calculation in flex-col-reverse:
                            // previous chronological message is at index + 1
                            // next chronological message is at index - 1
                            const prevMessage = messages.entities[messageIds[index + 1]];
                            const nextMessage = messages.entities[messageIds[index - 1]];

                            const isFirstInGroup = !prevMessage || prevMessage.senderId !== message.senderId;
                            const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId;

                            return (
                                <ChatBubble
                                    key={messageId}
                                    message={message.content}
                                    isReceived={isReceived}
                                    senderAvatar={isReceived ? currentChatUser?.avatarUrl : null}
                                    senderName={isReceived ? currentChatUser?.displayName : null}
                                    msgDateTime={sentAt}
                                    status={message.status || "sent"}
                                    isRead={Boolean(message.isRead)}
                                    isFirstInGroup={isFirstInGroup}
                                    isLastInGroup={isLastInGroup}
                                />
                            );
                        })}

                        {/* Top Sentinel & Loading Indicator for pagination */}
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
                                    <Shield size={12} />
                                    <span>Beginning of encrypted direct conversation</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Message Composer */}
                <SendMessageInput
                    inputType="direct"
                    chatId={directChatId}
                    currentChatUser={currentChatUser}
                />
            </main>

            {/* Right Contact Details Drawer */}
            <DirectMessageProfile
                currentChatUser={currentChatUser}
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                onManageContact={() => setShowManageContactModal(true)}
            />

            {/* Manage Contact Modal */}
            {showManageContactModal && (
                <ManageContactModal
                    contactUser={currentChatUser}
                    onClose={() => setShowManageContactModal(false)}
                />
            )}
        </div>
    );
}

export default DirectMessage;