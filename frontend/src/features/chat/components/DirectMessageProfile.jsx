import React, { useState } from 'react';
import { X, BellOff, ShieldCheck, Copy, Check, UserX, SlidersHorizontal, Lock } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';
import IconButton from '../../../components/ui/IconButton';
import { useChat } from '../useChat';

function DirectMessageProfile({ currentChatUser, isOpen, onClose, onManageContact }) {
    const { onlineUsers } = useChat();
    const [copiedUsername, setCopiedUsername] = useState(false);

    const isOnline = currentChatUser?._id && Boolean(onlineUsers?.[currentChatUser._id]);

    const handleCopyUsername = () => {
        if (currentChatUser?.username && navigator.clipboard) {
            navigator.clipboard.writeText(`@${currentChatUser.username}`);
            setCopiedUsername(true);
            setTimeout(() => setCopiedUsername(false), 1800);
        }
    };

    return (
        <>
            {/* Backdrop for mobile / tablet */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 z-30 xl:hidden backdrop-blur-xs transition-opacity duration-200"
                />
            )}

            <aside
                className={`fixed top-0 right-0 bottom-0 z-40 w-80 max-w-[85vw] border-l border-border bg-bg-surface overflow-y-auto transition-transform duration-200 ease-out xl:static xl:z-auto xl:translate-x-0 xl:block scrollbar-hide select-none ${
                    isOpen ? 'translate-x-0 flex flex-col' : 'translate-x-full hidden xl:flex xl:flex-col'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Conversation Details
                    </span>
                    <IconButton
                        icon={X}
                        size="sm"
                        title="Close details"
                        onClick={onClose}
                        className="xl:hidden"
                    />
                </div>

                {/* Profile Hero Card */}
                <div className="p-6 flex flex-col items-center border-b border-border/80 text-center">
                    <div className="relative mb-3.5">
                        <Avatar
                            src={currentChatUser?.avatarUrl}
                            name={currentChatUser?.displayName || "User"}
                            size="xl"
                            status={isOnline ? "online" : null}
                        />
                    </div>
                    <h3 className="text-base font-bold text-text-primary leading-tight">
                        {currentChatUser?.displayName || "Direct Contact"}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                        @{currentChatUser?.username || "unknown"}
                    </p>

                    {/* Quick Action Badges */}
                    <div className="flex items-center gap-2 mt-4 w-full">
                        <button
                            onClick={handleCopyUsername}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-bg-card hover:bg-bg-hover border border-border text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                            {copiedUsername ? (
                                <>
                                    <Check size={14} className="text-emerald-400" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={14} />
                                    <span>Copy @handle</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={onManageContact}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-bg-card hover:bg-bg-hover border border-border text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                            <SlidersHorizontal size={14} />
                            <span>Manage</span>
                        </button>
                    </div>
                </div>

                {/* About / Status Section */}
                <div className="p-5 border-b border-border/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2">
                        About
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed bg-bg-card/50 p-3 rounded-xl border border-border/40">
                        {currentChatUser?.bio || "Hey there! I am using Chatter."}
                    </p>
                </div>

                {/* Security & Privacy Details */}
                <div className="p-5 border-b border-border/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2.5">
                        Security
                    </span>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-card/30 border border-border/40">
                        <Lock size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-text-primary">End-to-end Encryption</p>
                            <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">
                                Messages and calls are secured between your verified devices.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions / Danger Zone */}
                <div className="p-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2.5">
                        Preferences
                    </span>
                    <div className="flex flex-col gap-1.5">
                        <button
                            onClick={onManageContact}
                            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-bg-card text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-left"
                        >
                            <BellOff size={16} className="text-text-muted" />
                            <span className="text-xs font-medium">Notification Settings</span>
                        </button>
                        <button
                            onClick={onManageContact}
                            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer text-left"
                        >
                            <UserX size={16} className="text-rose-400" />
                            <span className="text-xs font-medium">Block Contact</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default DirectMessageProfile;