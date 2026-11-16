import React, { useState, useEffect } from 'react';
import { X, Users, BellOff, LogOut, Copy, Check, UserPlus, Edit3 } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';
import IconButton from '../../../components/ui/IconButton';
import AddUserToGroupModal from './AddUserToGroupModal';
import EditGroupModal from './EditGroupModal';
import { useAuth } from '../../auth/useAuth';

function GroupChatProfile({ group, isOpen, onClose, onUserAdded, onGroupUpdated }) {
    const { userData } = useAuth();
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditGroupModal, setShowEditGroupModal] = useState(false);
    const [avatarFailed, setAvatarFailed] = useState(false);

    useEffect(() => {
        setAvatarFailed(false);
    }, [group?.avatarUrl]);

    const participants = group?.participants || [];

    // Check if the current authenticated user is an admin of this group
    const currentMember = participants.find((p) => (p._id || p) === userData?._id);
    const isCurrentUserAdmin = Boolean(currentMember?.isAdmin);


    return (
        <>
            {/* Mobile / Tablet Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 z-30 xl:hidden backdrop-blur-xs transition-opacity duration-200"
                />
            )}

            <aside
                className={`fixed top-0 right-0 bottom-0 z-40 w-80 max-w-[85vw] border-l border-border bg-bg-surface overflow-y-auto transition-transform duration-200 ease-out xl:static xl:z-auto xl:translate-x-0 xl:block scrollbar-hide select-none ${isOpen ? 'translate-x-0 flex flex-col' : 'translate-x-full hidden xl:flex xl:flex-col'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Group Details
                    </span>
                    <div className="flex items-center gap-1">
                        {isCurrentUserAdmin && (
                            <IconButton
                                icon={Edit3}
                                size="sm"
                                title="Edit group details"
                                onClick={() => setShowEditGroupModal(true)}
                            />
                        )}
                        <IconButton
                            icon={X}
                            size="sm"
                            title="Close details"
                            onClick={onClose}
                            className="xl:hidden"
                        />
                    </div>
                </div>

                {/* Group Avatar & Info */}
                <div className="p-6 flex flex-col items-center border-b border-border/80 text-center">
                    {group?.avatarUrl && !avatarFailed ? (
                        <div className="size-20 rounded-2xl overflow-hidden mb-3 shadow-lg ring-2 ring-primary/20 border border-primary/30 flex items-center justify-center bg-bg-card shrink-0">
                            <img
                                src={group.avatarUrl}
                                alt={group.name || "Group"}
                                onError={() => setAvatarFailed(true)}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="size-20 rounded-2xl bg-gradient-to-tr from-primary/30 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-primary mb-3 shadow-lg">
                            <Users size={34} />
                        </div>
                    )}

                    <h3 className="text-base font-bold text-text-primary leading-tight">
                        {group?.name || "Group Chat"}
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                        {participants.length} {participants.length === 1 ? 'member' : 'members'}
                    </p>

                    {/* Quick Action Badges */}
                    <div className="flex items-center gap-2 mt-4 w-full">
                        {isCurrentUserAdmin && (
                            <button
                                type="button"
                                onClick={() => setShowEditGroupModal(true)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                <Edit3 size={14} />
                                <span>Edit Info</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="p-5 border-b border-border/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2">
                        Description
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed bg-bg-card/50 p-3 rounded-xl border border-border/40 whitespace-pre-wrap">
                        {group?.description || "No description provided for this group."}
                    </p>
                </div>

                {/* Members List */}
                <div className="p-5 border-b border-border/60 flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                            Members ({participants.length})
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowAddUserModal(true)}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-medium cursor-pointer"
                        >
                            <UserPlus size={13} />
                            <span>Add</span>
                        </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide pr-1">
                        {participants.map((member, index) => (
                            <div
                                key={member._id || index}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-bg-card/60 transition-colors"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <Avatar
                                        src={member.avatarUrl}
                                        name={member.displayName || "User"}
                                        size="sm"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-text-primary truncate">
                                            {member.displayName || "User"}
                                        </p>
                                        <p className="text-[11px] text-text-muted truncate">
                                            @{member.username || "member"}
                                        </p>
                                    </div>
                                </div>
                                {member.isAdmin && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary shrink-0">
                                        Admin
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Group Actions */}
                <div className="p-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2.5">
                        Options
                    </span>
                    <div className="flex flex-col gap-1.5">
                        <button
                            type="button"
                            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-bg-card text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-left"
                        >
                            <BellOff size={16} className="text-text-muted" />
                            <span className="text-xs font-medium">Mute Group</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer text-left"
                        >
                            <LogOut size={16} className="text-rose-400" />
                            <span className="text-xs font-medium">Leave Group</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Add User To Group Modal */}
            <AddUserToGroupModal
                isOpen={showAddUserModal}
                onClose={() => setShowAddUserModal(false)}
                groupId={group?._id}
                existingParticipants={participants}
                onUserAdded={(user) => {
                    if (onUserAdded) {
                        onUserAdded(user);
                    }
                }}
            />

            {/* Edit Group Info Modal (Admin Only) */}
            {isCurrentUserAdmin && (
                <EditGroupModal
                    isOpen={showEditGroupModal}
                    onClose={() => setShowEditGroupModal(false)}
                    group={group}
                    onGroupUpdated={(updatedGroup) => {
                        if (onGroupUpdated) {
                            onGroupUpdated(updatedGroup);
                        }
                    }}
                />
            )}
        </>
    );
}

export default GroupChatProfile;
