import { useDispatch, useSelector } from "react-redux";
import { loginAsync, logoutAsync, registerAsync, completeProfileSetupAsync } from "./authSlice";
import { sendRegistrationOTP as sendOtpApi } from "./authAPI";
import { useState } from "react";


export const useAuth = () => {
    const dispatch = useDispatch();

    const { status, userData, loading, error } = useSelector((state) => state.auth);

    const [passwordError, setPasswordError] = useState(null);

    const login = (credentials) => {
        return dispatch(loginAsync(credentials));
    }

    const register = (credentials) => {
        return dispatch(registerAsync(credentials));
    }

    const sendRegistrationOTP = (data) => {
        return sendOtpApi(data);
    }

    const completeProfileSetup = (formData) => {
        return dispatch(completeProfileSetupAsync(formData));
    }

    const logout = () => {
        dispatch(logoutAsync());
    }

    return {
        login,
        register,
        completeProfileSetup,
        sendRegistrationOTP,
        sendOtp: sendRegistrationOTP,
        logout,
        status,
        userData,
        loading,
        error,
        passwordError,
        setPasswordError
    }
}