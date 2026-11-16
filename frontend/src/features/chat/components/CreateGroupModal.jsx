import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, X, Search, Check, AlertCircle, Loader2 } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';
import IconButton from '../../../components/ui/IconButton';
import { searchUsers } from '../../auth/authAPI';
import { useAuth } from '../../auth/useAuth';
import { useChat } from '../useChat';

const CreateGroupModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { userData } = useAuth();
    const { createGroup } = useChat();

    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const nameInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setGroupName('');
            setGroupDescription('');
            setSearchQuery('');
            setSearchedUsers([]);
            setSelectedUsers([]);
            setError(null);
            setTimeout(() => nameInputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Live search users for adding to group
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchedUsers([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        setError(null);
        const timer = setTimeout(async () => {
            try {
                const response = await searchUsers(searchQuery.trim(), 20);
                const users = response?.data || [];
                // Exclude current user from search results
                setSearchedUsers(users.filter((u) => u._id !== userData?._id));
            } catch (err) {
                console.error("Group member search error:", err);
                setError(err.response?.data?.message || "Failed to search users");
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, userData?._id]);

    if (!isOpen) return null;

    const toggleSelectUser = (user) => {
        setSelectedUsers((prev) => {
            const exists = prev.some((u) => u._id === user._id);
            if (exists) {
                return prev.filter((u) => u._id !== user._id);
            } else {
                return [...prev, user];
            }
        });
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) {
            setError('Please enter a group name');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const userIds = selectedUsers.map((u) => u._id);
            const response = await createGroup({
                name: groupName.trim(),
                description: groupDescription.trim() || undefined,
                userIds,
            });

            const newGroup = response?.data || response;
            const targetGroupId = newGroup?._id;

            onClose();

            if (targetGroupId) {
                navigate(`/group-chat/${targetGroupId}`, {
                    state: {
                        group: {
                            _id: targetGroupId,
                            name: newGroup.name || groupName.trim(),
                            description: newGroup.description || groupDescription.trim(),
                            participants: [
                                userData,
                                ...selectedUsers,
                            ].filter(Boolean),
                            createdAt: newGroup.createdAt || new Date().toISOString(),
                        }
                    }
                });
            }
        } catch (err) {
            console.error("Failed to create group:", err);
            setError(err.response?.data?.message || err.message || "Failed to create group");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-popup select-none">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary">
                                Create New Group
                            </h3>
                            <p className="text-xs text-text-muted mt-0.5">
                                Set up a group chat and invite members
                            </p>
                        </div>
                    </div>

                    <IconButton
                        icon={X}
                        size="sm"
                        title="Close"
                        onClick={onClose}
                    />
                </div>

                {/* Form / Scrollable Content */}
                <form onSubmit={handleCreateGroup} className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
                    <div className="p-5 space-y-4">
                        {error && (
                            <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Group Name Input */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                                Group Name <span className="text-rose-400">*</span>
                            </label>
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="e.g. Project Alpha, Designers, Family"
                                maxLength={60}
                                className="w-full rounded-xl bg-bg-card border border-border px-3.5 py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        {/* Group Description Input */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                                Description <span className="text-text-disabled lowercase font-normal">(optional)</span>
                            </label>
                            <textarea
                                value={groupDescription}
                                onChange={(e) => setGroupDescription(e.target.value)}
                                placeholder="What's this group about?"
                                rows={2}
                                maxLength={200}
                                className="w-full resize-none rounded-xl bg-bg-card border border-border px-3.5 py-2 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        {/* Add Members Section */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                    Add Members
                                </label>
                                <span className="text-[11px] text-text-muted font-medium">
                                    {selectedUsers.length} selected
                                </span>
                            </div>

                            {/* Selected Chips */}
                            {selectedUsers.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3 max-h-24 overflow-y-auto p-1.5 rounded-xl bg-bg-card/50 border border-border/60">
                                    {selectedUsers.map((user) => (
                                        <div
                                            key={user._id}
                                            className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary"
                                        >
                                            <Avatar
                                                src={user.avatarUrl}
                                                name={user.displayName || "User"}
                                                size="xs"
                                            />
                                            <span className="font-medium text-xs max-w-[100px] truncate">
                                                {user.displayName || user.username}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => toggleSelectUser(user)}
                                                className="text-text-muted hover:text-rose-400 transition-colors ml-0.5"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Search Member input */}
                            <div className="relative flex items-center w-full rounded-xl bg-bg-card border border-border focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                                <Search className="size-4 text-text-muted ml-3 shrink-0" strokeWidth={2} />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or @username..."
                                    type="text"
                                    className="w-full bg-transparent border-none text-xs sm:text-sm text-text-primary placeholder:text-text-muted px-2.5 py-2.5 focus:outline-none"
                                />
                                {isSearching ? (
                                    <Loader2 className="size-4 text-primary animate-spin mr-3 shrink-0" />
                                ) : searchQuery ? (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="mr-2 p-1 text-text-muted hover:text-text-primary rounded cursor-pointer"
                                    >
                                        <X size={14} />
                                    </button>
                                ) : null}
                            </div>

                            {/* Searched User List / States matching UserSearchModal */}
                            <div className="mt-2 space-y-1 max-h-52 overflow-y-auto scrollbar-hide">
                                {!searchQuery.trim() ? (
                                    <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                                        <div className="size-10 rounded-full bg-bg-card border border-border flex items-center justify-center text-text-muted mb-2">
                                            <Users size={18} />
                                        </div>
                                        <p className="text-xs font-semibold text-text-secondary">Type to search for users</p>
                                        <p className="text-[11px] text-text-muted mt-0.5">Find people by name or username to add to group</p>
                                    </div>
                                ) : isSearching && searchedUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-32 text-center text-text-muted text-xs">
                                        <Loader2 size={20} className="animate-spin text-primary mb-2" />
                                        <span>Searching users...</span>
                                    </div>
                                ) : searchedUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                                        <p className="text-xs font-semibold text-text-secondary">No users found</p>
                                        <p className="text-[11px] text-text-muted mt-0.5">No registered users matched "{searchQuery}"</p>
                                    </div>
                                ) : (
                                    searchedUsers.map((user) => {
                                        const isSelected = selectedUsers.some((u) => u._id === user._id);
                                        return (
                                            <div
                                                key={user._id}
                                                onClick={() => toggleSelectUser(user)}
                                                className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer group ${
                                                    isSelected
                                                        ? 'bg-primary/10 border border-primary/30'
                                                        : 'hover:bg-bg-hover border border-transparent'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Avatar
                                                        src={user.avatarUrl}
                                                        name={user.displayName || "User"}
                                                        size="md"
                                                    />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold text-text-primary leading-tight truncate group-hover:text-primary transition-colors">
                                                            {user.displayName || "Unknown User"}
                                                        </span>
                                                        <span className="text-xs text-text-muted truncate">
                                                            @{user.username || "user"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelectUser(user);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                                        isSelected
                                                            ? 'bg-primary text-white'
                                                            : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                                    }`}
                                                >
                                                    <Check size={13} strokeWidth={isSelected ? 2.5 : 2} />
                                                    <span>{isSelected ? "Added" : "Add"}</span>
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border p-4 bg-bg-surface/90 flex items-center justify-end gap-2 shrink-0 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!groupName.trim() || isSubmitting}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-all shadow-sm shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <Users size={14} />
                                    <span>Create Group</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;

