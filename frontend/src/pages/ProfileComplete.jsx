import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice';

function ProfileComplete() {
    const logoutUser = useDispatch(logout());

    const uploadFile = () => {
        document.getElementById('displayAvatar').click();
    }

    return (
        <div
            class="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display">
            <header
                class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e7eb] dark:border-b-[#232f48] px-10 py-3 bg-white dark:bg-[#111722]">
                <div class="flex items-center gap-4 text-[#111722] dark:text-white">
                    <div class="size-8 text-primary">
                        <img className='w-full h-full' src="/src/assets/logo.png" alt="Chat Logo" />
                    </div>
                    <h2 class="text-lg font-bold leading-tight tracking-[-0.015em]">ChatApp</h2>
                </div>
                <button
                    onClick={logoutUser}
                    class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f0f2f4] dark:bg-[#232f48] text-[#111722] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#e5e7eb] dark:hover:bg-[#2d3b58] transition-colors">
                    <span class="truncate">Log out</span>
                </button>
            </header>
            <div class="layout-container flex h-full grow flex-col items-center justify-center py-10 px-4 sm:px-10">
                <div
                    class="layout-content-container flex flex-col w-full max-w-[640px] bg-white dark:bg-[#1a2230] rounded-xl shadow-sm dark:shadow-none border border-[#e5e7eb] dark:border-[#2a3649] overflow-hidden">
                    <div class="px-6 pt-8 pb-4">
                        <div class="flex flex-col gap-3">
                            <div class="flex gap-6 justify-between items-center">
                                <p
                                    class="text-[#111722] dark:text-white text-sm font-medium leading-normal tracking-wide uppercase opacity-80">
                                    Profile completion</p>
                                <span class="text-primary text-sm font-bold">Step 2 of 2</span>
                            </div>
                            <div class="rounded-full bg-[#f0f2f4] dark:bg-[#324467] h-2 w-full overflow-hidden">
                                <div class="h-full rounded-full bg-primary" style={{ width: "75%" }}></div>
                            </div>
                        </div>
                    </div>
                    <div class="px-6 py-2 text-center">
                        <h1
                            class="text-[#111722] dark:text-white text-3xl font-extrabold leading-tight tracking-[-0.015em] mb-3">
                            Complete your profile</h1>
                        <p class="text-[#64748b] dark:text-[#94a3b8] text-base font-normal leading-normal max-w-md mx-auto">
                            Please provide the details below to finish setting up your account. These fields are mandatory
                            for chatting.
                        </p>
                    </div>
                    <div class="flex flex-col items-center justify-center py-8 gap-4">
                        <div
                            onClick={uploadFile}
                            class="relative group cursor-pointer"
                        >
                            <div
                                class="size-32 rounded-full bg-[#f0f2f4] dark:bg-[#232f48] flex items-center justify-center border-4 border-white dark:border-[#1a2230] shadow-lg overflow-hidden relative">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className='fill-[#475569] size-[60px]'>
                                    <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
                                </svg>
                                <div
                                    class="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className='fill-white size-[30px]' viewBox="0 -960 960 960" >
                                        <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                                    </svg>
                                </div>
                            </div>
                            <div
                                class="absolute bottom-0 right-0 p-2 bg-primary hover:bg-blue-600 rounded-full text-white shadow-md transition-colors flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className='fill-white size-[18px]'>
                                    <path d="M440-440ZM120-120q-33 0-56.5-23.5T40-200v-480q0-33 23.5-56.5T120-760h126l74-80h240v80H355l-73 80H120v480h640v-360h80v360q0 33-23.5 56.5T760-120H120Zm640-560v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80ZM440-260q75 0 127.5-52.5T620-440q0-75-52.5-127.5T440-620q-75 0-127.5 52.5T260-440q0 75 52.5 127.5T440-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Z" />
                                </svg>
                            </div>
                        </div>
                        <button
                            onClick={uploadFile}
                            class="text-primary text-sm font-bold hover:underline cursor-pointer"
                        >Upload Photo <span
                            class="text-red-500">*</span></button>
                    </div>
                    <form class="flex flex-col gap-6 px-6 sm:px-10 pb-10">
                        <input type="file" accept='png, .jpg, .jpeg, image/png, image/jpeg"' className='hidden' name="" id="displayAvatar" />
                        <div class="flex flex-col gap-2">
                            <label class="text-[#111722] dark:text-white text-sm font-bold" for="display_name">Display Name <span class="text-red-500">*</span></label>
                            <input
                                class="w-full rounded-lg bg-[#f8fafc] dark:bg-[#232f48] border border-[#e2e8f0] dark:border-[#334155] p-3 text-[#111722] dark:text-white placeholder:text-[#94a3b8] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                id="display_name" placeholder="e.g. Urvit Gehlot" required="" type="text" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[#111722] dark:text-white text-sm font-bold" for="username">Username <span
                                class="text-red-500">*</span></label>
                            <div class="relative w-full">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <span class="text-[#94a3b8] font-medium">@</span>
                                </div>
                                <input
                                    class="w-full rounded-lg bg-[#f8fafc] dark:bg-[#232f48] border border-[#e2e8f0] dark:border-[#334155] p-3 pl-8 text-[#111722] dark:text-white placeholder:text-[#94a3b8] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    id="username" placeholder="urvitgehlot" required="" type="text" />
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[#111722] dark:text-white text-sm font-bold" for="bio">About Me <span
                                class="text-red-500">*</span></label>
                            <textarea
                                class="w-full rounded-lg bg-[#f8fafc] dark:bg-[#232f48] border border-[#e2e8f0] dark:border-[#334155] p-3 text-[#111722] dark:text-white placeholder:text-[#94a3b8] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                id="bio" placeholder="I love coffee, coding, and hiking on weekends..." required=""
                                rows="3"></textarea>
                        </div>
                        <div class="flex flex-col gap-3 pt-4">
                            <button
                                class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                                Complete Registration
                            </button>
                        </div>
                    </form>
                </div>
                <div class="mt-8 flex items-center gap-2 text-[#64748b] dark:text-[#637588] text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className='fill-[#637588] size-3.5' viewBox="0 -960 960 960">
                        <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" />
                    </svg>
                    <p>Your information is safe and only visible to friends.</p>
                </div>
            </div>
        </div>
    )
}

export default ProfileComplete