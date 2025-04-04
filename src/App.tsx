
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  QueryClient, 
  QueryClientProvider 
} from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react'; // Add explicit React import

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// Pages
import LanguageSelection from "./pages/LanguageSelection";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Cities from "./pages/Cities";
import CityDetail from "./pages/CityDetail";
import PointDetail from "./pages/PointDetail";
import RouteDetail from "./pages/RouteDetail";
import EventDetail from "./pages/EventDetail";
import Profile from "./pages/Profile";
import Search from "./pages/Search";

// Create the client outside the component
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LanguageProvider>
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<LanguageSelection />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/cities" element={<Cities />} />
                  <Route path="/cities/:cityId" element={<CityDetail />} />
                  <Route path="/points/:pointId" element={<PointDetail />} />
                  <Route path="/routes/:routeId" element={<RouteDetail />} />
                  <Route path="/events/:eventId" element={<EventDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
