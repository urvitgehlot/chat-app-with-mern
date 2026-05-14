import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { formatedSmartDate } from '../../../utils/date';

function RecentMessageComponent({
    chatId,
    userImage,
    userName,
    recentMessage,
    unreadCount,
    sentByCurrentUser,
    recentMessageDate,
    isOpened
}) {
    const [isMouseInsideRecentMessage, setIsMouseInsideRecentMessage] = useState(false);
    const formatedDate = formatedSmartDate({ date: new Date(recentMessageDate) });

    return (
        <Link to={`/direct-chat/${chatId}`} onMouseEnter={() => { setIsMouseInsideRecentMessage(true) }} onMouseLeave={() => { setIsMouseInsideRecentMessage(false) }}>
            < div
                className="group flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-surface-dark/50 transition-colors border-l-[3px] border-primary bg-surface-dark/30" >
                <div className="relative shrink-0">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full size-12"
                        data-alt={`Portrait of ${userName}`}
                        style={{ backgroundImage: `url(${userImage})` }}>
                    </div>
                    <span
                        className="absolute bottom-0 right-0 size-3 bg-[#0bda5e] border-2 border-sidebar-dark rounded-full"></span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-white text-base font-semibold truncate">{userName}</p>
                        <p className="text-primary text-xs font-medium">{formatedDate}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-white text-sm font-medium truncate pr-2">{recentMessage}</p>
                        {/* <!-- Read receipt icon -->
                    <span className="material-symbols-outlined text-[16px] text-primary">done_all</span> */}
                        {
                            unreadCount > 0 && (
                                <div className="flex items-center justify-center size-5 rounded-full bg-primary shrink-0">
                                    <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div >
        </Link>
    )
}

export default RecentMessageComponent