import React, { useState } from 'react'
import chatLogo from "../assets/logo.png"
// import { useForm, SubmitHandler } from "react-hook-form"
import eyeIcon from "../assets/icons/eye.png"
import hiddenEyeIcon from "../assets/icons/hidden.png"

function LoginComponent() {
    const [isPasswordHidden, setIsPasswordHidden] = useState(true)
    return (
        <div className="max-w-2xs m-auto shadow-xl/30" style={{ backgroundColor: 'rgba(240, 240, 240)' }}>
            {/* Login */}
            <div style={{
                background: 'linear-gradient(90deg,rgba(129, 181, 201, 1) 0%, rgba(90, 174, 199, 1) 50%, rgba(83, 237, 191, 1) 100%)'
            }} className='w-full h-52 m-auto flex justify-center items-center'>
                <img src={chatLogo} className='w-auto h-40' alt="Logo" />
            </div>

            <div className='px-10 py-8'>
                <label htmlFor="email" className="text-neutral-500 text-sm">Email</label>
                <input type="email" className="py-1 px-1 outline-neutral-300 mb-5 w-full outline-2 focus:outline-neutral-300 rounded-sm text-black  text-sm" name="email" id="email" />
                <label htmlFor="password" className="text-neutral-500 text-sm">Password</label>
                <div className='border-2 rounded-sm border-neutral-300 flex justify-center items-center'>
                    <input type={isPasswordHidden? 'text' : 'password'} className="py-1 px-1 focus:outline-0 w-full rounded-sm text-black text-sm" name="password" id="password"  />
                    <button
                    onClick={() => {
                        setIsPasswordHidden(!isPasswordHidden)
                    }}
                    className='mx-1'
                    >
                        <img className='w-6' src={isPasswordHidden ? eyeIcon : hiddenEyeIcon} alt={isPasswordHidden? "eye icon" : "hidden eye icon"} />
                    </button>
                </div>
                <br />

                <center>
                    <button type="submit" style={{ backgroundColor: "rgba(135, 204, 233)" }} className="text-white text-sm px-6 py-1 ">Login</button>
                </center>
            </div>

        </div>
    )
}

export default LoginComponent