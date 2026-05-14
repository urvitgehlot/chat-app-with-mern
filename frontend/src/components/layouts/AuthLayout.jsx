import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { checkAuthAsync } from '../../features/auth/authSlice';

export default function Protected({ children, authentication = true }) {
  const navigate = useNavigate();
  const { status: authStatus, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

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
    } else if (!authentication && authStatus) {
      navigate("/");
    }
  }, [authentication, authStatus, loading, navigate, isReady]);

  if (!isReady || loading) {
    return (
      <center className='flex items-center justify-center h-screen w-screen'>
        <span className="loader"></span>
      </center>
    );
  }
  return <>{children}</>;
}