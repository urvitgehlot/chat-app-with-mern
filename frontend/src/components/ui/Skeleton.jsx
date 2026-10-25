import React from 'react';

export function ChatListSkeleton({ count = 6 }) {
    return (
        <div className="flex flex-col divide-y divide-border/20 p-2 space-y-1">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3">
                    <div className="size-10 rounded-full skeleton shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex justify-between items-center">
                            <div className="h-3.5 w-24 skeleton rounded" />
                            <div className="h-2.5 w-10 skeleton rounded" />
                        </div>
                        <div className="h-3 w-40 skeleton rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function MessageSkeleton() {
    return (
        <div className="flex flex-col space-y-4 p-4">
            <div className="flex items-end gap-2.5 max-w-[65%]">
                <div className="size-8 rounded-full skeleton shrink-0" />
                <div className="space-y-1.5 flex-1">
                    <div className="h-10 w-48 skeleton rounded-2xl rounded-bl-xs" />
                    <div className="h-2.5 w-12 skeleton rounded ml-1" />
                </div>
            </div>
            <div className="flex items-end gap-2.5 max-w-[65%] ml-auto flex-row-reverse">
                <div className="space-y-1.5 flex-1 flex flex-col items-end">
                    <div className="h-14 w-64 skeleton rounded-2xl rounded-br-xs" />
                    <div className="h-2.5 w-14 skeleton rounded mr-1" />
                </div>
            </div>
            <div className="flex items-end gap-2.5 max-w-[50%]">
                <div className="size-8 rounded-full skeleton shrink-0" />
                <div className="space-y-1.5 flex-1">
                    <div className="h-8 w-32 skeleton rounded-2xl rounded-bl-xs" />
                    <div className="h-2.5 w-10 skeleton rounded ml-1" />
                </div>
            </div>
        </div>
    );
}

export default function Skeleton({ className = "" }) {
    return <div className={`skeleton ${className}`} />;
}
