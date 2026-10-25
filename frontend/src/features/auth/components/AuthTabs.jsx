import React from 'react';

function AuthTabs({ mode, setMode }) {
    return (
        <div className="w-full mb-6 p-1 rounded-xl bg-bg-card border border-border flex items-center select-none">
            <button
                type="button"
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    mode === 'login'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => setMode('login')}
            >
                Log In
            </button>
            <button
                type="button"
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    mode === 'signup'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => setMode('signup')}
            >
                Create Account
            </button>
        </div>
    );
}

export default AuthTabs;