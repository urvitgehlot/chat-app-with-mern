import { useState } from "react";
import { useChat } from "../useChat";
import { useAuth } from "../../auth/useAuth";


function SendMessageInput({ inputType = "direct" }) {

    const [message, setMessage] = useState();
    const { sendMessage, currentChat } = useChat();
    const { userData } = useAuth();

    const submitMessage = () => {
        if (!message) {
            return
        }
        setMessage("");
        sendMessage({ content: message, chatType: inputType, chatId: currentChat?.chatId, sentTo: currentChat?.user?._id })
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (e.shiftKey) {
                return;
            } else {
                e.preventDefault();
                submitMessage();
            }
        }
    };
    // console.log(`User: ${userData?._id}, and participant: ${currentChat?.participants.find(user => user._id !== userData._id)}`)

    return (
        <div className="p-4 md:p-6 bg-white dark:bg-[#101622] border-t border-gray-200 dark:border-white/10 shrink-0">
            <div
                className="flex items-end gap-2 bg-slate-50 dark:bg-[#161b26] p-2 rounded-xl border border-transparent focus-within:border-primary/50 transition-colors">
                <button
                    className="h-10 w-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-[#232f48] transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[22px]">add_circle</span>
                </button>
                <div className="flex-1 py-2">
                    <textarea
                        value={message}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:ring-0 p-0 resize-none max-h-32"
                        placeholder="Type a message..." rows="1"></textarea>
                </div>
                <button
                    className="h-10 w-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-[#232f48] transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[22px] icon-filled">sentiment_satisfied</span>
                </button>
                <button
                    onClick={(e) => {
                        submitMessage();
                    }}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-white shadow-md hover:bg-blue-600 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[20px] icon-filled">send</span>
                </button>
            </div>
        </div >
    )
}

export default SendMessageInput;