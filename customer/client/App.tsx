import "./global.css";

import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CheckIn from "./pages/CheckIn";
import NewCustomerRegistration from "./pages/NewCustomerRegistration";
import AppointmentCheck from "./pages/AppointmentCheck";
import VerifyAppointmentOTP from "./pages/VerifyAppointmentOTP";
import VerifyOTP from "./pages/VerifyOTP";
import VerificationSuccess from "./pages/VerificationSuccess";
import WalkInCheckIn from "./pages/WalkInCheckIn";
import WalkInRegistration from "./pages/WalkInRegistration";
import PatientDashboard from "./pages/PatientDashboard";
import AppointmentCustomerDetails from "./pages/AppointmentCustomerDetails";
import WhatsAppConfirmation from "./pages/WhatsAppConfirmation";
import NotFound from "./pages/NotFound";
import WelcomePage from "./pages/WelcomePage";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import IndexSkeleton from "@/skeletons/IndexSkeleton";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <IndexSkeleton />;
  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Index />} />
      <Route path="/" element={user ? <Index /> : <LoginPage />} />
      <Route path="/check-in" element={user ? <CheckIn /> : <LoginPage />} />
      <Route path="/new-customer-registration" element={user ? <NewCustomerRegistration /> : <LoginPage />} />
      <Route path="/appointment-check" element={user ? <AppointmentCheck /> : <LoginPage />} />
      <Route path="/verify-appointment-otp" element={user ? <VerifyAppointmentOTP /> : <LoginPage />} />
      <Route path="/verify-otp" element={user ? <VerifyOTP /> : <LoginPage />} />
      <Route path="/verification-success" element={user ? <VerificationSuccess /> : <LoginPage />} />
      <Route path="/walk-in-check-in" element={user ? <WalkInCheckIn /> : <LoginPage />} />
      <Route path="/walk-in-registration" element={user ? <WalkInRegistration /> : <LoginPage />} />
      <Route path="/patient-dashboard" element={user ? <PatientDashboard /> : <LoginPage />} />
      <Route path="/appointment-customer-details" element={user ? <AppointmentCustomerDetails /> : <LoginPage />} />
      <Route path="/whatsapp-confirmation" element={user ? <WhatsAppConfirmation /> : <LoginPage />} />
      <Route path="/welcome-page" element={user ? <WelcomePage /> : <LoginPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.hasChildNodes()) {
  let root = (window as any).__appRoot;
  if (!root) {
    root = createRoot(rootElement);
    (window as any).__appRoot = root;
  }
  root.render(<App />);
}
