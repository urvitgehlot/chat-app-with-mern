import React, { useEffect, useState } from 'react'

function AuthForm({ type, submitHandler, loading, error, passwordError }) {

    const [formData, setFormData] = useState({
        displayName: "",
        email: "",
        password: "",
        "confirm-password": ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setFormData({
            displayName: "",
            email: "",
            password: "",
            "confirm-password": ""
        });
    }, [type]);

    return (
        <form className="flex flex-col gap-5" onSubmit={(e) => submitHandler(e, formData)}>
            {/* <!-- Full Name Input --> */}
            {type === 'signup' && (
                <label className="flex flex-col w-full">
                    <p className="text-white text-sm font-medium leading-normal pb-2">Full Name</p>
                    <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white bg-bg-surface border border-border outline-none h-14 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal input-transition focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="Urvit Gehlot" type="text"
                        name='displayName'
                        value={formData.displayName}
                        onChange={handleChange}
                        required
                    />
                </label>
            )
            }
            {/* <!-- Email Input --> */}
            <label className="flex flex-col w-full">
                <p className="text-white text-sm font-medium leading-normal pb-2">Email</p>
                <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white bg-bg-surface border border-border outline-none h-14 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal input-transition focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="example@email.com" type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </label>
            {/* <!-- Password Input --> */}
            <label className="flex flex-col w-full">
                <div className="flex justify-between items-center pb-2">
                    <p className="text-white text-sm font-medium leading-normal">Password</p>
                </div>
                <div className="flex w-full flex-1 items-stretch rounded-lg relative">
                    <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white bg-bg-surface border border-border h-14 placeholder:text-text-secondary p-[15px] pr-12 text-base font-normal leading-normal input-transition focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="Enter your password" type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <div
                        className="text-text-secondary flex items-center justify-center absolute right-0 top-0 bottom-0 pr-4 cursor-pointer hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]"
                            onClick={() => {
                                setShowPassword(!showPassword);
                            }} >
                            {showPassword ?
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className='fill-border'><path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" /></svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className='fill-border'><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" /></svg>
                            }
                        </span>
                    </div>
                </div>
            </label>
            {/* <!-- Confirm Password Input --> */}
            {type === 'signup' && (
                !showPassword ? (
                    <label className="flex flex-col w-full">
                        <div className="flex justify-between items-center pb-2">
                            <p className="text-white text-sm font-medium leading-normal">Confirm Password</p>
                        </div>
                        <div className="flex w-full flex-1 items-stretch rounded-lg relative">
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white bg-bg-surface border border-border h-14 placeholder:text-text-secondary p-[15px] pr-12 text-base font-normal leading-normal input-transition focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                placeholder="Enter your password" type="password"
                                name='confirm-password'
                                value={formData["confirm-password"]}
                                onChange={handleChange}
                                required
                            />
                            {/* <div class="text-text-secondary flex items-center justify-center absolute right-0 top-0 bottom-0 pr-4 cursor-pointer hover:text-white transition-colors">
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
                )
                    : null
            )}
            <p className="text-red-500">{error || (type === "signup" ? passwordError : null)}</p>
            {/* <!-- Submit Button --> */}
            <button
                type='submit'
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary hover:bg-blue-600 transition-colors text-white text-base font-bold leading-normal tracking-[0.015em] mt-4 shadow-lg shadow-primary/20">
                <span className="truncate">Submit</span>
            </button>
        </form>
    )
}

export default AuthForm