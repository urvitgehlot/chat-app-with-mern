import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHero from '../components/AuthHero';
import AuthTabs from '../components/AuthTabs';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../useAuth';
import logo from "../../../assets/logo.png";

function AuthPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const { login, register, sendOtp, loading, error, passwordError, setPasswordError } = useAuth();

    const handleSubmit = async (e, formData) => {
        e.preventDefault();
        if (mode === 'login') {
            login(formData);
        } else {
            if (formData.password !== formData['confirm-password']) {
                setPasswordError('Passwords do not match');
                return;
            }
            setPasswordError(null);
            const res = await register(formData);
            if (res?.meta?.requestStatus === 'fulfilled' || res?.payload?.statusCode === 201) {
                navigate('/profile-complete');
            }
        }
    };

    return (
        <div className="flex w-full min-h-screen bg-bg-app select-none">
            {/* Left Hero (Desktop) */}
            <AuthHero />

            {/* Right Form Container */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 py-12 sm:px-8 md:px-12 bg-bg-app relative overflow-y-auto">
                <div className="w-full max-w-[380px] flex flex-col items-center">
                    {/* Brand Header on Mobile/Tablet */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-indigo-700 p-1.5 shadow-md shadow-primary/25 flex items-center justify-center">
                            <img className="w-full h-full object-contain brightness-200" src={logo} alt="Logo" />
                        </div>
                        <h2 className="text-lg font-bold text-text-primary tracking-tight">Chatter</h2>
                    </div>

                    {/* Heading Group */}
                    <div className="text-center w-full mb-6">
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                            {mode === 'login' ? 'Welcome back' : 'Create your account'}
                        </h1>
                        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                            {mode === 'login'
                                ? 'Enter your credentials to access your conversations.'
                                : 'Start messaging in real-time with instant sync.'}
                        </p>
                    </div>

                    {/* Segmented Mode Switcher */}
                    <AuthTabs mode={mode} setMode={(m) => { setPasswordError(null); setMode(m); }} />

                    {/* Auth Form */}
                    <AuthForm
                        type={mode}
                        submitHandler={handleSubmit}
                        sendOtp={sendOtp}
                        loading={loading}
                        error={error}
                        passwordError={passwordError}
                    />

                    {/* Footer Mode Switch Prompt */}
                    <p className="text-xs text-text-muted text-center mt-8">
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setPasswordError(null);
                                setMode(mode === 'login' ? 'signup' : 'login');
                            }}
                            className="text-primary hover:underline font-semibold cursor-pointer ml-1"
                        >
                            {mode === 'login' ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;