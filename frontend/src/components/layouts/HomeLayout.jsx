import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { recentUserMessages } from '../../data/users'
import RecentMessageComponent from '../../features/chat/components/RecentMessageComponent'
import { useDispatch, useSelector } from 'react-redux'
import { restoreAuth } from '../../features/chat/chatSlice'
import { useChat } from '../../features/chat/useChat'

function HomeLayout() {
    const [recentMessages, setRecentMessages] = useState([]);

    const { getRecentChats, recentChats, recentChatsStatus, recentChatsError } = useChat();

    const dispatch = useDispatch();
    const { status, userData } = useSelector((state) => state.auth);

    useEffect(() => {
        if (recentChatsStatus === "not-fetched") {
            getRecentChats();
        }

        // setRecentMessages(recentUserMessages)

        if (status && userData) {
            dispatch(restoreAuth());
        }

    }, [dispatch, status, userData])
    if (recentChatsStatus === "pending" || recentChatsStatus === "not-fetched") {
        return (
            <center className='flex items-center justify-center h-screen w-screen'>
                <span className="loader"></span>
            </center>
        );
    }
    console.log("recentChats: ", typeof recentChats);
    return (
        <div className="flex h-screen w-full">
            {/* <!-- LEFT SIDEBAR --> */}
            <aside
                className="flex w-full md:w-[380px] lg:w-[420px] flex-col border-r border-[#232f48] bg-sidebar-dark shrink-0 h-full">
                {/* <!-- Sidebar Header --> */}
                <header className="flex items-center justify-between px-5 py-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border border-[#232f48] relative cursor-pointer"
                            data-alt="User profile avatar showing a smiling person"
                            style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuC9_lCAAqDJq-t0U1TtA5BLSXC5GWOBTZINui2wwx87MiIhZgDL51SSQOUvQ7Sdiz8N9LitMPE8NZP-9Jqj9H9BDIPD06Th5Ysahcinx_BYaE9pssTYepf2lUspeEUQC-D2NABcQr2Cn5EbfqN7YqJYc4NjsJxyybqcLwB7LYIxHspB1EWaQ2ARLcdW5Zqfes7FBqqq8ULsGYc3mTi0t8kQYMOP3FP9nE4NlUf_c55O2OD8oFXY4ECedWdWralpjP8-stu2zVGja-s")` }}>
                            <span
                                className="absolute bottom-0 right-0 size-3 bg-[#0bda5e] border-2 border-sidebar-dark rounded-full"></span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="flex items-center justify-center size-10 rounded-full hover:bg-surface-dark transition-colors text-[#92a4c9] hover:text-white">
                            <span className="material-symbols-outlined text-[24px]">chat_add_on</span>
                        </button>
                        <button
                            className="flex items-center justify-center size-10 rounded-full hover:bg-surface-dark transition-colors text-[#92a4c9] hover:text-white">
                            <span className="material-symbols-outlined text-[24px]">more_vert</span>
                        </button>
                    </div>
                </header>
                {/* <!-- Search Bar --> */}
                <div className="px-5 pb-2 shrink-0">
                    <div
                        className="flex w-full items-center rounded-lg bg-surface-dark h-10 border border-transparent focus-within:border-primary/50 transition-colors">
                        <div className="flex items-center justify-center pl-3 pr-2 text-[#92a4c9]">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input
                            className="w-full bg-transparent border-none text-sm text-white placeholder-[#92a4c9] focus:ring-0 p-0 pr-3 h-full"
                            placeholder="Search or start new chat" type="text" />
                    </div>
                </div>
                {/* <!-- Filters / Tags (Optional visual flair) --> */}
                <div className="px-5 py-3 flex gap-2 shrink-0 overflow-x-auto custom-scrollbar">
                    <button
                        className="px-3 py-1 rounded-full bg-surface-dark text-xs font-medium text-white whitespace-nowrap hover:bg-primary hover:text-white transition-colors">All</button>
                    <button
                        className="px-3 py-1 rounded-full bg-transparent border border-surface-dark text-xs font-medium text-[#92a4c9] whitespace-nowrap hover:bg-surface-dark hover:text-white transition-colors">Unread</button>
                    <button
                        className="px-3 py-1 rounded-full bg-transparent border border-surface-dark text-xs font-medium text-[#92a4c9] whitespace-nowrap hover:bg-surface-dark hover:text-white transition-colors">Groups</button>
                    <button
                        className="px-3 py-1 rounded-full bg-transparent border border-surface-dark text-xs font-medium text-[#92a4c9] whitespace-nowrap hover:bg-surface-dark hover:text-white transition-colors">Archived</button>
                </div>
                {/* <!-- Chat List --> */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col scrollbar-hide">
                    {/* recentChats is a list of dictionary */}
                    {Object.entries(recentChats).map(([chatId, message]) => {

                        // console.log(message.id + "-" + message.recentMessageDate.getTime()),
                        return <RecentMessageComponent
                            key={chatId}
                            chatId={chatId}
                            userName={message['user']['username']}
                            userImage={message.user.avatarUrl}
                            recentMessage={message.content}
                            sentByCurrentUser={message.senderId === userData._id}
                            unreadCount={1}
                            recentMessageDate={message.sentAt}
                        />
                    })}

                </div>
            </aside>
            {/* <!-- RIGHT MAIN CONTENT  --> */}
            <Outlet />
        </div>
    )
}

export default HomeLayout