import React, { useState } from 'react'
import loginSignupBackground from '../assets/images/loginsignup-background.png'

function LoginSignup() {
    const [loginFormVisible, setLoginFormVisible] = useState(true);
    const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);

    // signUp
    const [signupPasswordVisible, setSignupPasswordVisible] = useState(false);

    return (
        <div class="flex flex-1 w-full min-h-screen lg:max-h-screen overflow-hidden">
            {/* <!-- Left Side: Hero / Brand Area (Desktop Only) --> */}
            <div
                class="hidden lg:flex lg:w-1/2 max-h-screen relative flex-col items-center justify-center bg-bg-surface overflow-hidden p-12 text-center">
                {/* <!-- Abstract Background Image --> */}
                <div class="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
                    data-alt="Abstract deep blue fluid gradient with neon accents"
                    style={{ backgroundImage: "url('/src/assets/images/loginsignup-background.png')" }}>
                </div>
                {/* <!-- Gradient Overlay --> */}
                <div class="absolute inset-0 bg-linear-to-t from-bg-app/90 via-bg-surface/50 to-primary/10">
                </div>
                {/* <!-- Content --> */}
                <div class="relative z-10 flex flex-col items-center max-w-lg">
                    <div class="size-24 mb-8 text-primary">
                        <img className='w-full h-full drop-shadow-[0_0_5px_rgba(43,108,238,0.5)] animate-pulse' src="/src/assets/logo.png" alt="" />
                    </div>
                    <h1 class="text-white text-5xl font-extrabold leading-tight tracking-[-0.033em] mb-4">Connect Freely.
                    </h1>
                    <p class="text-text-secondary text-xl font-normal leading-relaxed">
                        Join the community where conversations happen in real-time. Secure, fast, and beautifully designed.
                    </p>
                </div>
            </div>
            {/* <!-- Right Side: Login Form --> */}
            <div class="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-bg-app relative overflow-auto">
                {/* <!-- Mobile Brand Header --> */}
                <div class="lg:hidden absolute top-8 left-8 flex items-center gap-3">
                    <div class="size-8 text-primary">
                        <img className='w-full h-full drop-shadow-[0_0_5px_rgba(43,108,238,0.5)] animate-pulse' src="/src/assets/logo.png" alt="" />
                    </div>
                    <h2 class="text-white text-lg font-bold tracking-tight">ChatApp</h2>
                </div>
                <div class="w-full max-w-[440px] mt-20 lg:mt-0 relative flex flex-col">
                    {/* <!-- Heading Group --> */}
                    <div class="flex flex-col gap-3 mb-8">
                        <p class="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Welcome Back</p>
                        <p class="text-text-secondary text-base font-normal leading-normal">We are so excited to see you
                            again!</p>
                    </div>
                    {/* <!-- Tabs --> */}
                    <div class="mb-8">
                        <div class="flex border-b border-border gap-8">
                            <a class={`flex flex-col items-center justify-center border-b-[3px] ${loginFormVisible ? " border-b-primary " : " border-b-transparent text-text-secondary hover:text-white "} text-white border-b-primary pb-3 pt-4 px-2 cursor-pointer transition-colors`}
                                onClick={() => setLoginFormVisible(true)}
                            >
                                <p class="text-sm font-bold leading-normal tracking-[0.015em]">Log In</p>
                            </a>
                            <a class={`flex flex-col items-center justify-center border-b-[3px]  ${!loginFormVisible ? " border-b-primary " : " border-b-transparent text-text-secondary hover:text-white "} text-white  pb-3 pt-4 px-2 cursor-pointer transition-colors`}
                                onClick={() => setLoginFormVisible(false)}>
                                <p class="text-sm font-bold leading-normal tracking-[0.015em]">Sign Up</p>
                            </a>
                        </div>
                    </div>
                    {/* <!-- Form --> */}
                    {
                        loginFormVisible ? (

                            <form class="flex flex-col gap-5">
                                {/* <!-- Email Input --> */}
                                <label class="flex flex-col w-full">
                                    <p class="text-white text-sm font-medium leading-normal pb-2">Email</p>
                                    <input
                                        class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white bg-bg-surface border border-border outline-none h-14 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal input-transition focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                        placeholder="name@email.com" type="email" />
                                </label>
                                {/* <!-- Password Input --> */}
                                <label class="flex flex-col w-full">
                                    <div class="flex justify-between items-center pb-2">
                                        <p class="text-white text-sm font-medium leading-normal">Password</p>
                                    </div>
                                    <div class="flex w-full flex-1 items-stretch rounded-lg relative">
                                        <input
                                            class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white bg-bg-surface border border-border h-14 placeholder:text-text-secondary p-[15px] pr-12 text-base font-normal leading-normal input-transition focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                            placeholder="Enter your password" type={loginPasswordVisible ? "text" : "password"} />
                                        <div
                                            class="text-text-secondary flex items-center justify-center absolute right-0 top-0 bottom-0 pr-4 cursor-pointer hover:text-white transition-colors">
                                            <span class="material-symbols-outlined text-[20px]"
                                                onClick={() => {
                                                    setLoginPasswordVisible(!loginPasswordVisible);
                                                }} >
                                                {loginPasswordVisible ?
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className='fill-border'><path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" /></svg>
                                                    :
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className='fill-border'><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" /></svg>
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </label>
                                {/* <!-- Remember Me & Forgot Password --> */}
                                <div class="flex items-center justify-between mt-1">
                                    <div class="flex items-center gap-2">
                                        <div className='relative inline-flex items-center cursor-pointer'>
                                            <input
                                                class="peer size-4 appearance-none rounded border border-border bg-bg-surface text-primary checked:bg-primary checked:border-primary focus:ring-1 focus:ring-primary focus:ring-offset-0 focus:ring-offset-bg-app cursor-pointer"
                                                type="checkbox" />
                                            <span className='pointer-events-none absolute size-4 opacity-0 peer-checked:opacity-100 text-white text-xs leading-4 text-center'>✓</span>
                                        </div>
                                        <span class="text-text-secondary text-sm font-medium">Remember me</span>
                                    </div>
                                    <a class="text-primary text-sm font-bold hover:text-blue-400 transition-colors" href="#">Forgot
                                        Password?</a>
                                </div>
                                {/* <!-- Submit Button --> */}
                                <button
                                    class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary hover:bg-blue-600 transition-colors text-white text-base font-bold leading-normal tracking-[0.015em] mt-4 shadow-lg shadow-primary/20">
                                    <span class="truncate">Log In</span>
                                </button>
                            </form>
                        ) : (
                            <form class="flex flex-col gap-5">
                                {/* <!-- Full Name Input --> */}
                                <label class="flex flex-col w-full">
                                    <p class="text-white text-sm font-medium leading-normal pb-2">Full Name</p>
                                    <input
                                        class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white bg-bg-surface border border-border outline-none h-14 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal input-transition focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                        placeholder="Urvit Gehlot" type="text" />
                                </label>
                                {/* <!-- Password Input --> */}
                                <label class="flex flex-col w-full">
                                    <div class="flex justify-between items-center pb-2">
                                        <p class="text-white text-sm font-medium leading-normal">Password</p>
                                    </div>
                                    <div class="flex w-full flex-1 items-stretch rounded-lg relative">
                                        <input
                                            class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white bg-bg-surface border border-border h-14 placeholder:text-text-secondary p-[15px] pr-12 text-base font-normal leading-normal input-transition focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                            placeholder="Enter your password" type={signupPasswordVisible ? "text" : "password"} />
                                        <div
                                            class="text-text-secondary flex items-center justify-center absolute right-0 top-0 bottom-0 pr-4 cursor-pointer hover:text-white transition-colors">
                                            <span class="material-symbols-outlined text-[20px]"
                                                onClick={() => {
                                                    setSignupPasswordVisible(!signupPasswordVisible);
                                                }} >
                                                {signupPasswordVisible ?
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className='fill-border'><path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" /></svg>
                                                    :
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className='fill-border'><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" /></svg>
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </label>
                                {/* <!-- Confirm Password Input --> */}
                                {!signupPasswordVisible ?
                                    <label class="flex flex-col w-full">
                                        <div class="flex justify-between items-center pb-2">
                                            <p class="text-white text-sm font-medium leading-normal">Confirm Password</p>
                                        </div>
                                        <div class="flex w-full flex-1 items-stretch rounded-lg relative">
                                            <input
                                                class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white bg-bg-surface border border-border h-14 placeholder:text-text-secondary p-[15px] pr-12 text-base font-normal leading-normal input-transition focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                                placeholder="Enter your password" type="password" />
                                            {/* <div
                                                class="text-text-secondary flex items-center justify-center absolute right-0 top-0 bottom-0 pr-4 cursor-pointer hover:text-white transition-colors">
                                                <span class="material-symbols-outlined text-[20px]"
                                                    onClick={() => {
                                                        setSignupPasswordVisible(!signupPasswordVisible);
                                                    }} >
                                                    {loginPasswordVisible ?
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className='fill-border'><path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" /></svg>
                                                        :
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className='fill-border'><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" /></svg>
                                                    }
                                                </span>
                                            </div> */}
                                        </div>
                                    </label>
                                    : null}
                                {/* <!-- Submit Button --> */}
                                <button
                                    class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary hover:bg-blue-600 transition-colors text-white text-base font-bold leading-normal tracking-[0.015em] mt-4 shadow-lg shadow-primary/20">
                                    <span class="truncate">Submit</span>
                                </button>
                            </form>

                        )
                    }
                    {/* <!-- Divider --> */}
                    <div class="relative flex py-8 items-center">
                        <div class="grow border-t border-border"></div>
                        <span class="shrink-0 mx-4 text-text-secondary text-xs font-bold uppercase tracking-wider">Or
                            continue with</span>
                        <div class="grow border-t border-border"></div>
                    </div>
                    {/* <!-- Social Login --> */}
                    <div class="grid grid-cols-2 gap-4">
                        <button
                            class="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-bg-surface border border-border hover:bg-[#232f48] transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
                            <svg class="size-5" fill="none" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
                                    fill="white"></path>
                                <path
                                    d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z"
                                    fill="white"></path>
                                <path
                                    d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
                                    fill="white"></path>
                                <path
                                    d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1004 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
                                    fill="white"></path>
                            </svg>
                            <span class="truncate">Google</span>
                        </button>
                        <button
                            class="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-bg-surface border border-border hover:bg-[#232f48] transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
                            <svg class="size-5" fill="white" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd"
                                    d="M12 2C6.477 2 2 6.477 2 12C2 16.418 5.865 20 10.333 20C10.833 20 11.25 19.583 11.25 19.083V16.917C11.25 16.583 11.083 16.417 10.75 16.417H10.167C7.833 16.417 7.083 14.833 6.917 14.5C6.833 14.333 6.083 13 5.417 13C5.083 13 4.583 13 5.167 13C5.75 13 6.333 13.583 6.583 14C7.083 15.083 8.333 15.333 9.083 15.333C9.583 15.333 10 15.25 10.25 15.167C10.333 14.417 10.667 13.917 11 13.667C8.167 13.333 5.333 12.833 5.333 9.583C5.333 8.5 5.75 7.667 6.417 6.917C6.333 6.667 5.917 5.5 6.5 4.083C6.5 4.083 7.333 3.833 9.25 5.167C10.083 4.917 10.917 4.833 11.833 4.833C12.75 4.833 13.583 4.917 14.417 5.167C16.333 3.833 17.167 4.083 17.167 4.083C17.75 5.5 17.333 6.667 17.25 6.917C17.917 7.667 18.333 8.5 18.333 9.583C18.333 12.833 15.5 13.333 12.667 13.667C13.083 14.083 13.417 14.75 13.417 15.917V19.083C13.417 19.583 13.833 20 14.333 20C18.833 20 22.667 16.418 22.667 12C22.667 6.477 18.19 2 12.667 2H12Z"
                                    fill-rule="evenodd"></path>
                            </svg>
                            <span class="truncate">GitHub</span>
                        </button>
                    </div>
                    {/* <!-- Footer Sign Up Link --> */}
                    {/* <p class="text-text-secondary text-sm font-medium text-center mt-8">
                        Don't have an account? <a
                            class="text-primary font-bold hover:text-blue-400 hover:underline transition-colors ml-1"
                            href="#">Sign up</a>
                    </p> */}
                </div>
            </div>
        </div>
    )
}

export default LoginSignup