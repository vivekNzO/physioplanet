import "./global.css";

import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import CheckIn from "./pages/CheckIn";
import NewCustomerRegistration from "./pages/NewCustomerRegistration";
import VerifyAppointmentOTP from "./pages/VerifyAppointmentOTP";
import VerifyOTP from "./pages/VerifyOTP";
import VerificationSuccess from "./pages/VerificationSuccess";
import WalkInCheckIn from "./pages/WalkInCheckIn";
import WalkInRegistration from "./pages/WalkInRegistration";
import PatientDashboard from "./pages/PatientDashboard";
import AppointmentCustomerDetails from "./pages/AppointmentCustomerDetails";
import BookAppointment from "./pages/BookAppointment";
import WhatsAppConfirmation from "./pages/WhatsAppConfirmation";
import NotFound from "./pages/NotFound";
import WelcomePage from "./pages/WelcomePage";
import { Toaster } from "react-hot-toast";
import { Toaster as CustomToaster } from "@/components/ui/toaster";
import CustomerProfile from "./pages/CustomerProfile";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import CustomerRecords from "./pages/CustomerRecords";
import IndexSkeleton from "@/skeletons/IndexSkeleton";
import ReceptionDashboard from "./pages/ReceptionDashboard";

const queryClient = new QueryClient();

// Create a new component that uses useAuth
function AppRoutes() {
  const { user, role, loading, tenantId } = useAuth();  
  if (loading) return <IndexSkeleton/>
  
  // Check if user is a customer
  const isCustomer = user?.role?.name?.toLowerCase() === 'customer'
  return (
    <Routes>
      <Route path="/login" element={!user? <LoginPage/> : (isCustomer ? <Navigate to={"/welcome-page"}/> : <Navigate to={"/"}/>)}/>
      <Route path="/" element={user? (isCustomer ? <Navigate to={"/welcome-page"}/> : <Index />) : <Navigate to={"/login"}/>} />
      <Route path="/check-in" element={user&&!isCustomer?<CheckIn /> : <Navigate to={"/login"}/>} />
      <Route path="/new-customer-registration" element={<NewCustomerRegistration />} />
      <Route path="/verify-appointment-otp" element={user?<VerifyAppointmentOTP/>:<Navigate to={"/login"}/>} />
      <Route path="/verify-otp" element={user?<VerifyOTP />:<Navigate to={"/login"}/>} />
      <Route path="/verification-success" element={user?<VerificationSuccess />:<Navigate to={"/login"}/>} />
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route path="/book-appointment" element={user&&!isCustomer?<BookAppointment />:<Navigate to={"/login"}/>} />
      <Route path="/customer-records" element={user&&!isCustomer?<CustomerRecords />:<Navigate to={"/login"}/>} />
      <Route path="/reception-dashboard" element={user&&!isCustomer?<ReceptionDashboard />:<Navigate to={"/login"}/>} />
      <Route path="/whatsapp-confirmation" element={<WhatsAppConfirmation />} />
      <Route path="/welcome-page" element={user&&isCustomer?<WelcomePage />:<Navigate to={"/login"}/>} />
      <Route path="/customer-profile" element={user?<CustomerProfile />:<Navigate to={"/login"}/>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <CustomToaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
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