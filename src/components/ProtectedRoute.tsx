import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'VOLUNTEER' | 'NGO' | 'ADMIN' | 'NGO_OR_ADMIN';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // If no user, redirect to auth
      if (!user) {
        navigate(redirectTo);
        return;
      }

      // If role is required, check profile
      if (requiredRole && profile) {
        const hasAccess = 
          requiredRole === 'NGO_OR_ADMIN' 
            ? profile.role === 'NGO' || profile.role === 'ADMIN'
            : profile.role === requiredRole;

        if (!hasAccess) {
          // Redirect based on user's actual role
          if (profile.role === 'ADMIN') {
            navigate('/admin-dashboard');
          } else if (profile.role === 'NGO') {
            navigate('/ngo-dashboard');
          } else {
            navigate('/');
          }
        }
      }
    }
  }, [user, profile, loading, navigate, requiredRole, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user and still loading, show nothing
  if (!user) {
    return null;
  }

  // If role is required but profile doesn't match, show nothing
  if (requiredRole && profile) {
    const hasAccess = 
      requiredRole === 'NGO_OR_ADMIN' 
        ? profile.role === 'NGO' || profile.role === 'ADMIN'
        : profile.role === requiredRole;

    if (!hasAccess) {
      return null;
    }
  }

  return <>{children}</>;
}