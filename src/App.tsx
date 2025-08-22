import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ActivityDetails from "./pages/ActivityDetails";
import UserProfile from "./pages/UserProfile";
import NGODashboard from "./pages/NGODashboard";
import CreateActivity from "./pages/CreateActivity";
import ManageRegistrations from "./pages/ManageRegistrations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/activity/:id" element={
              <ProtectedRoute>
                <ActivityDetails />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/ngo-dashboard" element={
              <ProtectedRoute requiredRole="NGO_OR_ADMIN">
                <NGODashboard />
              </ProtectedRoute>
            } />
            <Route path="/create-activity" element={
              <ProtectedRoute requiredRole="NGO_OR_ADMIN">
                <CreateActivity />
              </ProtectedRoute>
            } />
            <Route path="/manage-registrations/:id" element={
              <ProtectedRoute requiredRole="NGO_OR_ADMIN">
                <ManageRegistrations />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
