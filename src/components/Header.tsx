// src/components/Header.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, Menu, User, LogOut } from "lucide-react";

export function Header() {
  // Get user and signOut function from the auth context
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
      // Redirect to login page after sign out
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-gray-100 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/activities" className="text-xl font-bold text-primary">
          Volunteer Hub
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex">
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
              <Button variant="ghost" asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </Button>
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

        {/* Mobile Navigation */}
        <div className="md:hidden">
          {user ? (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {profile?.name || user.email}
                    </span>
                  </div>
                  
                  {profile?.role === 'NGO' || profile?.role === 'ADMIN' ? (
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="justify-start h-auto py-3"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to="/ngo-dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        NGO Dashboard
                      </Link>
                    </Button>
                  ) : null}
                  
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="justify-start h-auto py-3"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="justify-start h-auto py-3 gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button onClick={() => navigate('/auth')} size="sm">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}