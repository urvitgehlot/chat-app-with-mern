import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, CheckCheck, Users } from 'lucide-react';
import { formatedSmartDate } from '../../../utils/date';
import { useAuth } from '../../auth/useAuth';
import { useChat } from '../useChat';
import { createChatKey } from '../../../utils/chatKey';
import Avatar from '../../../components/ui/Avatar';

function RecentMessageComponent({ chat }) {
    const { messages, activeChatKey, onlineUsers } = useChat();
    const { userData } = useAuth();
    const params = useParams();

    const { chatId, chatType, lastMessageId, unreadCount, name } = chat;
    const lastMessage = messages.entities[lastMessageId];

    // Current chat active check
    const currentParamId = params.directChatId || params.directMsgId || params.id;
    const isSelected = activeChatKey === createChatKey(chatType, chatId) || currentParamId === chatId;

    const isGroup = chatType === "group";

    const chatUser = useMemo(() => {
        if (chatType === "direct") {
            return chat.participants?.find((participant) => participant._id !== userData?._id);
        }
        return null;
    }, [chatType, chat.participants, userData?._id]);

    const formattedDate = useMemo(() => {
        if (!lastMessage?.sentAt) return "";
        try {
            return formatedSmartDate({ date: new Date(lastMessage.sentAt) });
        } catch {
            return "";
        }
    }, [lastMessage?.sentAt]);

    const lastMsgSenderId =
        typeof lastMessage?.senderId === 'object'
            ? lastMessage.senderId?._id
            : lastMessage?.senderId;
    const isSentByMe = Boolean(
        lastMessage && (lastMsgSenderId === userData?._id || lastMessage.sendByMe)
    );

    // Online presence check
    const isUserOnline = chatUser?._id && Boolean(onlineUsers?.[chatUser._id]);

    const chatLink = isGroup ? `/group-chat/${chatId}` : `/direct-chat/${chatId}`;
    const displayName = isGroup ? (name || "Group Chat") : (chatUser?.displayName || "Unknown User");

    return (
        <Link 
            to={chatLink}
            className="block no-underline outline-none focus-visible:bg-bg-hover"
        >
            <div
                className={`relative flex items-center gap-3 px-3.5 py-3 mx-2 my-0.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected
                        ? "bg-bg-active text-text-primary shadow-xs"
                        : "hover:bg-bg-hover text-text-secondary hover:text-text-primary"
                }`}
            >
                {/* Active Indicator Bar */}
                {isSelected && (
                    <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-primary rounded-full" />
                )}

                {/* Avatar with Status */}
                {isGroup ? (
                    chat.avatarUrl ? (
                        <Avatar
                            src={chat.avatarUrl}
                            name={displayName}
                            size="md"
                        />
                    ) : (
                        <div className="size-10 rounded-xl bg-gradient-to-tr from-primary/20 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                            <Users size={18} />
                        </div>
                    )
                ) : (
                    <Avatar
                        src={chatUser?.avatarUrl}
                        name={chatUser?.displayName || "User"}
                        size="md"
                        status={isUserOnline ? "online" : null}
                    />
                )}

                {/* Content Area */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                        <span className={`text-sm font-semibold truncate ${isSelected ? 'text-text-primary' : 'text-slate-200'}`}>
                            {displayName}
                        </span>
                        {formattedDate && (
                            <span className="text-[11px] font-medium text-text-muted shrink-0 ml-2 tracking-tight">
                                {formattedDate}
                            </span>
                        )}
                    </div>

                    <div className="flex justify-between items-center gap-2">
                        <p className="text-xs text-text-secondary truncate leading-normal">
                            {isSentByMe && <span className="text-text-muted font-normal">You: </span>}
                            {lastMessage?.content || "No messages yet"}
                        </p>

                        {/* Read receipt / Unread counter */}
                        {isSentByMe ? (
                            <span className="shrink-0" title={lastMessage?.isRead ? "Read" : "Sent"}>
                                {lastMessage?.isRead ? (
                                    <CheckCheck className="size-3.5 text-primary stroke-[2.2]" />
                                ) : (
                                    <Check className="size-3.5 text-text-muted stroke-[2]" />
                                )}
                            </span>
                        ) : unreadCount > 0 ? (
                            <div className="flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full bg-primary shrink-0 shadow-xs">
                                <span className="text-[10px] font-bold text-white leading-none">
                                    {unreadCount}
                                </span>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default RecentMessageComponent;