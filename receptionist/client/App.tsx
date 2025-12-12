import "./global.css";

import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import CustomerProfile from "./pages/CustomerProfile";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/new-customer-registration" element={<NewCustomerRegistration />} />
          <Route path="/verify-appointment-otp" element={<VerifyAppointmentOTP />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/verification-success" element={<VerificationSuccess />} />
          <Route path="/walk-in-check-in" element={<WalkInCheckIn />} />
          <Route path="/walk-in-registration" element={<WalkInRegistration />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/appointment-customer-details" element={<AppointmentCustomerDetails />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/whatsapp-confirmation" element={<WhatsAppConfirmation />} />
          <Route path="/welcome-page" element={<WelcomePage />} />
          <Route path="/customer-profile" element={<CustomerProfile/>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
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
