import React, { useEffect, useState } from 'react'
import RecentMessageComponent from '../../chat/components/RecentMessageComponent';
import SearchIcon from "../../../assets/icons/search.png";
import { recentUserMessages } from '../../../data/users';

function Home() {

    return (
        <main className="hidden md:flex flex-1 flex-col items-center justify-center bg-background-dark relative p-8">
            {/* <!-- Background Decoration (Optional subtle pattern) --> */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px]">
                </div>
            </div>
            <div className="relative z-10 flex flex-col items-center max-w-md text-center">
                <div className="mb-8 p-6 rounded-full bg-surface-dark/50 border border-surface-dark shadow-2xl">
                    <span className="material-symbols-outlined text-[64px] text-primary/80">forum</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Connect with your team</h1>
                <p className="text-[#92a4c9] text-lg mb-8 leading-relaxed">
                    Send and receive messages without keeping your phone online.<br />
                    Use ChatApp on up to 4 linked devices and 1 phone.
                </p>
                <button
                    className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5">
                    <span className="material-symbols-outlined text-[20px]">add_comment</span>
                    <span>Start New Chat</span>
                </button>
                <div className="mt-12 flex items-center gap-2 text-sm text-[#5d6b82]">
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    <p>End-to-end encrypted</p>
                </div>
            </div>
        </main>
    )
}

export default Home