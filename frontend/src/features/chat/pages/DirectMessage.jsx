import React, { useEffect } from 'react'
import ChatBubble from '../../../components/ui/ChatBubble'
import DirectMessageProfile from '../components/DirectMessageProfile'
import { useParams } from 'react-router-dom'
import { useChat } from '../useChat';
import { useAuth } from '../../auth/useAuth';
import { formatedSmartDate } from '../../../utils/date';
import SendMessageInput from '../components/SendMessageInput';

function DirectMessage() {
    const { directChatId } = useParams();
    const { recentChats, getUserDirectChatMessages, currentChatMessagesStatus, currentChatMessages, currentChat, joinChat } = useChat();
    const { userData } = useAuth();

    useEffect(() => {
        getUserDirectChatMessages({ chatId: directChatId });
        joinChat({ chatId: directChatId, chatType: 'direct' });

        // return ()=> leave Chat logic for cleanup

    }, [directChatId]);


    return (
        currentChatMessagesStatus === "pending" ? <div>Loading</div> :
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
                                    style={{ backgroundImage: `url("${currentChat?.user?.avatarUrl}")` }}>
                                </div>
                                <span
                                    className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-[#101622]"></span>
                            </div>
                            <div>
                                <h2 className="text-base font-bold leading-tight">{currentChat?.user?.displayName}</h2>
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
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth flex flex-col-reverse scrollbar-hide">

                        {
                            currentChatMessages.map((message, index) => {
                                const sentAt = new Date(`${message.sentAt}`);
                                const isReceived = message.senderId._id !== userData._id;

                                // Check if we need a date divider
                                const currentDateStr = sentAt.toDateString();
                                const nextMessage = currentChatMessages[index + 1];
                                const nextDateStr = nextMessage
                                    ? new Date(`${nextMessage.sentAt}`).toDateString()
                                    : null;
                                const showDateDivider = currentDateStr !== nextDateStr;

                                return (
                                    <React.Fragment key={message._id}>
                                        {/* in this ChatBubble is using first instead of Date divider because the scroll is in reverse */}
                                        <ChatBubble
                                            message={message.content}
                                            isReceived={isReceived}
                                            senderAvatar={message.senderId.avatarUrl}
                                            msgDateTime={sentAt}
                                        />
                                        {showDateDivider ? (
                                            <div className="flex justify-center my-4">
                                                <span
                                                    className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                                                    {formatedSmartDate({ date: sentAt, showTimeIfToday: false })}
                                                </span>
                                            </div>
                                        ) : null}
                                    </React.Fragment>
                                );
                            })
                        }

                        {/* <!-- Date Divider --> */}
                        <div className="flex justify-center my-4">
                            <span
                                className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">Today</span>
                        </div>
                        {/* <!-- Incoming Message --> */}
                        <div className="flex items-end gap-3 group">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 shrink-0 mb-1"
                                data-alt="Sarah's Avatar"
                                style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuD6Cldr2VJO0-BK4MZthaGRCv09NqYQcIfEXA95hs76c4Y3DdQPIiOBhihxkRtwxZKh75kTr6_8bfPaR9MT8xjEBxncAIux_X1p2BvDHocKZ2clB8P4jQc6kVuHv5mt2nrQUr5ccUVNpKVUk1B38EKz0QCBq6EM2YKc3z1ETYzpsPWjsRdXq0vCQvxuoxCKY6v8vVouIhhurdsrs3yQrPdoY4Y_txMFuwd2a-FEBPut81_TV8LN9OpRkpbC4Phu7S-80hTqTNfZfXY")` }}>
                            </div>
                            <div className="flex flex-col gap-1 max-w-[80%] md:max-w-[60%]">
                                <div
                                    className="rounded-2xl rounded-bl-none px-4 py-3 bg-slate-100 dark:bg-[#232f48] text-slate-800 dark:text-white shadow-sm">
                                    <p className="text-sm leading-relaxed">Hey! Did you get a chance to look at the new design files I
                                        sent over earlier?</p>
                                </div>
                                <span
                                    className="text-[11px] text-slate-400 dark:text-slate-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">09:41
                                    AM</span>
                            </div>
                        </div>
                        {/* <!-- Incoming Message (Link/Attachment) --> */}
                        <div className="flex items-end gap-3 group mt-2">
                            <div className="h-8 w-8 shrink-0 mb-1"></div> {/* Spacer for alignment */}
                            <div className="flex flex-col gap-1 max-w-[80%] md:max-w-[60%]">
                                <div
                                    className="rounded-2xl rounded-bl-none px-4 py-3 bg-slate-100 dark:bg-[#232f48] text-slate-800 dark:text-white shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-[#2e3b56] transition-colors">
                                    <div
                                        className="h-10 w-10 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                                        <span className="material-symbols-outlined">picture_as_pdf</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">Project_Guidelines_v2.pdf</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">2.4 MB</p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400">download</span>
                                </div>
                                <span
                                    className="text-[11px] text-slate-400 dark:text-slate-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">09:42
                                    AM</span>
                            </div>
                        </div>
                        {/* <!-- Outgoing Message --> */}
                        <div className="flex items-end gap-3 justify-end group">
                            <div className="flex flex-col gap-1 items-end max-w-[80%] md:max-w-[60%]">
                                <div className="rounded-2xl rounded-br-none px-4 py-3 bg-primary text-white shadow-sm">
                                    <p className="text-sm leading-relaxed">Yes, I'm reviewing them right now. The color palette looks
                                        amazing! 🔥</p>
                                </div>
                                <div className="flex items-center gap-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">09:45 AM</span>
                                    <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>
                                </div>
                            </div>
                            {/* <!-- Self Avatar (Optional, often omitted in modern chats but included for symmetry if desired) --> */}
                            {/* <div className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 shrink-0 mb-1" style='background-image: url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80");'></div> */}
                        </div>
                        {/* <!-- Outgoing Message (Short) --> */}
                        <div className="flex items-end gap-3 justify-end group -mt-4">
                            <div className="flex flex-col gap-1 items-end max-w-[80%] md:max-w-[60%]">
                                <div className="rounded-2xl rounded-tr-sm rounded-br-none px-4 py-3 bg-primary text-white shadow-sm">
                                    <p className="text-sm leading-relaxed">I have one quick question about the mobile view though.</p>
                                </div>
                                <div className="flex items-center gap-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">09:46 AM</span>
                                    <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>
                                </div>
                            </div>
                        </div>
                        {/* <!-- Incoming Typing Indicator --> */}
                        <div className="flex items-end gap-3">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 shrink-0 mb-1"
                                data-alt="Sarah's Avatar"
                                style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDsy0Cu1TDJPkT1lQyfnvU2PeTo70XpNOJbwer1VmO4_lR0kIlv0cKpMmjMbEwOjmty0JPFpFB-V-WuC3qJLtBSTG4zdaSH-J27bzQjU-QNIv65CDXQW_zg-AS4Ju90Lk-R3D1Hg9GLYk9UQ7BAE9pUkgV3jdjLAcV1dn7KEw_j1TGUnP1vhzpM-zA7WCaE9nrTvQlLAdQ6k5Kssu7FRlmBu2oWNBtcuubLr6m4WZIGzWukPC24JsTMTj5Ke1SpYRpklUG2pJN37ZU")` }}>
                            </div>
                            <div
                                className="rounded-2xl rounded-bl-none px-4 py-3 bg-slate-100 dark:bg-[#232f48] shadow-sm flex items-center gap-1 h-11">
                                <span className="block w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="block w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                    style={{ animationDelay: '0.1s' }}></span>
                                <span className="block w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                    style={{ animationDelay: '0.2s' }}></span>
                            </div>
                        </div>

                        <ChatBubble
                            isReceived={false}
                            message="Hello"
                            msgDateTime={new Date(Date.now() - 1000 * 60 * 60 * 24)}
                        />
                        <ChatBubble
                            isReceived={true}
                            message="Hy User"
                            msgDateTime={new Date(Date.now() - 1000 * 60 * 60 * 24)}
                        />

                    </div>
                    {/* <!-- Input Area --> */}
                    <SendMessageInput inputType="direct" />
                </main>
                {/* <!-- Right Details Sidebar --> */}
                <DirectMessageProfile />
            </>
    )
}

export default DirectMessage