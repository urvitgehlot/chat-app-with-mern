import React, { useState } from 'react';

export default function Avatar({
    src,
    alt = "Avatar",
    name = "",
    size = "md", // "xs" (24px), "sm" (32px), "md" (40px), "lg" (48px), "xl" (96px)
    status, // "online" | "offline" | "away" | null
    className = "",
    onClick
}) {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        xs: "size-6 text-[10px]",
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
        xl: "size-24 text-2xl"
    };

    const statusSizes = {
        xs: "size-1.5 ring-1",
        sm: "size-2 ring-1.5",
        md: "size-2.5 ring-2",
        lg: "size-3 ring-2",
        xl: "size-4 ring-3"
    };

    const getInitials = (n) => {
        if (!n) return "?";
        const parts = n.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return n.slice(0, 2).toUpperCase();
    };

    // Deterministic subtle pastel gradient based on name
    const getInitialsGradient = (n) => {
        const charCode = (n || "A").charCodeAt(0);
        const gradients = [
            "from-indigo-600/30 to-violet-700/40 text-indigo-200 border-indigo-500/20",
            "from-blue-600/30 to-cyan-700/40 text-blue-200 border-blue-500/20",
            "from-emerald-600/30 to-teal-700/40 text-emerald-200 border-emerald-500/20",
            "from-amber-600/30 to-rose-700/40 text-amber-200 border-amber-500/20",
            "from-purple-600/30 to-pink-700/40 text-purple-200 border-purple-500/20",
        ];
        return gradients[charCode % gradients.length];
    };

    const isOnline = status === "online";

    return (
        <div 
            onClick={onClick}
            className={`relative inline-flex shrink-0 items-center justify-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {src && !imageError ? (
                <img
                    src={src}
                    alt={alt}
                    onError={() => setImageError(true)}
                    className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover border border-white/10 shadow-sm`}
                />
            ) : (
                <div
                    className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-gradient-to-br ${getInitialsGradient(name)} border flex items-center justify-center font-semibold tracking-tight shadow-inner`}
                >
                    {getInitials(name)}
                </div>
            )}

            {status && (
                <span
                    className={`absolute bottom-0 right-0 rounded-full ring-bg-surface ${statusSizes[size] || statusSizes.md} ${
                        isOnline ? "bg-emerald-500" : "bg-slate-500"
                    }`}
                    title={isOnline ? "Online" : "Offline"}
                />
            )}
        </div>
    );
}
