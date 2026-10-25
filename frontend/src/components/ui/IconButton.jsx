import React from 'react';

export default function IconButton({
    icon: Icon,
    onClick,
    title,
    ariaLabel,
    variant = "ghost", // "ghost" | "subtle" | "primary" | "danger"
    size = "md", // "sm" (32px), "md" (36px), "lg" (40px)
    className = "",
    disabled = false,
    active = false,
    type = "button"
}) {
    const sizeClasses = {
        sm: "size-8 text-xs",
        md: "size-9 text-sm",
        lg: "size-10 text-base"
    };

    const iconSizes = {
        sm: 16,
        md: 18,
        lg: 20
    };

    const variantClasses = {
        ghost: active
            ? "bg-bg-active text-text-primary border border-border"
            : "text-text-secondary hover:text-text-primary hover:bg-bg-hover active:bg-bg-active",
        subtle: "bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated hover:border-white/15 active:scale-95",
        primary: "bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20 active:scale-95",
        danger: "text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            title={title}
            aria-label={ariaLabel || title}
            disabled={disabled}
            className={`inline-flex items-center justify-center rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.ghost} ${className}`}
        >
            {Icon && <Icon size={iconSizes[size] || 18} strokeWidth={1.75} />}
        </button>
    );
}
