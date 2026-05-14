import React from 'react'

function AuthHero() {
    return (
        <div
            className="hidden lg:flex lg:w-1/2 max-h-screen relative flex-col items-center justify-center bg-bg-surface overflow-hidden p-12 text-center">
            {/* <!-- Abstract Background Image --> */}
            <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
                data-alt="Abstract deep blue fluid gradient with neon accents"
                style={{ backgroundImage: "url('/src/assets/images/loginsignup-background.png')" }}>
            </div>
            {/* <!-- Gradient Overlay --> */}
            <div className="absolute inset-0 bg-linear-to-t from-bg-app/90 via-bg-surface/50 to-primary/10">
            </div>
            {/* <!-- Content --> */}
            <div className="relative z-10 flex flex-col items-center max-w-lg">
                <div className="size-24 mb-8 text-primary">
                    <img className='w-full h-full drop-shadow-[0_0_5px_rgba(43,108,238,0.5)] animate-pulse' src="/src/assets/logo.png" alt="" />
                </div>
                <h1 className="text-white text-5xl font-extrabold leading-tight tracking-[-0.033em] mb-4">Connect Freely.
                </h1>
                <p className="text-text-secondary text-xl font-normal leading-relaxed">
                    Join the community where conversations happen in real-time. Secure, fast, and beautifully designed.
                </p>
            </div>
        </div>
    )
}

export default AuthHero