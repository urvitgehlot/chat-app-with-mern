import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, AlertCircle, Loader2, Edit3, Users } from 'lucide-react';
import IconButton from '../../../components/ui/IconButton';
import { useChat } from '../useChat';

const EditGroupModal = ({ isOpen, onClose, group, onGroupUpdated }) => {
    const { updateGroup } = useChat();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && group) {
            setName(group.name || '');
            setDescription(group.description || '');
            setAvatarFile(null);
            setPreviewUrl(group.avatarUrl || '');
            setError(null);
        }
    }, [isOpen, group]);

    // Clean up created object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setError("Please select a valid image file (JPG, PNG, or WebP).");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB.");
            return;
        }

        setError(null);
        setAvatarFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Group name is required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const formData = new FormData();
            formData.append('name', trimmedName);
            formData.append('description', description.trim());
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const updated = await updateGroup({
                groupId: group._id,
                formData,
            });

            if (onGroupUpdated) {
                onGroupUpdated(updated);
            }

            onClose();
        } catch (err) {
            console.error("Failed to update group:", err);
            setError(err.response?.data?.message || err.message || "Failed to update group");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-popup select-none">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                            <Edit3 size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary">
                                Edit Group Info
                            </h3>
                            <p className="text-xs text-text-muted mt-0.5">
                                Update group name, description and photo
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
                    <div className="p-5 space-y-4">
                        {error && (
                            <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Photo Upload Area */}
                        <div className="flex flex-col items-center justify-center py-2">
                            <div className="relative group">
                                <div className={`size-24 rounded-2xl ring-2 transition-all overflow-hidden flex items-center justify-center bg-bg-card shadow-lg ${avatarFile ? 'ring-primary' : 'ring-border'}`}>
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt={name || "Group"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="size-full bg-gradient-to-tr from-primary/20 to-indigo-500/20 flex items-center justify-center text-primary font-bold text-2xl">
                                            {name ? name.slice(0, 2).toUpperCase() : <Users size={32} />}
                                        </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="groupAvatarInput"
                                    className="absolute -bottom-1 -right-1 size-8 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95 border-2 border-bg-surface"
                                    title="Upload photo"
                                >
                                    <Camera size={15} />
                                </label>
                                <input
                                    id="groupAvatarInput"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <label
                                htmlFor="groupAvatarInput"
                                className="text-xs font-semibold text-primary hover:underline cursor-pointer mt-3"
                            >
                                {previewUrl ? 'Change group photo' : 'Upload group photo'}
                            </label>
                        </div>

                        {/* Group Name Field */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-text-secondary" htmlFor="edit_group_name">
                                    Group Name <span className="text-rose-400">*</span>
                                </label>
                                <span className="text-[11px] text-text-muted">
                                    {name.length}/60
                                </span>
                            </div>
                            <input
                                id="edit_group_name"
                                type="text"
                                maxLength={60}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter group name..."
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-card text-text-primary text-xs placeholder:text-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>

                        {/* Description Field */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-text-secondary" htmlFor="edit_group_description">
                                    Description <span className="text-[11px] text-text-muted font-normal">(optional)</span>
                                </label>
                                <span className="text-[11px] text-text-muted">
                                    {description.length}/250
                                </span>
                            </div>
                            <textarea
                                id="edit_group_description"
                                rows={3}
                                maxLength={250}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this group about?"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-card text-text-primary text-xs placeholder:text-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-border p-4 bg-bg-surface/80 flex items-center justify-end gap-2.5 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGroupModal;

