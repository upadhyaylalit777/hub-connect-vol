// src/components/Header.tsx

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Header() {
  // Get user and signOut function from the auth context
  const { user, signOut } = useAuth();
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
            // If user is logged in, show their name and a Logout button
            <div className="flex items-center gap-4">
              <span className="text-sm">Welcome, {user.email}</span>
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