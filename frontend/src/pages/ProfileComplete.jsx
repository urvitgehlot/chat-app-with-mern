import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, ArrowRight, LogOut, CheckCircle2, User, AtSign, AlertCircle, Loader2 } from 'lucide-react';
import logo from "../assets/logo.png";
import { useAuth } from '../features/auth/useAuth';
import Avatar from '../components/ui/Avatar';

function ProfileComplete() {
    const navigate = useNavigate();
    const { userData, logout, completeProfileSetup, loading } = useAuth();

    const [displayName, setDisplayName] = useState(userData?.displayName || '');
    const [username, setUsername] = useState(userData?.username || '');
    const [bio, setBio] = useState(userData?.aboutMe || '');
    const [previewUrl, setPreviewUrl] = useState(userData?.avatarUrl || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [localError, setLocalError] = useState(null);
    const [saved, setSaved] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) {
            setLocalError('Only JPEG, PNG, and WebP images are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setLocalError('Image must be smaller than 5MB.');
            return;
        }

        setLocalError(null);
        setAvatarFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);

        if (!displayName.trim()) {
            setLocalError('Display Name is required.');
            return;
        }
        if (!username.trim()) {
            setLocalError('Username is required.');
            return;
        }
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        if (!usernameRegex.test(username.trim())) {
            setLocalError('Username must be 3–30 characters and can only contain letters, numbers, and underscores.');
            return;
        }
        if (!avatarFile) {
            setLocalError('Please upload a profile photo.');
            return;
        }
        if (bio && bio.trim().length > 100) {
            setLocalError('About Me must be less than 100 characters.');
            return;
        }

        // Build multipart/form-data payload
        const formData = new FormData();
        formData.append('displayName', displayName.trim());
        formData.append('username', username.trim().toLowerCase());
        formData.append('avatar', avatarFile);
        if (bio.trim()) {
            formData.append('aboutMe', bio.trim());
        }

        const res = await completeProfileSetup(formData);

        if (res?.meta?.requestStatus === 'fulfilled') {
            setSaved(true);
            setTimeout(() => navigate('/'), 1200);
        } else if (res?.meta?.requestStatus === 'rejected') {
            setLocalError(res.payload || 'Profile setup failed. Please try again.');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-bg-app select-none">
            {/* Top Navigation Header */}
            <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-border bg-bg-surface shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-indigo-700 p-1.5 shadow-md shadow-primary/25 flex items-center justify-center">
                        <img className="w-full h-full object-contain brightness-200" src={logo} alt="Chat Logo" />
                    </div>
                    <span className="text-sm font-bold text-text-primary tracking-tight">Chatter</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                    <LogOut size={14} />
                    <span>Log out</span>
                </button>
            </header>

            {/* Content Container */}
            <main className="flex-1 flex flex-col items-center justify-center py-8 px-4 sm:px-6">
                <div className="w-full max-w-lg rounded-2xl bg-bg-surface border border-border shadow-2xl p-6 sm:p-8 animate-popup">

                    <div className="text-center mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                            Set up your profile
                        </h1>
                        <p className="text-xs text-text-secondary mt-1">
                            Choose a photo, display name, and username to complete your account.
                        </p>
                    </div>

                    {/* Avatar Upload Area */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="relative group">
                            <div className={`rounded-full ring-2 transition-all ${avatarFile ? 'ring-primary' : 'ring-border'}`}>
                                <Avatar
                                    src={previewUrl}
                                    name={displayName || "User"}
                                    size="xl"
                                    className="shadow-lg"
                                />
                            </div>
                            <label
                                htmlFor="avatarInput"
                                className="absolute bottom-0 right-0 size-8 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95 border-2 border-bg-surface"
                                title="Upload avatar"
                            >
                                <Camera size={15} />
                            </label>
                            <input
                                id="avatarInput"
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                        <label
                            htmlFor="avatarInput"
                            className="text-xs font-semibold text-primary hover:underline cursor-pointer mt-2.5"
                        >
                            {avatarFile ? 'Change photo' : 'Upload photo *'}
                        </label>
                    </div>

                    {/* Form Fields */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Display Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-text-secondary" htmlFor="display_name">
                                Display Name <span className="text-primary">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <User size={15} className="absolute left-3 text-text-muted" />
                                <input
                                    id="display_name"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => { setDisplayName(e.target.value); setLocalError(null); }}
                                    placeholder="Your full name"
                                    className="w-full rounded-xl bg-bg-card border border-border pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-primary/70 focus:ring-1 focus:ring-primary/20"
                                    required
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-text-secondary" htmlFor="username_field">
                                Username <span className="text-primary">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <AtSign size={15} className="absolute left-3 text-text-muted" />
                                <input
                                    id="username_field"
                                    type="text"
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value.toLowerCase()); setLocalError(null); }}
                                    placeholder="your_username"
                                    className="w-full rounded-xl bg-bg-card border border-border pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-primary/70 focus:ring-1 focus:ring-primary/20"
                                    required
                                />
                            </div>
                            <p className="text-[11px] text-text-muted pl-1">
                                3–30 characters, letters, numbers, and underscores only.
                            </p>
                        </div>

                        {/* About Me */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-text-secondary" htmlFor="bio">
                                About Me <span className="text-text-muted font-normal">(optional)</span>
                            </label>
                            <textarea
                                id="bio"
                                rows={3}
                                value={bio}
                                onChange={(e) => { setBio(e.target.value); setLocalError(null); }}
                                placeholder="A brief note about yourself..."
                                maxLength={100}
                                className="w-full rounded-xl bg-bg-card border border-border p-3 text-xs sm:text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-primary/70 focus:ring-1 focus:ring-primary/20 resize-none leading-relaxed"
                            />
                            <p className="text-[11px] text-text-muted text-right pr-1">
                                {bio.length}/100
                            </p>
                        </div>

                        {/* Error Alert */}
                        {localError && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                                <AlertCircle size={15} className="shrink-0" />
                                <span>{localError}</span>
                            </div>
                        )}

                        {/* Success Alert */}
                        {saved && (
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                                <CheckCircle2 size={16} />
                                <span>Profile saved! Redirecting to workspace...</span>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || saved}
                                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-primary/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <>
                                        <span>Save & Continue</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Security Badge */}
                <div className="mt-6 flex items-center gap-1.5 text-xs text-text-muted">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Your profile information is shared only within your conversations</span>
                </div>
            </main>
        </div>
    );
}

export default ProfileComplete;