import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6">
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <a 
              href="#" 
              className="block text-foreground hover:text-primary font-medium transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </a>
            <a 
              href="#" 
              className="block text-muted-foreground hover:text-primary font-medium transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Registrations
            </a>
            <Link 
              to="/profile" 
              className="block text-muted-foreground hover:text-primary font-medium transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Logout
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};