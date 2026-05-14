import React from 'react'

function AuthTabs({ mode, setMode }) {
    return (
        <div className="mb-8">
            <div className="flex border-b border-border gap-8">
                <button className={`flex flex-col items-center justify-center border-b-[3px] ${mode === 'login' ? " border-b-primary " : " border-b-transparent text-text-secondary hover:text-white "} text-white border-b-primary pb-3 pt-4 px-2 cursor-pointer transition-colors`}
                    onClick={() => setMode('login')}
                >
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Log In</p>
                </button>
                <button className={`flex flex-col items-center justify-center border-b-[3px]  ${mode === 'signup' ? " border-b-primary " : " border-b-transparent text-text-secondary hover:text-white "} text-white  pb-3 pt-4 px-2 cursor-pointer transition-colors`}
                    onClick={() => setMode('signup')}>
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Sign Up</p>
                </button>
            </div>
        </div>
    )
}

export default AuthTabs