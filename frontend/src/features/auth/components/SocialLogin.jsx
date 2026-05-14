import React from 'react'

function SocialLogin() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <button
                className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-bg-surface border border-border hover:bg-[#232f48] transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                <span className="truncate">Google</span>
            </button>
            <button
                className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-bg-surface border border-border hover:bg-[#232f48] transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
                <svg className="size-5" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.477 2 12C2 16.418 5.865 20 10.333 20C10.833 20 11.25 19.583 11.25 19.083V16.917C11.25 16.583 11.083 16.417 10.75 16.417H10.167C7.833 16.417 7.083 14.833 6.917 14.5C6.833 14.333 6.083 13 5.417 13C5.083 13 4.583 13 5.167 13C5.75 13 6.333 13.583 6.583 14C7.083 15.083 8.333 15.333 9.083 15.333C9.583 15.333 10 15.25 10.25 15.167C10.333 14.417 10.667 13.917 11 13.667C8.167 13.333 5.333 12.833 5.333 9.583C5.333 8.5 5.75 7.667 6.417 6.917C6.333 6.667 5.917 5.5 6.5 4.083C6.5 4.083 7.333 3.833 9.25 5.167C10.083 4.917 10.917 4.833 11.833 4.833C12.75 4.833 13.583 4.917 14.417 5.167C16.333 3.833 17.167 4.083 17.167 4.083C17.75 5.5 17.333 6.667 17.25 6.917C17.917 7.667 18.333 8.5 18.333 9.583C18.333 12.833 15.5 13.333 12.667 13.667C13.083 14.083 13.417 14.75 13.417 15.917V19.083C13.417 19.583 13.833 20 14.333 20C18.833 20 22.667 16.418 22.667 12C22.667 6.477 18.19 2 12.667 2H12Z"
                        fillRule="evenodd"></path>
                </svg>
                <span className="truncate">GitHub</span>
            </button>
        </div>
    )
}

export default SocialLogin