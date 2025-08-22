import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ActivityDetails from "./pages/ActivityDetails";
import UserProfile from "./pages/UserProfile";
import NGODashboard from "./pages/NGODashboard";
import CreateActivity from "./pages/CreateActivity";
import ManageRegistrations from "./pages/ManageRegistrations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/activity/:id" element={<ActivityDetails />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/ngo-dashboard" element={<NGODashboard />} />
          <Route path="/create-activity" element={<CreateActivity />} />
          <Route path="/manage-registrations/:id" element={<ManageRegistrations />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
