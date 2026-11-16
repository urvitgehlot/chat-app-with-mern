import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, X, Search, Loader2, Check, AlertCircle } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';
import IconButton from '../../../components/ui/IconButton';
import { searchUsers } from '../../auth/authAPI';
import { useChat } from '../useChat';
import { useAuth } from '../../auth/useAuth';

const AddUserToGroupModal = ({ isOpen, onClose, groupId, existingParticipants = [], onUserAdded }) => {
    const { addUserToGroup } = useChat();
    const { userData } = useAuth();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [addingUserId, setAddingUserId] = useState(null);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setError(null);
            setSuccessMsg(null);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Live search users
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const timer = setTimeout(async () => {
            try {
                const response = await searchUsers(query.trim(), 20);
                const users = response?.data || [];
                setResults(users.filter((u) => u._id !== userData?._id));
            } catch (err) {
                console.error("Search users for group error:", err);
                setError(err.response?.data?.message || "Failed to search users");
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, userData?._id]);

    if (!isOpen) return null;

    const existingMemberIds = new Set(
        existingParticipants.map((p) => (p._id || p).toString())
    );

    const handleAddUser = async (targetUser) => {
        if (addingUserId) return;

        setAddingUserId(targetUser._id);
        setError(null);
        setSuccessMsg(null);

        try {
            await addUserToGroup({
                groupId,
                userId: targetUser._id,
            });

            setSuccessMsg(`Added ${targetUser.displayName || targetUser.username} to group!`);

            if (onUserAdded) {
                onUserAdded(targetUser);
            }
        } catch (err) {
            console.error("Add user to group error:", err);
            setError(err.response?.data?.message || err.message || "Failed to add user to group");
        } finally {
            setAddingUserId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-popup select-none">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-2xl flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <UserPlus size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary">
                                Add Member to Group
                            </h3>
                            <p className="text-xs text-text-muted mt-0.5">
                                Search for a user to add them directly
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

                {/* Search Bar */}
                <div className="p-4 border-b border-border/60 shrink-0">
                    <div className="relative flex items-center w-full rounded-xl bg-bg-card border border-border focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                        <Search className="size-4 text-text-muted ml-3 shrink-0" strokeWidth={2} />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-transparent border-none text-xs sm:text-sm text-text-primary placeholder:text-text-muted px-2.5 py-2.5 focus:outline-none"
                            placeholder="Search by name or @username..."
                            type="text"
                        />
                        {isLoading ? (
                            <Loader2 className="size-4 text-primary animate-spin mr-3 shrink-0" />
                        ) : query ? (
                            <button
                                onClick={() => {
                                    setQuery('');
                                    inputRef.current?.focus();
                                }}
                                className="mr-2 p-1 text-text-muted hover:text-text-primary rounded cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* Notifications Banner */}
                {error && (
                    <div className="m-3 p-2.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="m-3 p-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                        <Check size={14} className="shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Results List */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-2 min-h-[220px]">
                    {!query.trim() ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                            <p className="text-xs font-semibold text-text-secondary">Type to search users</p>
                            <p className="text-[11px] text-text-muted mt-0.5">Find registered users to invite into this group</p>
                        </div>
                    ) : isLoading && results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-text-muted text-xs">
                            <Loader2 size={22} className="animate-spin text-primary mb-2" />
                            <span>Searching users...</span>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                            <p className="text-xs font-semibold text-text-secondary">No users found</p>
                            <p className="text-[11px] text-text-muted mt-0.5">No registered users matched "{query}"</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {results.map((user) => {
                                const isAlreadyMember = existingMemberIds.has(user._id);
                                const isBeingAdded = addingUserId === user._id;

                                return (
                                    <div
                                        key={user._id}
                                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-bg-hover transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar
                                                src={user.avatarUrl}
                                                name={user.displayName || "User"}
                                                size="md"
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-text-primary leading-tight truncate">
                                                    {user.displayName || "Unknown User"}
                                                </span>
                                                <span className="text-xs text-text-muted truncate">
                                                    @{user.username || "user"}
                                                </span>
                                            </div>
                                        </div>

                                        {isAlreadyMember ? (
                                            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-bg-card border border-border text-text-muted">
                                                Member
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={isBeingAdded}
                                                onClick={() => handleAddUser(user)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-hover transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                                            >
                                                {isBeingAdded ? (
                                                    <Loader2 size={13} className="animate-spin" />
                                                ) : (
                                                    <UserPlus size={13} />
                                                )}
                                                <span>Add</span>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddUserToGroupModal;

