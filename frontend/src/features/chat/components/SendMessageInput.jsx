import { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, Smile, X, FileText } from "lucide-react";
import { useChat } from "../useChat";
import { useAuth } from "../../auth/useAuth";
import { validateAndCreateMessage } from "../message.schema";

const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

function SendMessageInput({ inputType = "direct", chatId, currentChatUser }) {
    const [message, setMessage] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);

    const { sendMessage } = useChat();
    const { userData } = useAuth();

    const quickEmojis = ["👍", "❤️", "🔥", "😂", "🎉", "🙌", "✨", "🚀", "👏", "😊"];

    // Auto-expand textarea height as user types
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
        }
    }, [message]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Revoke object URLs on unmount / change to avoid memory leaks
    useEffect(() => {
        return () => {
            attachments.forEach((att) => {
                if (att.previewUrl) {
                    URL.revokeObjectURL(att.previewUrl);
                }
            });
        };
    }, [attachments]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const newAttachments = files.map((file) => ({
            id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        }));

        setAttachments((prev) => [...prev, ...newAttachments]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveAttachment = (idToRemove) => {
        setAttachments((prev) => {
            const item = prev.find((att) => att.id === idToRemove);
            if (item?.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
            }
            return prev.filter((att) => att.id !== idToRemove);
        });
    };

    const submitMessage = () => {
        const trimmed = (message || "").trim();
        if (!trimmed && attachments.length === 0) return;

        const contentToSend = trimmed || (attachments.length === 1 
            ? `[File: ${attachments[0].name}]` 
            : `[${attachments.length} Attachments]`);

        const validatedMessage = validateAndCreateMessage({
            tempId: crypto.randomUUID(),
            content: contentToSend,
            chatType: inputType,
            chatId: chatId,
            senderId: userData?._id,
            sendByMe: true,
            sentTo: currentChatUser,
            sentAt: Date.now(),
        });

        sendMessage({ message: validatedMessage });
        setMessage("");
        setAttachments([]);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

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

    const handleAddEmoji = (emoji) => {
        setMessage((prev) => (prev ? prev + emoji : emoji));
        setShowEmojiPicker(false);
        textareaRef.current?.focus();
    };

    const canSend = Boolean((message && message.trim().length > 0) || attachments.length > 0);

    return (
        <div className="relative p-3 sm:p-4 bg-bg-surface border-t border-border shrink-0 select-none">
            {/* Quick Emoji Popover */}
            {showEmojiPicker && (
                <div
                    ref={emojiPickerRef}
                    className="absolute bottom-20 left-4 sm:left-6 p-2 rounded-xl bg-bg-elevated border border-border shadow-2xl z-30 animate-popup flex flex-wrap gap-1 max-w-[240px]"
                >
                    {quickEmojis.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => handleAddEmoji(emoji)}
                            className="size-8 flex items-center justify-center text-lg rounded-lg hover:bg-bg-hover hover:scale-115 transition-all cursor-pointer"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Hidden Attachment input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Attachment Preview Bar at top of enter message component */}
            {attachments.length > 0 && (
                <div className="flex items-center gap-2 mb-2.5 overflow-x-auto pb-1 max-h-36 scrollbar-thin">
                    {attachments.map((att) => {
                        const isImage = att.type.startsWith("image/");
                        return (
                            <div
                                key={att.id}
                                className="relative flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-bg-card border border-border shadow-xs shrink-0 max-w-[220px]"
                            >
                                {isImage && att.previewUrl ? (
                                    <img
                                        src={att.previewUrl}
                                        alt={att.name}
                                        className="size-11 rounded-lg object-cover border border-border/50 shrink-0"
                                    />
                                ) : (
                                    <div className="size-11 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0 text-primary">
                                        <FileText size={20} />
                                    </div>
                                )}
                                <div className="flex flex-col min-w-0 pr-2">
                                    <span className="text-xs font-medium text-text-primary truncate" title={att.name}>
                                        {att.name}
                                    </span>
                                    <span className="text-[10px] text-text-muted">
                                        {formatFileSize(att.size)}
                                    </span>
                                </div>
                                {/* Deselect / Remove button */}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAttachment(att.id)}
                                    title="Deselect attachment"
                                    className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-bg-elevated border border-border shadow-xs flex items-center justify-center text-text-muted hover:text-rose-400 hover:bg-bg-hover transition-colors cursor-pointer"
                                >
                                    <X size={12} strokeWidth={2.2} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Composer Box */}
            <div className="flex items-end gap-2 bg-bg-card p-1.5 sm:p-2 rounded-2xl border border-border focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-inner">
                {/* Attachment Button */}
                <button
                    type="button"
                    title="Attach file"
                    onClick={() => fileInputRef.current?.click()}
                    className="size-9 flex items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors shrink-0 cursor-pointer"
                >
                    <Paperclip size={18} strokeWidth={1.8} />
                </button>

                {/* Input Textarea */}
                <div className="flex-1 py-1.5 min-h-[36px] flex items-center">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:ring-0 p-0 resize-none max-h-36 leading-relaxed select-text"
                        placeholder="Write a message... (Enter to send, Shift+Enter for newline)"
                        rows={1}
                    />
                </div>

                {/* Emoji Trigger */}
                <button
                    type="button"
                    title="Emojis"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="size-9 flex items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors shrink-0 cursor-pointer hidden sm:flex"
                >
                    <Smile size={18} strokeWidth={1.8} />
                </button>

                {/* Send Button */}
                <button
                    type="button"
                    onClick={submitMessage}
                    disabled={!canSend}
                    title="Send message"
                    className={`size-9 flex items-center justify-center rounded-xl transition-all duration-150 shrink-0 cursor-pointer ${canSend
                            ? "bg-primary hover:bg-primary-hover text-white shadow-sm shadow-primary/30 active:scale-95"
                            : "bg-bg-elevated text-text-muted/50 cursor-not-allowed"
                        }`}
                >
                    <ArrowUp size={18} strokeWidth={2.2} />
                </button>
            </div>
        </div>
    );
}

export default SendMessageInput;