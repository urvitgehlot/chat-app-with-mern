import { formatedSmartDate } from "../../utils/date";

function ChatBubble({ isReceived, senderAvatar, message, msgDateTime }) {
    const formatedDateTime = formatedSmartDate({ date: msgDateTime });
    return (
        <div className={`flex items-end gap-3 group ${!isReceived ? 'justify-end' : ''}`} >
            {isReceived && <div className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 shrink-0 mb-1"
                data-alt="Sarah's Avatar"
                style={{ backgroundImage: `url("${senderAvatar}")` }}>
            </div>}
            <div className={`flex flex-col gap-1 max-w-[80%] md:max-w-[60%] ${!isReceived ? 'items-end' : ''}`}>
                <div
                    className={`rounded-2xl px-4 py-3  shadow-sm ${!isReceived ? 'bg-primary text-white rounded-br-none' : 'bg-slate-100 dark:bg-[#232f48] text-slate-800 dark:text-white rounded-bl-none'}`}>
                    <p className="text-sm leading-relaxed">{message}</p>
                </div>
                <div className={`${!isReceived ? 'flex items-center gap-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
                    <span
                        className={`text-[11px] text-slate-400 dark:text-slate-500 ${!isReceived ? '' : 'ml-1 opacity-0 group-hover:opacity-100 transition-opacity'}`}>{formatedDateTime}</span>
                    {!isReceived && <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>}
                </div>
            </div>
        </div >
    )
}

export default ChatBubble