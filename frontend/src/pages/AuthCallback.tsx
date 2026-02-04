import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // After successful OAuth, redirect to dashboard
    const timeout = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="loading-screen">
      <div className="spinner">Signing you in...</div>
    </div>
  );
}
