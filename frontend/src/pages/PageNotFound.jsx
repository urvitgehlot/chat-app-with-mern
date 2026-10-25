import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';

function PageNotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg-app px-4 select-none relative overflow-hidden">
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-primary/15 via-indigo-600/5 to-transparent rounded-full blur-[120px] opacity-70" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                {/* 404 Vessel */}
                <div className="size-16 rounded-2xl bg-bg-card border border-border flex items-center justify-center shadow-xl mb-6">
                    <MessageSquare className="size-8 text-primary stroke-[1.75]" />
                </div>

                <span className="text-5xl font-black tracking-tight text-white/90 mb-2 font-mono">
                    404
                </span>

                <h1 className="text-xl font-bold text-text-primary tracking-tight mb-2">
                    Page not found
                </h1>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                    The conversation or link you are trying to view doesn't exist or was moved.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-md shadow-primary/25 transition-all active:scale-98"
                >
                    <ArrowLeft size={16} />
                    <span>Return to conversations</span>
                </Link>
            </div>
        </div>
    );
}

export default PageNotFound;