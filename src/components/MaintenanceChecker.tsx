import { useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import MaintenancePage from '@/pages/MaintenancePage';

interface MaintenanceCheckerProps {
  children: ReactNode;
}

export default function MaintenanceChecker({ children }: MaintenanceCheckerProps) {
  const [isInMaintenance, setIsInMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceUntil, setMaintenanceUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    checkMaintenanceMode();

    // Subscribe to changes in system_settings
    const channel = supabase
      .channel('system_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings'
        },
        () => {
          checkMaintenanceMode();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('maintenance_mode, maintenance_message, maintenance_until')
        .single();

      if (error) {
        console.error('Error checking maintenance mode:', error);
        setIsInMaintenance(false);
      } else if (data) {
        setIsInMaintenance(data.maintenance_mode);
        setMaintenanceMessage(data.maintenance_message || '');
        setMaintenanceUntil(data.maintenance_until);
      }
    } catch (error) {
      console.error('Error in maintenance check:', error);
      setIsInMaintenance(false);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow admins to bypass maintenance mode
  const isAdmin = profile?.role === 'ADMIN';
  const isAdminRoute = location.pathname.startsWith('/admin-dashboard');
  const isAuthRoute = location.pathname === '/auth';

  // Show maintenance page if maintenance mode is on and user is not admin
  // Always allow access to auth page so admins can log in
  if (isInMaintenance && !isAdmin && !isAdminRoute && !isAuthRoute) {
    return (
      <MaintenancePage 
        message={maintenanceMessage} 
        until={maintenanceUntil || undefined} 
      />
    );
  }

  return <>{children}</>;
}
