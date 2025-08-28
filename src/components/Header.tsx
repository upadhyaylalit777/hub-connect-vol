// src/components/Header.tsx

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export function Header() {
  // Get user and signOut function from the auth context
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to login page after sign out
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-gray-100 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">
          Volunteer Hub
        </Link>
        <nav>
          {user ? (
            // If user is logged in, show navigation based on role
            <div className="flex items-center gap-4">
              {profile?.role === 'NGO' || profile?.role === 'ADMIN' ? (
                <Button variant="ghost" asChild>
                  <Link to="/ngo-dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
              ) : null}
              <span className="text-sm">Welcome, {profile?.name || user.email}</span>
              <Button onClick={handleSignOut} variant="outline">
                Logout
              </Button>
            </div>
          ) : (
            // If no user, show a Login button
            <Button onClick={() => navigate('/auth')}>
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}