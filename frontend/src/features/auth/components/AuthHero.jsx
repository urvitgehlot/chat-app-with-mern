import React from 'react';
import { Radio, Database, HardDrive, Sparkles, Layers } from 'lucide-react';
import logo from "../../../assets/logo.png";

function AuthHero() {
    const techStack = [
        "MongoDB", "Express.js", "React 19", "Node.js", "Socket.IO", "Dexie.js (IndexedDB)", "Redux Toolkit", "Tailwind CSS"
    ];

    return (
        <div className="hidden lg:flex lg:w-1/2 min-h-screen relative flex-col justify-between bg-bg-surface p-12 border-r border-border overflow-hidden select-none">
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-primary/20 via-indigo-600/10 to-transparent rounded-full blur-[130px] opacity-80" />
                <div 
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
                        backgroundSize: '28px 28px'
                    }}
                />
            </div>

            {/* Top Brand Header */}
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-indigo-700 p-2 shadow-lg shadow-primary/25 flex items-center justify-center">
                        <img className="w-full h-full object-contain brightness-200" src={logo} alt="Logo" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-text-primary tracking-tight">Chatter</h2>
                        <p className="text-[11px] text-text-muted">MERN Real-Time Chat App</p>
                    </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-card border border-border text-xs text-text-secondary">
                    <Sparkles size={12} className="text-primary" />
                    <span>Portfolio Project</span>
                </div>
            </div>

            {/* Center Showcase Content */}
            <div className="relative z-10 my-auto max-w-lg">
                <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-[1.2] mb-3">
                    Full-Stack Real-Time Chat System.
                </h1>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                    A portfolio-grade web messaging application engineered with event-driven architecture, robust offline synchronization, and responsive UI.
                </p>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 mb-7">
                    {techStack.map((tech) => (
                        <span
                            key={tech}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-bg-card/90 border border-border/80 text-text-primary shadow-xs"
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Key Architecture Highlights */}
                <div className="space-y-3">
                    <div className="flex items-start gap-3 text-xs text-text-secondary p-2.5 rounded-lg bg-bg-card/40 border border-border/40">
                        <div className="size-7 rounded-lg bg-bg-card border border-border flex items-center justify-center text-primary shrink-0 mt-0.5">
                            <Radio size={14} />
                        </div>
                        <div>
                            <span className="font-semibold text-text-primary block">Bi-directional WebSockets</span>
                            <span>Low-latency instant messaging and typing indicators with Socket.IO.</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs text-text-secondary p-2.5 rounded-lg bg-bg-card/40 border border-border/40">
                        <div className="size-7 rounded-lg bg-bg-card border border-border flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                            <HardDrive size={14} />
                        </div>
                        <div>
                            <span className="font-semibold text-text-primary block">Offline-First Sync</span>
                            <span>Client-side message caching & optimistic local delivery with Dexie.js (IndexedDB).</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs text-text-secondary p-2.5 rounded-lg bg-bg-card/40 border border-border/40">
                        <div className="size-7 rounded-lg bg-bg-card border border-border flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                            <Database size={14} />
                        </div>
                        <div>
                            <span className="font-semibold text-text-primary block">MERN Architecture</span>
                            <span>Secure JWT auth, OTP email verification, and clean RESTful API design.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="relative z-10 pt-6 border-t border-border/40 text-xs text-text-muted flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                    <Layers size={13} className="text-primary" />
                    Built for GitHub Showcase
                </span>
                <span className="text-text-secondary">MIT License</span>
            </div>
        </div>
    );
}

export default AuthHero;