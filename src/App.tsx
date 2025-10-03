import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MaintenanceChecker from "./components/MaintenanceChecker";
import Landing from "./pages/Landing";
import Activities from "./pages/Activities";
import Auth from "./pages/Auth";
import ActivityDetails from "./pages/ActivityDetails";
import UserProfile from "./pages/UserProfile";
import NGODashboard from "./pages/NGODashboard";
import CreateActivity from "./pages/CreateActivity";
import ManageRegistrations from "./pages/ManageRegistrations";
import NGORegistrations from "./pages/NGORegistrations";
import ReviewApproval from "./pages/ReviewApproval";
import ActivityHistory from "./pages/ActivityHistory";
import MyReviews from "./pages/MyReviews";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MaintenanceChecker>
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/activities" element={
              <ProtectedRoute>
                <Activities />
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
            <Route path="/admin-dashboard" element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
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
            <Route path="/ngo-registrations" element={
              <ProtectedRoute requiredRole="NGO_OR_ADMIN">
                <NGORegistrations />
              </ProtectedRoute>
            } />
            <Route path="/review-approval" element={
              <ProtectedRoute requiredRole="NGO_OR_ADMIN">
                <ReviewApproval />
              </ProtectedRoute>
            } />
            <Route path="/activity-history" element={
              <ProtectedRoute>
                <ActivityHistory />
              </ProtectedRoute>
            } />
            <Route path="/my-reviews" element={
              <ProtectedRoute>
                <MyReviews />
              </ProtectedRoute>
            } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MaintenanceChecker>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
