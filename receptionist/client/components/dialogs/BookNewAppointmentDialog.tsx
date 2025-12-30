import { useState, useEffect, useRef } from "react";

// Utility to capitalize the first letter of every word
function capitalizeWords(str: string) {
  return str.replace(/\b\w+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
}

interface BookNewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function BookNewAppointmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: BookNewAppointmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
  const [showCustomerFields, setShowCustomerFields] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    customerId: "",
    isNewCustomer: false,
    customer: {
      phone: "",
      firstName: "",
      age: "",
      gender: "",
    },
  });

  const lookupController = useRef<AbortController | null>(null);
  const skipNextLookup = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        customerId: "",
        isNewCustomer: false,
        customer: {
          phone: "",
          firstName: "",
          age: "",
          gender: "",
        },
      });
      setShowCustomerFields(false);
      setCustomerSuggestions([]);
      setSelectedFile(null);
      setPreviewUrl("");
    }
  }, [open]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Phone number lookup with debounce
  useEffect(() => {
    if (skipNextLookup.current) {
      skipNextLookup.current = false;
      return;
    }

    const raw = formData.customer.phone || "";
    const phone = raw.replace(/\D/g, "");

    if (!phone || phone.length < 6) {
      setCustomerSuggestions([]);
      if (lookupController.current) {
        try {
          lookupController.current.abort();
        } catch (e) {}
        lookupController.current = null;
      }
      return;
    }

    // Debounce
    const timer = setTimeout(() => {
      performLookup(phone);
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.customer.phone]);

  const performLookup = async (phone: string) => {
    if (lookupController.current) {
      try {
        lookupController.current.abort();
      } catch (e) {}
    }

    const ac = new AbortController();
    lookupController.current = ac;

    try {
      setCustomerLookupLoading(true);
      const res = await axiosInstance.get(`/customers?phone=${encodeURIComponent(phone)}&limit=5`, {
        signal: ac.signal,
      });

      if (!ac.signal.aborted) {
        const matches: Customer[] = res.data?.data || [];

        if (matches.length === 0) {
          // No matches - offer to add new customer
          const addSuggestion: any = {
            id: "__add__",
            firstName: "",
            lastName: "",
            email: "",
            phone,
          };
          setCustomerSuggestions([addSuggestion]);
          setFormData((prev) => ({ ...prev, customerId: "", isNewCustomer: true }));
        } else {
          // Show suggestions
          setCustomerSuggestions(matches);
          setFormData((prev) => ({ ...prev, customerId: "", isNewCustomer: true }));
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError" || ac.signal.aborted) return;
      console.error("Customer lookup failed:", err);
      if (!ac.signal.aborted) {
        setFormData((prev) => ({ ...prev, customerId: "", isNewCustomer: true }));
      }
    } finally {
      if (lookupController.current === ac) {
        lookupController.current = null;
      }
      setCustomerLookupLoading(false);
    }
  };

  const handlePhoneEnter = async () => {
    const raw = formData.customer.phone || "";
    const phone = raw.replace(/\D/g, "");

    if (!phone || phone.length < 6) {
      setFormData((prev) => ({ ...prev, customerId: "", isNewCustomer: true }));
      setCustomerSuggestions([]);
      setShowCustomerFields(true);
      return;
    }

    try {
      if (lookupController.current) {
        try {
          lookupController.current.abort();
        } catch (e) {}
        lookupController.current = null;
      }

      const res = await axiosInstance.get(`/customers?phone=${encodeURIComponent(phone)}&limit=5`);
      const matches: Customer[] = res.data?.data || [];

      if (matches.length === 0) {
        setCustomerSuggestions([]);
        setFormData((prev) => ({
          ...prev,
          customerId: "",
          isNewCustomer: true,
          customer: {
            firstName: "",
            age: "",
            gender: "",
            phone: raw,
          },
        }));
        setShowCustomerFields(true);
      } else {
        // Populate with the first match (prefer exact phone match if present)
        const exact = matches.find((m) => (m.phone || "").replace(/\D/g, "") === phone);
        const chosen = exact || matches[0];

        setFormData((prev) => ({
          ...prev,
          customerId: chosen.id,
          isNewCustomer: false,
          customer: {
            firstName: chosen.firstName ?? "",
            age: "", // We'll need to calculate from dateOfBirth if needed
            gender: chosen.gender ?? "",
            phone: chosen.phone ?? raw,
          },
        }));
        setCustomerSuggestions([]);
        setShowCustomerFields(true);
      }
    } catch (error) {
      console.error("Phone lookup error:", error);
      setCustomerSuggestions([]);
      setFormData((prev) => ({ ...prev, customerId: "", isNewCustomer: true }));
      setShowCustomerFields(true);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    skipNextLookup.current = true;
    setTimeout(() => {
      skipNextLookup.current = false;
    }, 800);

    if (customer.id === "__add__") {
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        isNewCustomer: true,
        customer: {
          firstName: "",
          age: "",
          gender: "",
          phone: customer.phone ?? prev.customer.phone,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        customerId: customer.id,
        isNewCustomer: false,
        customer: {
          firstName: customer.firstName ?? "",
          age: "", // Calculate from dateOfBirth if needed
          gender: customer.gender ?? "",
          phone: customer.phone ?? prev.customer.phone,
        },
      }));
    }

    setCustomerSuggestions([]);
    setShowCustomerFields(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customer.phone) {
      toast.error("Phone number is required");
      return;
    }

    if (formData.isNewCustomer) {
      if (!formData.customer.firstName) {
        toast.error("Full name is required");
        return;
      }
      if (!formData.customer.age) {
        toast.error("Age is required");
        return;
      }
      if (!formData.customer.gender) {
        toast.error("Gender is required");
        return;
      }
    }

    setIsLoading(true);
    try {
      let customerId = formData.customerId;

      if (formData.isNewCustomer) {
        // Create new customer
        const customerData: any = {
          phone: formData.customer.phone,
          firstName: formData.customer.firstName,
          gender: formData.customer.gender,
          metadata: {
            age: formData.customer.age,
          },
        };
        const response = await axiosInstance.post("/customers", customerData);
        customerId = response.data.data.id;
      }

      // Always create a walk-in appointment for this customer
      const appointmentData = {
        staffId: null, // You may want to select/assign a staff member in the UI
        serviceId: null,
        customerId,
        startAt: null,
        endAt: null,
        status: 'PENDING',
        price: 0,
        currency: 'INR',
        notes: '',
        customerNotes: '',
        appointmentType: 'WALKIN',
      };

      // You may want to prompt for staffId/serviceId in the dialog; for now, set as null
      await axiosInstance.post("/appointments", appointmentData);

      toast.success(
        formData.isNewCustomer
          ? "Walk-in appointment created successfully!"
          : "Walk-in appointment created for existing customer!"
      );

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.response?.data?.error || "Failed to process request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl py-[64.5px] px-[68.5px]">
        <DialogHeader>
          <DialogTitle className="text-[36px] font-normal text-center">
            Book New <span className="text-[#1D5287] font-bold">Appointment</span>
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-[#0D0D0D]">Please provide your details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-base font-medium mb-5">Complete Your Registration</h3>

            {/* Row 1: Phone Number and Full Name */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Phone Number */}
              <div className="relative">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.customer.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      skipNextLookup.current = false;
                      setFormData((prev) => ({
                        ...prev,
                        customerId: "",
                        isNewCustomer: true,
                        customer: { ...prev.customer, phone: value },
                      }));
                      setCustomerSuggestions([]);
                      setShowCustomerFields(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handlePhoneEnter();
                    }
                  }}
                  maxLength={10}
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
                {customerLookupLoading && (
                  <div className="absolute top-9 right-3">
                    <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                {/* Customer Suggestions Dropdown */}
                {customerSuggestions.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded shadow-lg max-h-48 overflow-auto">
                    {customerSuggestions.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        className="w-full text-left px-4 py-3 hover:bg-slate-100 border-b last:border-b-0"
                        onClick={() => handleSelectCustomer(c)}
                      >
                        <div className="font-medium">
                          {c.id === "__add__" ? (
                            <span className="text-blue-600">+ Add {c.phone}</span>
                          ) : (
                            <>
                              {c.firstName} {c.lastName}
                            </>
                          )}
                        </div>
                        {c.id !== "__add__" && (
                          <div className="text-sm text-muted-foreground">{c.phone}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="firstName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Enter Your Full Name"
                  value={formData.customer.firstName}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z\s.'-]/g, "");
                    setFormData((prev) => ({
                      ...prev,
                      customer: { ...prev.customer, firstName: capitalizeWords(value) },
                    }));
                  }}
                  disabled={!showCustomerFields}
                  readOnly={!formData.isNewCustomer && formData.customerId !== ""}
                  maxLength={100}
                />
              </div>
            </div>

            {/* Row 2: Age and Gender */}
            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <Label htmlFor="age">
                  Age <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Your Age"
                  value={formData.customer.age}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const numValue = parseInt(value);
                    if (value === "" || (numValue >= 1 && numValue <= 150)) {
                      setFormData((prev) => ({
                        ...prev,
                        customer: { ...prev.customer, age: value },
                      }));
                    }
                  }}
                  disabled={!showCustomerFields}
                  min="1"
                  max="150"
                  inputMode="numeric"
                />
              </div>

              {/* Gender */}
              <div>
                <Label htmlFor="gender">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <select
                  id="gender"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData.customer.gender}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customer: { ...prev.customer, gender: e.target.value },
                    }))
                  }
                  disabled={!showCustomerFields}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Profile Photo */}
            <div className="mt-4">
              <Label>Profile Photo (Optional)</Label>
              <div
                className="mt-2 border-2 border-[#E9EAEB] bg-[#FFFFFF] rounded-lg py-[15px] flex justify-center items-center text-center transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover mb-2"
                    />
                    <p className="text-sm text-gray-600">Click to change photo</p>
                  </div>
                ) : (
                  <>
                  <div className="flex gap-[7px] ">
                    <img src="/fi_711191.png" className="size-[21px] text-blue-500" />
                    <span className="font-medium">Upload Photo</span>
                  </div>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#75B640] to-[#52813C] text-white py-6 text-lg "
            disabled={isLoading || !showCustomerFields}
          >
            {isLoading ? "Processing..." : "Create Appointment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
