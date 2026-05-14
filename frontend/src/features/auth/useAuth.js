import { useDispatch, useSelector } from "react-redux";
import { loginAsync, logoutAsync, registerAsync } from "./authSlice";
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

    const logout = () => {
        dispatch(logoutAsync());
    }

    return {
        login,
        register,
        logout,
        status,
        userData,
        loading,
        error,
        passwordError,
        setPasswordError
    }
}