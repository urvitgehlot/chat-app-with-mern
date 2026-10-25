import React, { useState } from "react";
import { X, BellOff, ShieldAlert, Check } from "lucide-react";
import IconButton from "../../../components/ui/IconButton";

const ManageContactModal = ({ contactUser, onClose }) => {
    const [selectedMuteDuration, setSelectedMuteDuration] = useState("8 Hours");
    const [blocked, setBlocked] = useState(false);

    const muteOptions = ["8 Hours", "1 Week", "Always"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-popup select-none">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary">
                            Manage Contact
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                            {contactUser?.displayName || "Conversation settings"}
                        </p>
                    </div>

                    <IconButton
                        icon={X}
                        size="sm"
                        title="Close"
                        onClick={onClose}
                    />
                </div>

                {/* Modal Content */}
                <div className="space-y-6 p-5">
                    {/* Mute Notifications */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-text-primary">
                            <BellOff className="size-4 text-primary" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                Mute Notifications
                            </h4>
                        </div>

                        <p className="text-xs text-text-muted leading-relaxed">
                            Silence incoming alerts and sounds for this conversation.
                        </p>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                            {muteOptions.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setSelectedMuteDuration(opt)}
                                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                                        selectedMuteDuration === opt
                                            ? "bg-primary text-white border-primary shadow-xs"
                                            : "bg-bg-card border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Block Contact */}
                    <div className="border-t border-border pt-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-rose-400">
                            <ShieldAlert className="size-4" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                                Privacy & Restrictions
                            </h4>
                        </div>

                        <p className="text-xs leading-relaxed text-text-muted">
                            Blocking this user prevents them from sending messages or viewing your activity status.
                        </p>

                        <button
                            type="button"
                            onClick={() => setBlocked((b) => !b)}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                blocked
                                    ? "bg-bg-card border border-border text-text-secondary hover:text-white"
                                    : "bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-98"
                            }`}
                        >
                            {blocked ? (
                                <>
                                    <Check size={14} className="text-emerald-400" />
                                    <span>Contact Blocked (Click to unblock)</span>
                                </>
                            ) : (
                                <span>Block Contact</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-2 bg-bg-card/40 border-t border-border px-5 py-3.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-text-primary bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageContactModal;