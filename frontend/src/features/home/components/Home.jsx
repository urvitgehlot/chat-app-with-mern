import React from 'react';
import { MessageSquare, ShieldCheck, Sparkles, Command } from 'lucide-react';

function Home() {
    return (
        <main className="hidden md:flex flex-1 flex-col items-center justify-center bg-bg-app relative p-8 select-none overflow-hidden">
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-primary/10 to-indigo-500/5 rounded-full blur-[100px] opacity-70" />
                {/* Subtle Grid Accent */}
                <div 
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }}
                />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
                {/* Minimalist Icon Vessel */}
                <div className="relative mb-6">
                    <div className="size-16 rounded-2xl bg-bg-card/80 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl group hover:border-primary/40 transition-colors">
                        <MessageSquare className="size-7 text-primary stroke-[1.75]" />
                    </div>
                    <div className="absolute -top-1 -right-1 size-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                        <Sparkles className="size-2.5 text-primary" />
                    </div>
                </div>

                {/* Typography Hierarchy */}
                <h1 className="text-xl font-semibold text-text-primary tracking-tight mb-2">
                    Your conversations live here
                </h1>
                <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-xs">
                    Select a conversation from the sidebar or press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-bg-card border border-border rounded text-text-primary">⌘K</kbd> to jump straight into messaging.
                </p>

                {/* Security Tag */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-surface/80 border border-border text-[11px] font-medium text-text-muted">
                    <ShieldCheck className="size-3.5 text-emerald-400" />
                    <span>Real-time end-to-end encrypted</span>
                </div>
            </div>
        </main>
    );
}

export default Home;