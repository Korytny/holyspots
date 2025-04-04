
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { MapPin, User, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

const Navigation = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const routes = [{
    name: t('cities'),
    path: '/cities',
    icon: <MapPin className="h-5 w-5" />
  }, {
    name: t('search'),
    path: '/search',
    icon: <Search className="h-5 w-5" />
  }, {
    name: t('profile'),
    path: '/profile',
    icon: <User className="h-5 w-5" />
  }];
  
  // Simplified button style without authentication check
  const getProfileButtonStyle = (path: string) => {
    return isActive(path) ? "bg-primary text-primary-foreground" : "hover:bg-secondary";
  };
  
  // Mobile navigation component
  const MobileNav = () => <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="flex flex-col gap-2 py-4">
          {routes.map(route => (
            <Link 
              key={route.path} 
              to={route.path} 
              className={`flex items-center px-4 py-3 rounded-md text-lg transition-colors ${
                isActive(route.path) ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`} 
              onClick={() => setOpen(false)}
            >
              {route.icon}
              <span className="ml-3">{route.name}</span>
            </Link>
          ))}
          <div className="px-4 py-3">
            <LanguageSwitcher />
          </div>
        </nav>
      </SheetContent>
    </Sheet>;
    
  return <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-serif font-bold text-burgundy">Holy Spots</span>
          </Link>
        </div>
        
        <MobileNav />
        
        <nav className="hidden md:flex items-center space-x-1">
          {routes.map(route => (
            <Link 
              key={route.path} 
              to={route.path} 
              className={`px-3 py-2 rounded-md flex items-center transition-colors ${
                isActive(route.path) ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              {route.icon}
              <span className="ml-2">{route.name}</span>
            </Link>
          ))}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>;
};

export default Navigation;
