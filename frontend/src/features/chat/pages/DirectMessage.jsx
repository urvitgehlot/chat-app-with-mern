import React, { useEffect, useMemo, useRef, useState } from 'react'
import ChatBubble from '../../../components/ui/ChatBubble'
import DirectMessageProfile from '../components/DirectMessageProfile'
import { useParams } from 'react-router-dom'
import { useChat } from '../useChat';
import { useAuth } from '../../auth/useAuth';
import { formatedSmartDate } from '../../../utils/date';
import SendMessageInput from '../components/SendMessageInput';
import { createChatKey } from '../../../utils/chatKey';
import ManageContactModal from '../components/ManageContactModal';

function DirectMessage() {
    const { directChatId } = useParams();
    const { chats, messages, users, joinChat, getChatMessagesByPage } = useChat();
    const { userData } = useAuth();

    const [showGoToBottomBtn, setShowGoToBottomBtn] = useState(false);
    const [showManageContactModal, setShowManageContactModal] = useState(false);

    const chatRef = useRef();
    const chatBottomRef = useRef();
    const chatTopRef = useRef();
    const isFetchingRef = useRef(false);

    const chatKey = useMemo(() => createChatKey("direct", directChatId), [directChatId]);
    const chatMessagesState = messages.byChatKey[chatKey];
    const isLoading = chatMessagesState?.loading || false;
    const hasMore = chatMessagesState?.hasMore ?? true;
    const currentPage = chatMessagesState?.currentPage || 1;
    const isInitialLoading = (isLoading || chats.loading) && (!chatMessagesState?.ids || chatMessagesState?.ids.length === 0);

    const currentChatUser = useMemo(() => {
        const participants = chats.entities[chatKey]?.participants;
        if (!participants) {
            return null;
        }
        return participants.find(participant => participant._id !== userData?._id);
    }, [chats.entities, chatKey, userData?._id]);

    useEffect(() => {
        if (chats.loading) return;

        getChatMessagesByPage({
            chatId: directChatId,
            page: 1,
            limit: 3000,
            chatType: "direct",
        });
        joinChat({ chatId: directChatId, chatType: 'direct' });
    }, [directChatId, chats.loading]);

    // Reset fetching ref once loading completes
    useEffect(() => {
        if (!isLoading) {
            isFetchingRef.current = false;
        }
    }, [isLoading]);

    // Intersection observer for top (infinite scroll for older messages)
    useEffect(() => {
        const topElement = chatTopRef.current;
        const scrollContainer = chatRef.current;

        if (!topElement || !scrollContainer || !hasMore || chats.loading) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isFetchingRef.current && hasMore && !chats.loading) {
                isFetchingRef.current = true;
                getChatMessagesByPage({
                    chatId: directChatId,
                    page: (chatMessagesState?.currentPage || 1) + 1,
                    limit: 20,
                    chatType: "direct",
                });
            }
        }, {
            root: scrollContainer,
            threshold: 0.1,
        });

        observer.observe(topElement);

        return () => observer.disconnect();

    }, [directChatId, hasMore, chatMessagesState?.currentPage, chats.loading]);

    // Intersection observer for bottom (show/hide go-to-bottom button)
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


    return (
        isInitialLoading ? < center className='flex items-center justify-center h-screen w-screen' >
            <span className="loader"></span>
        </center > :
            <>
                <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#101622] relative">
                    {/* <!-- Chat Header --> */}
                    <header
                        className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="md:hidden">
                                <button className="text-slate-500 dark:text-slate-300">
                                    <span className="material-symbols-outlined">menu</span>
                                </button>
                            </div>
                            <div className="relative">
                                <div className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10"
                                    data-alt="Portrait of Sarah Miller"
                                    style={{ backgroundImage: `url("${currentChatUser?.avatarUrl}")` }}>
                                </div>
                                <span
                                    className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-[#101622]"></span>
                            </div>
                            <div>
                                <h2 className="text-base font-bold leading-tight">{currentChatUser?.displayName}</h2>
                                <p className="text-xs text-green-500 font-medium">Active now</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-[#92a4c9] dark:hover:bg-white/5 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </button>
                            <button
                                className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-[#92a4c9] dark:hover:bg-white/5 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">call</span>
                            </button>
                            <button
                                className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-[#92a4c9] dark:hover:bg-white/5 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">videocam</span>
                            </button>
                            <button
                                className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-[#92a4c9] dark:hover:bg-white/5 transition-colors xl:hidden">
                                <span className="material-symbols-outlined text-[20px]">info</span>
                            </button>
                        </div>
                    </header>
                    {/* <!-- Messages Stream --> */}
                    <div ref={chatRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col-reverse scrollbar-hide relative">

                        <div ref={chatBottomRef}>
                            {/* Bottom Sentinel */}
                        </div>

                        {
                            showGoToBottomBtn &&
                            <button onClick={() => {
                                chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
                                setShowGoToBottomBtn(false);
                            }}
                                className="text-white w-10 h-10 bg-primary p-2 rounded-full flex items-center justify-center cursor-pointer sticky ml-auto w-fit bottom-4 right-4 z-10 shadow-lg hover:opacity-90 transition-opacity">
                                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
                            </button>
                        }

                        {
                            chatMessagesState?.ids?.map(messageId => {
                                const message = messages.entities[messageId];
                                if (!message) return null;
                                const sentAt = new Date(`${message.sentAt}`);

                                const otherUser = chats.entities[chatKey]?.participants?.find(participant => participant._id !== userData?._id);

                                return (
                                    <React.Fragment key={messageId}>
                                        <ChatBubble
                                            message={message.content}
                                            isReceived={message.senderId !== userData?._id}
                                            senderAvatar={message.senderId !== userData?._id ? otherUser?.avatarUrl : null}
                                            msgDateTime={sentAt}
                                        />
                                    </React.Fragment>
                                );
                            })
                        }
                        <div
                            ref={chatTopRef}
                            style={{ overflowAnchor: 'none' }}
                            className="w-full flex justify-center py-2 min-h-[1px]"
                        >
                            {isLoading && !isInitialLoading && (
                                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                    <span>Loading older messages...</span>
                                </div>
                            )}
                            {!hasMore && (chatMessagesState?.ids?.length || 0) > 0 && (
                                <div className="text-xs text-slate-400/60 py-2">
                                    Beginning of conversation
                                </div>
                            )}
                        </div>

                    </div>
                    {/* <!-- Input Area --> */}
                    <SendMessageInput inputType="direct" chatId={directChatId} currentChatUser={currentChatUser} />
                </main >
                {/* <!-- Right Details Sidebar --> */}
                < DirectMessageProfile currentChatUser={currentChatUser} />

                {showManageContactModal && <ManageContactModal onClose={() => setShowManageContactModal(false)} />}

            </>
    )
}

export default DirectMessage