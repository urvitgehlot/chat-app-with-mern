import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Search, X, MessageSquarePlus, MoreVertical, LogOut, User, Sparkles, Filter, UserPlus, MessageSquare, Loader2 } from 'lucide-react';
import RecentMessageComponent from '../../features/chat/components/RecentMessageComponent';
import UserSearchModal from '../../features/chat/components/UserSearchModal';
import { useChat } from '../../features/chat/useChat';
import { useAuth } from '../../features/auth/useAuth';
import { searchUsers } from '../../features/auth/authAPI';
import Avatar from '../ui/Avatar';
import IconButton from '../ui/IconButton';
import { ChatListSkeleton } from '../ui/Skeleton';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

function HomeLayout() {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();
    const searchInputRef = useRef(null);

    const { chats, getRecentChats, messages, onlineUsers, createDirectChat } = useChat();
    const { status, userData, logout } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'find-users'
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showUserSearchModal, setShowUserSearchModal] = useState(false);
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(null);
    const menuRef = useRef(null);

    // If directChatId exists or we are inside a chat route, a chat is active
    const isChatActive = Boolean(params.directChatId || params.directMsgId || location.pathname.startsWith('/direct-chat/'));

    useEffect(() => {
        getRecentChats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // }, [status, userData]);
    }, [userData?._id]);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Global keyboard shortcut: Cmd+K / Ctrl+K focuses search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                setSearchQuery('');
                searchInputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Filter and search conversations
    const filteredChatIds = useMemo(() => {
        if (!chats.id || !chats.entities) return [];

        return chats.id.filter((chatId) => {
            const chat = chats.entities[chatId];
            if (!chat) return false;

            // Filter tab logic
            if (activeFilter === 'unread' && (!chat.unreadCount || chat.unreadCount === 0)) {
                return false;
            }

            // Search query logic
            if (!searchQuery.trim()) return true;

            const q = searchQuery.toLowerCase().trim();
            const otherParticipant = chat.participants?.find((p) => p._id !== userData?._id);
            const nameMatch = otherParticipant?.displayName?.toLowerCase().includes(q) ||
                otherParticipant?.username?.toLowerCase().includes(q);

            const lastMessage = messages.entities[chat.lastMessageId];
            const messageMatch = lastMessage?.content?.toLowerCase().includes(q);

            return nameMatch || messageMatch;
        });
    }, [chats.id, chats.entities, activeFilter, searchQuery, userData?._id, messages.entities]);

    // Live search users when on find-users tab
    useEffect(() => {
        if (activeFilter !== 'find-users' || !searchQuery.trim()) {
            setSearchedUsers([]);
            setIsSearchingUsers(false);
            return;
        }

        setIsSearchingUsers(true);
        const timer = setTimeout(async () => {
            try {
                const response = await searchUsers(searchQuery.trim(), 20);
                const users = response?.data || [];
                setSearchedUsers(users.filter((u) => u._id !== userData?._id));
            } catch (err) {
                console.error("Live search users error:", err);
            } finally {
                setIsSearchingUsers(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [activeFilter, searchQuery, userData?._id]);

    const handleStartDirectChatWithUser = async (targetUser) => {
        if (isStartingChat) return;

        const existingChatKey = chats.id.find((chatKey) => {
            const chat = chats.entities[chatKey];
            if (!chat || chat.chatType !== 'direct') return false;
            return chat.participants?.some((p) => (p._id || p) === targetUser._id);
        });

        if (existingChatKey) {
            const existingChat = chats.entities[existingChatKey];
            navigate(`/direct-chat/${existingChat.chatId}`);
            return;
        }

        try {
            setIsStartingChat(targetUser._id);
            const directChat = await createDirectChat(targetUser._id);
            if (directChat?._id) {
                navigate(`/direct-chat/${directChat._id}`);
            }
        } catch (err) {
            console.error("Failed to start direct chat:", err);
        } finally {
            setIsStartingChat(null);
        }
    };

    const handleLogout = () => {
        setShowUserMenu(false);
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-bg-app">
            {/* SIDEBAR NAVIGATION / CONVERSATIONS */}
            <aside
                className={`flex w-full md:w-[360px] lg:w-[400px] flex-col border-r border-border bg-bg-surface shrink-0 h-full select-none ${isChatActive ? 'hidden md:flex' : 'flex'
                    }`}
            >
                {/* User Header */}
                <header className="relative flex items-center justify-between px-4 py-3.5 shrink-0 border-b border-border/60">
                    <div
                        onClick={() => setShowUserMenu((prev) => !prev)}
                        className="flex items-center gap-3 cursor-pointer group p-1 -m-1 rounded-xl hover:bg-bg-hover transition-colors min-w-0"
                    >
                        <Avatar
                            src={userData?.avatarUrl}
                            name={userData?.displayName || "User"}
                            size="md"
                            status="online"
                        />
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-text-primary leading-tight truncate group-hover:text-primary transition-colors">
                                {userData?.displayName || "User"}
                            </span>
                            <span className="text-xs text-text-muted truncate">
                                @{userData?.username || "online"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 relative" ref={menuRef}>
                        <IconButton
                            icon={UserPlus}
                            size="md"
                            title="Find users / Start new chat"
                            onClick={() => setShowUserSearchModal(true)}
                        />
                        <IconButton
                            icon={MoreVertical}
                            size="md"
                            title="Account menu"
                            active={showUserMenu}
                            onClick={() => setShowUserMenu((prev) => !prev)}
                        />

                        {/* User Menu Dropdown */}
                        {showUserMenu && (
                            <div className="absolute right-0 top-11 w-52 rounded-xl bg-bg-elevated border border-border shadow-2xl p-1.5 z-50 animate-popup">
                                <div className="px-3 py-2 border-b border-border/50 mb-1">
                                    <p className="text-xs font-semibold text-text-primary truncate">{userData?.displayName}</p>
                                    <p className="text-[11px] text-text-muted truncate">{userData?.email}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        navigate('/profile-complete');
                                    }}
                                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
                                >
                                    <User size={15} />
                                    <span>Edit Profile</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                >
                                    <LogOut size={15} />
                                    <span>Log out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Search Bar with Command Hint */}
                <div className="px-3.5 pt-3 pb-1.5 shrink-0">
                    <div className="relative flex items-center w-full rounded-xl bg-bg-card border border-border focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                        <Search className="size-4 text-text-muted ml-3 shrink-0" strokeWidth={2} />
                        <input
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none text-xs sm:text-sm text-text-primary placeholder:text-text-muted px-2.5 py-2 focus:outline-none"
                            placeholder={activeFilter === 'find-users' ? "Search users by name or @username..." : "Search conversations..."}
                            type="text"
                        />
                        {searchQuery ? (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    searchInputRef.current?.focus();
                                }}
                                className="mr-2 p-1 text-text-muted hover:text-text-primary rounded cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        ) : (
                            <kbd className="hidden sm:inline-flex items-center mr-2 px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-bg-surface border border-border/80 rounded">
                                ⌘K
                            </kbd>
                        )}
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="px-3.5 py-2 flex items-center gap-1.5 shrink-0 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${activeFilter === 'all'
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveFilter('unread')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${activeFilter === 'unread'
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                            }`}
                    >
                        Unread
                    </button>
                    <button
                        onClick={() => setActiveFilter('find-users')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${activeFilter === 'find-users'
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                            }`}
                    >
                        <UserPlus size={12} />
                        <span>Find Users</span>
                    </button>
                </div>

                {/* Sidebar Content Area */}
                {activeFilter === 'find-users' ? (
                    <div className="flex-1 overflow-y-auto scrollbar-hide px-2 py-1">
                        {!searchQuery.trim() ? (
                            <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
                                <div className="size-10 rounded-full bg-bg-card border border-border flex items-center justify-center text-text-muted mb-2">
                                    <UserPlus size={18} />
                                </div>
                                <p className="text-xs font-semibold text-text-secondary">Search registered users</p>
                                <p className="text-[11px] text-text-muted mt-0.5">Type a display name or @username above to find people</p>
                            </div>
                        ) : isSearchingUsers ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center text-text-muted text-xs">
                                <Loader2 size={20} className="animate-spin text-primary mb-2" />
                                <span>Searching users...</span>
                            </div>
                        ) : searchedUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
                                <p className="text-xs font-semibold text-text-secondary">No users found</p>
                                <p className="text-[11px] text-text-muted mt-0.5">No registered users matched "{searchQuery}"</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {searchedUsers.map((user) => {
                                    const isUserOnline = Boolean(onlineUsers?.[user._id]);
                                    const isTargetStarting = isStartingChat === user._id;
                                    const existingChatKey = chats.id.find((chatKey) => {
                                        const chat = chats.entities[chatKey];
                                        return chat?.chatType === 'direct' && chat?.participants?.some((p) => (p._id || p) === user._id);
                                    });

                                    return (
                                        <div
                                            key={user._id}
                                            onClick={() => handleStartDirectChatWithUser(user)}
                                            className="flex items-center justify-between p-2.5 mx-1 rounded-xl hover:bg-bg-hover transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar
                                                    src={user.avatarUrl}
                                                    name={user.displayName || "User"}
                                                    size="md"
                                                    status={isUserOnline ? "online" : null}
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
                                                disabled={isTargetStarting}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                                            >
                                                {isTargetStarting ? (
                                                    <Loader2 size={13} className="animate-spin" />
                                                ) : (
                                                    <MessageSquare size={13} />
                                                )}
                                                <span>{existingChatKey ? "Open" : "Chat"}</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Conversation List */
                    <div className="flex-1 overflow-y-auto scrollbar-hide py-1">
                        {chats.loading ? (
                            <ChatListSkeleton count={7} />
                        ) : filteredChatIds.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
                                <p className="text-xs font-medium text-text-muted">
                                    {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                                </p>
                                <p className="text-[11px] text-text-disabled mt-1">
                                    {searchQuery ? 'Try searching a different name or keyword' : 'New messages will appear here'}
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setActiveFilter('find-users')}
                                        className="mt-3 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                        <UserPlus size={13} />
                                        <span>Search all users for "{searchQuery}"</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredChatIds.map((chatId) => {
                                const chat = chats.entities[chatId];
                                if (!chat) return null;
                                return <RecentMessageComponent key={chatId} chat={chat} />;
                            })
                        )}
                    </div>
                )}
            </aside>

            {/* MAIN STAGE / CONVERSATION AREA */}
            <Outlet />

            {/* Find Users / New Chat Modal */}
            <UserSearchModal
                isOpen={showUserSearchModal}
                onClose={() => setShowUserSearchModal(false)}
            />
        </div>
    );
}

export default HomeLayout;