import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Project Name */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">VH</span>
          </div>
          <span className="text-xl font-semibold text-foreground">Volunteer Hub</span>
        </div>

        {/* Navigation and Actions */}
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-foreground hover:text-primary font-medium transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              My Registrations
            </a>
            <Link to="/profile" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Profile
            </Link>
          </nav>
          
          <Button variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};