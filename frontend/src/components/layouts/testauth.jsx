import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { checkAuthAsync } from '../../features/auth/authSlice';

let hasCheckedAuth = false;

export default function Protected({ children, authentication = true }) {
    const navigate = useNavigate();
    const { status: authStatus, loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    // Only verify session if localStorage says user was previously logged in
    useEffect(() => {
        if (!hasCheckedAuth && authStatus) {
            hasCheckedAuth = true;
            dispatch(checkAuthAsync());
        }
    }, [dispatch, authStatus]);

    // Redirect logic — runs after auth check completes

    useEffect(() => {
        if (loading) return;

        if (authentication && authStatus !== authentication) {
            navigate("/login")
        } else if (!authentication && authStatus !== authentication) {
            navigate("/")
        }
    }, [authentication, authStatus, loading, navigate]);

    if (loading) {
        return (
            <center className='flex items-center justify-center h-screen w-screen'>
                <span className="loader"></span>
            </center>
        );
    }
    return <>{children}</>;
}