import React, { useState } from 'react'
import AuthHero from '../components/AuthHero';
import AuthTabs from '../components/AuthTabs';
import AuthForm from '../components/AuthForm';
import SocialLogin from '../components/SocialLogin';
import { useAuth } from '../useAuth';

function AuthPage() {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const { login, register, loading, error, status, userData, passwordError, setPasswordError } = useAuth();

    const handleSubmit = (e, formData) => {
        e.preventDefault();
        if (mode === 'login') {
            login(formData);
        } else {
            if (formData.password !== formData['confirm-password']) {
                setPasswordError('Passwords do not match');
                return;
            }
            setPasswordError(null);
            register(formData);

        }
    }

    return (

        loading ?
            <>
                < center className='flex items-center justify-center h-screen w-screen' >
                    <span className="loader"></span>
                </center >

            </> : (
                <>
                    <div className="flex flex-1 w-full min-h-screen lg:max-h-screen overflow-hidden">
                        {/* <!-- Left Side: Hero / Brand Area (Desktop Only) --> */}
                        <AuthHero />
                        {/* <!-- Right Side: Login Form --> */}
                        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-bg-app relative overflow-auto">
                            {/* <!-- Mobile Brand Header --> */}
                            <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
                                <div className="size-8 text-primary">
                                    <img className='w-full h-full drop-shadow-[0_0_5px_rgba(43,108,238,0.5)] animate-pulse' src="/src/assets/logo.png" alt="" />
                                </div>
                                <h2 className="text-white text-lg font-bold tracking-tight">ChatApp</h2>
                            </div>
                            <div className="w-full max-w-[440px] mt-20 lg:mt-0 relative flex flex-col">
                                {/* <!-- Heading Group --> */}
                                <div className="flex flex-col gap-3 mb-8">
                                    <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Welcome Back</p>
                                    <p className="text-text-secondary text-base font-normal leading-normal">We are so excited to see you
                                        again!</p>
                                </div>
                                {/* <!-- Tabs --> */}
                                <AuthTabs
                                    mode={mode}
                                    setMode={setMode}
                                />
                                {/* <!-- Form --> */}
                                <AuthForm
                                    type={mode}
                                    submitHandler={handleSubmit}
                                    loading={loading}
                                    error={error}
                                    passwordError={passwordError}
                                />
                                {/* <!-- Divider --> */}
                                <div className="relative flex py-8 items-center">
                                    <div className="grow border-t border-border"></div>
                                    <span className="shrink-0 mx-4 text-text-secondary text-xs font-bold uppercase tracking-wider">Or
                                        continue with</span>
                                    <div className="grow border-t border-border"></div>
                                </div>
                                {/* <!-- Social Login --> */}
                                <SocialLogin />
                                {/* <!-- Footer Sign Up Link --> */}
                                {/* <p class="text-text-secondary text-sm font-medium text-center mt-8">
                                    Don't have an account? <a
                                        class="text-primary font-bold hover:text-blue-400 hover:underline transition-colors ml-1"
                                        href="#">Sign up</a>
                                </p> */}
                            </div>
                        </div>
                    </div>
                </>
            )

    )
}

export default AuthPage