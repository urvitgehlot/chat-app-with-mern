import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom';
import { checkAuthAsync, logoutAsync } from '../../features/auth/authSlice';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export default function Protected({ children, authentication = true, logoutUser = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { status: authStatus, userData, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useNetworkStatus();

  // false = waiting for auth verification, true = ready to render
  const [isReady, setIsReady] = useState(!authStatus);

  // Verify session with the backend if localStorage says user was previously logged in
  useEffect(() => {
    if (authStatus && !isReady) {
      dispatch(checkAuthAsync()).finally(() => setIsReady(true));
    }
  }, [dispatch, authStatus, isReady]);

  // Redirect logic — runs after auth check completes
  useEffect(() => {
    if (!isReady || loading) return;

    if (authentication && !authStatus) {
      navigate("/login");
    } else if (!authentication && authStatus && !logoutUser) {
      if (!userData?.username) {
        navigate("/profile-complete");
      } else {
        navigate("/");
      }
    } else if (logoutUser && authStatus) {
      dispatch(logoutAsync());
      navigate("/login");
    } else if (authentication && authStatus && !userData?.username && location.pathname !== '/profile-complete') {
      navigate("/profile-complete");
    } else if (authentication && authStatus && userData?.username && location.pathname === '/profile-complete') {
      navigate("/");
    }
  }, [authentication, authStatus, userData, loading, navigate, isReady, logoutUser, dispatch, location.pathname]);

  if (!isReady || loading) {
    return (
      <center className='flex items-center justify-center h-screen w-screen'>
        <span className="loader"></span>
      </center>
    );
  }
  return <>{children}</>;
}