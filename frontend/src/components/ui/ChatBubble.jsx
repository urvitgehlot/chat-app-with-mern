import React, { useState } from 'react';
import { Check, CheckCheck, Copy, CheckCircle2, Smile } from 'lucide-react';
import { formatedSmartDate } from '../../utils/date';
import Avatar from './Avatar';

function ChatBubble({
    isReceived,
    senderAvatar,
    senderName,
    message,
    msgDateTime,
    status = "sent", // "sending" | "sent" | "failed"
    isRead = false,
    isFirstInGroup = true,
    isLastInGroup = true,
}) {
    const [copied, setCopied] = useState(false);
    const [reactions, setReactions] = useState([]);
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    const [showActions, setShowActions] = useState(false);
    const bubbleRef = React.useRef(null);

    // Close action bar and reaction picker on click outside
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (bubbleRef.current && !bubbleRef.current.contains(e.target)) {
                setShowActions(false);
                setShowReactionPicker(false);
            }
        };
        if (showActions || showReactionPicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showActions, showReactionPicker]);

    let formattedDateTime = "";
    try {
        formattedDateTime = formatedSmartDate({ date: msgDateTime });
    } catch {
        formattedDateTime = "";
    }

    const handleCopy = (e) => {
        e.stopPropagation();
        if (navigator.clipboard) {
            navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        }
    };

    const toggleReaction = (emoji) => {
        setReactions((prev) => {
            if (prev.includes(emoji)) {
                return prev.filter((r) => r !== emoji);
            }
            return [...prev, emoji];
        });
        setShowReactionPicker(false);
        setShowActions(false);
    };

    const availableEmojis = ['👍', '❤️', '🔥', '😂', '🎉'];

    // Grouping radius calculation for sleek chat bubbles
    const getSentRadius = () => {
        if (isFirstInGroup && isLastInGroup) return 'rounded-2xl rounded-br-sm';
        if (isFirstInGroup) return 'rounded-2xl rounded-br-sm';
        if (isLastInGroup) return 'rounded-2xl rounded-tr-sm rounded-br-sm';
        return 'rounded-2xl rounded-r-sm';
    };

    const getReceivedRadius = () => {
        if (isFirstInGroup && isLastInGroup) return 'rounded-2xl rounded-bl-sm';
        if (isFirstInGroup) return 'rounded-2xl rounded-bl-sm';
        if (isLastInGroup) return 'rounded-2xl rounded-tl-sm rounded-bl-sm';
        return 'rounded-2xl rounded-l-sm';
    };

    return (
        <div
            className={`relative flex items-end gap-2.5 w-full select-text ${
                !isReceived ? 'justify-end' : 'justify-start'
            } ${isFirstInGroup ? 'mt-3 sm:mt-4' : 'mt-1'}`}
        >
            {/* Received Avatar (Only visible on the last message of the group) */}
            {isReceived && (
                <div className="w-8 shrink-0 flex justify-center mb-0.5">
                    {isLastInGroup ? (
                        <Avatar
                            src={senderAvatar}
                            name={senderName || "User"}
                            size="sm"
                        />
                    ) : (
                        <div className="size-8" />
                    )}
                </div>
            )}

            {/* Bubble Container */}
            <div
                ref={bubbleRef}
                className={`relative flex flex-col max-w-[85%] sm:max-w-[70%] md:max-w-[62%] ${
                    !isReceived ? 'items-end' : 'items-start'
                }`}
            >
                {/* Floating Action Bar - Only visible on message click */}
                {showActions && (
                    <div
                        className={`absolute -top-9 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-bg-elevated border border-border shadow-md animate-popup ${
                            !isReceived ? 'right-0' : 'left-0'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={handleCopy}
                            title="Copy text"
                            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
                        >
                            {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowReactionPicker((p) => !p);
                                }}
                                title="React"
                                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
                            >
                                <Smile size={13} />
                            </button>

                            {/* Reaction Picker Popup: positioned right-aligned when sent by user */}
                            {showReactionPicker && (
                                <div
                                    className={`absolute bottom-full mb-1 flex items-center gap-1 p-1 bg-bg-elevated border border-border rounded-xl shadow-xl z-30 animate-popup whitespace-nowrap ${
                                        !isReceived ? 'right-0' : 'left-0'
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {availableEmojis.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => toggleReaction(emoji)}
                                            className="p-1 hover:scale-125 transition-transform text-sm cursor-pointer"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Message Bubble Body - Click triggers actions */}
                <div
                    onClick={() => {
                        setShowActions((prev) => !prev);
                        setShowReactionPicker(false);
                    }}
                    className={`relative px-4 py-2.5 text-sm leading-relaxed break-words transition-all cursor-pointer select-text ${
                        !isReceived
                            ? `bg-primary text-white shadow-sm shadow-primary/20 ${getSentRadius()}`
                            : `bg-bg-card text-text-primary border border-border/60 ${getReceivedRadius()}`
                    }`}
                >
                    <p className="whitespace-pre-wrap">{message}</p>
                </div>

                {/* Reactions Pill List */}
                {reactions.length > 0 && (
                    <div
                        className={`flex flex-wrap gap-1 mt-1 ${
                            !isReceived ? 'justify-end mr-1' : 'justify-start ml-1'
                        }`}
                    >
                        {reactions.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => toggleReaction(emoji)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-bg-card border border-border text-xs cursor-pointer hover:border-primary/50 transition-colors"
                            >
                                <span>{emoji}</span>
                                <span className="text-[10px] text-text-muted font-medium">1</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Metadata: Timestamp & Delivery Status */}
                {isLastInGroup && (
                    <div
                        className={`flex items-center gap-1.5 mt-1 px-1 text-[11px] text-text-muted ${
                            !isReceived ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <span>{formattedDateTime}</span>

                        {!isReceived && (
                            <span title={isRead ? "Read" : status === "sending" ? "Sending" : "Delivered"}>
                                {status === "sending" ? (
                                    <span className="size-2 rounded-full border border-primary border-t-transparent animate-spin inline-block" />
                                ) : isRead ? (
                                    <CheckCheck className="size-3.5 text-indigo-400 stroke-[2.2]" />
                                ) : (
                                    <Check className="size-3.5 text-text-muted stroke-[2]" />
                                )}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatBubble;