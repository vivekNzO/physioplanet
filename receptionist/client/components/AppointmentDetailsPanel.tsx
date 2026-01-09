import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import GeneralInformationDialog from "./dialogs/GeneralInformationDialog";
import ClientLastFeedbackDialog from "./dialogs/ClientLastFeedbackDialog";
import { Pencil, Trash2 } from "lucide-react";
import { getStatusFromTimes } from "@/utils/statusHelper";
import toast from "react-hot-toast";

export enum PatientQueueStatus {
  IN_EXERCISE = "IN_EXERCISE",
  WAITING = "WAITING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING"
}

export interface Customer {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  notes?: string | null;
  photoUrl?: string | null;
  metadata?: any;
}

export interface Staff {
  id: string;
  displayName: string;
}

export interface Service {
  id: string;
  name: string;
}

export interface Appointment {
  id: string;
  staffId: string;
  serviceId?: string | null;
  customerId: string;
  startAt: string;
  endAt: string;
  status: string;
  price: number;
  currency: string;
  appointmentType?: 'WALKIN' | 'PREBOOKING';
  customer?: Customer;
  staff?: Staff;
  service?: Service;
}

export interface QueueItem {
  id: string;
  ticketNo: string;
  customer: Customer;
  appointments: Appointment[];
  queueStatus: PatientQueueStatus;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, Plus, Camera } from "lucide-react";
import { format } from "date-fns";
import { utcToIst, formatDateInIstMMDDYYYY } from "@/utils/dateUtils";
import SellPlanDialog from "./dialogs/SellPlanDialog";
import { useAuth } from "../context/AuthContext";
import SellPlanDialog2 from "./dialogs/SellPlanDialog2";
import PaymentHistoryDialog from "./dialogs/PaymentHistoryDialog";
import PurchaseHistoryDialog from "./dialogs/PurchaseHistoryDialog";
import RecordPaymentDialog from "./dialogs/RecordPaymentDialog";
import ManageWalkInAppointmentDialog from "./dialogs/ManageWalkInAppointmentDialog";

interface AppointmentDetailsPanelProps {
  item: QueueItem;
  onPaymentRecorded?: () => void;
  onAppointmentUpdated?: (appointmentId: string) => void;
  onCustomerUpdated?: () => void;
}

export default function AppointmentDetailsPanel({ item, onPaymentRecorded, onAppointmentUpdated, onCustomerUpdated }: AppointmentDetailsPanelProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const { tenantId } = useAuth();
  const [generalInfoOpen, setGeneralInfoOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [prescriptionPhotos, setPrescriptionPhotos] = useState<{ id: string; imageUrl: string; uploadedAt: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [appointmentPurchases, setAppointmentPurchases] = useState<Record<string, any[]>>({}); // Map of appointmentId -> purchases
  const [appointmentUpdateTimestamp, setAppointmentUpdateTimestamp] = useState<number>(0); // Track when appointment was updated
  const [sellPlanDialogOpen, setSellPlanDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [purchaseHistoryDialogOpen, setPurchaseHistoryDialogOpen] = useState(false);
  const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [customTotal, setCustomTotal] = useState<number | null>(null);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [paymentHistoryDialogOpen, setPaymentHistoryDialogOpen] = useState(false);
  const [manageWalkInDialogOpen, setManageWalkInDialogOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [updatedAvatarUrl, setUpdatedAvatarUrl] = useState<string | null>(null);

  const fullName = `${item.customer.firstName || ""} ${item.customer.lastName || ""}`.trim() || "Unknown Patient";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getFullPhotoUrl = (photoUrl: string | null | undefined) => {
    if (!photoUrl) return null;
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${apiBase}/api${photoUrl}`;
  };

  // Get avatar URL - check updated URL first, then photoUrl, then fallback to metadata
  const avatarUrl = updatedAvatarUrl || getFullPhotoUrl(item.customer.photoUrl) || item.customer.metadata?.avatar || item.customer.metadata?.profileImage;

  // Fetch prescriptions from backend - get ALL prescriptions for this customer
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!item.customer.id) return;
      try {
        const res = await axiosInstance.get(
          `/prescriptions?customerId=${item.customer.id}`
        );
        setPrescriptionPhotos(res.data.prescriptions || []);
      } catch (err) {
        setPrescriptionPhotos([]);
      }
    };
    fetchPrescriptions();
  }, [item.customer.id]);

  // Fetch ALL appointments for this customer
  useEffect(() => {
    const fetchAllAppointments = async () => {
      if (!item.customer.id) return;
      try {
        const res = await axiosInstance.get(
          `/appointments?customerId=${item.customer.id}`
        );
        const appointments = res.data.data || [];
        setAllAppointments(appointments);
        
        // Fetch purchases for each appointment
        const purchasesMap: Record<string, any[]> = {};
        await Promise.all(
          appointments.map(async (apt: any) => {
            if (apt.id) {
              try {
                const purchaseRes = await axiosInstance.get(
                  `/purchase?appointmentId=${apt.id}`
                );
                if (purchaseRes.data?.success && purchaseRes.data.data) {
                  purchasesMap[apt.id] = purchaseRes.data.data;
                }
              } catch (err) {
                console.error(`Failed to fetch purchases for appointment ${apt.id}:`, err);
              }
            }
          })
        );
        setAppointmentPurchases(purchasesMap);
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
        setAllAppointments([]);
      }
    };
    fetchAllAppointments();
  }, [item.customer.id]);

  // Handle prescription photo upload/capture
  const handlePrescriptionPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append("appointmentId", item.appointments[0]?.id);
    formData.append("customerId", item.customer.id);
    Array.from(files).forEach(file => formData.append("images", file));

    setUploading(true);
    try {
      await axiosInstance.post(
        "/prescriptions",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      // Refresh prescription list - get all prescriptions for customer
      const res = await axiosInstance.get(
        `/prescriptions?customerId=${item.customer.id}`
      );
      setPrescriptionPhotos(res.data.prescriptions || []);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Handle avatar photo upload
  const handleAvatarPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);
    
    // Only send fields that exist in Prisma Customer model and are updatable
    // Valid Prisma Customer fields: id, tenantId, userId (relation), email, phone, firstName, lastName, 
    // dateOfBirth, notes, metadata, photoUrl, createdAt, updatedAt, gender
    // We only send updatable fields (not id, tenantId, createdAt, updatedAt, userId, metadata)
    const customer = item.customer;
    
    // Required field
    if (customer.firstName) {
      formData.append("firstName", customer.firstName);
    }
    
    // Optional fields - only send if they have values
    if (customer.lastName && customer.lastName.trim()) {
      formData.append("lastName", customer.lastName);
    }
    if (customer.email && customer.email.trim()) {
      formData.append("email", customer.email);
    }
    if (customer.phone && customer.phone.trim()) {
      formData.append("phone", customer.phone);
    }
    if (customer.gender && customer.gender.trim()) {
      formData.append("gender", customer.gender);
    }
    if (customer.dateOfBirth) {
      formData.append("dateOfBirth", customer.dateOfBirth);
    }
    if (customer.notes && customer.notes.trim()) {
      formData.append("notes", customer.notes);
    }
    
    // Explicitly do NOT send:
    // - userId (it's a relation, not a direct field)
    // - age, weight, bloodGroup, address, city, state, zipCode (don't exist in Prisma schema)
    // - id, tenantId, createdAt, updatedAt, metadata (not updatable or handled separately)

    setUploadingAvatar(true);
    try {
      const { data } = await axiosInstance.put(
        `/customers/${item.customer.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data?.success && data?.data) {
        const updatedPhotoUrl = data.data.photoUrl;
        if (updatedPhotoUrl) {
          setUpdatedAvatarUrl(getFullPhotoUrl(updatedPhotoUrl));
        }
        toast.success('Profile photo updated successfully');
        // Notify parent to refresh customer data
        if (onCustomerUpdated) {
          onCustomerUpdated();
        }
      } else {
        toast.error('Failed to update profile photo');
      }
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      toast.error(err?.response?.data?.error || 'Failed to update profile photo');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Get automatic status based on time
  const getAppointmentStatus = (appointment: Appointment) => {
    // If status is CANCELLED (manually set), return it
    if (appointment.status === "CANCELLED") return "Cancelled";
    
    // Otherwise, determine status based on startAt and endAt times
    const autoStatus = getStatusFromTimes(appointment.startAt, appointment.endAt);
    return autoStatus;
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completed") return "bg-green-100 text-green-700 border-green-300";
    if (statusLower === "cancelled") return "bg-red-100 text-red-700 border-red-300";
    if (statusLower === "in exercise") return "bg-blue-100 text-blue-700 border-blue-300";
    if (statusLower === "waiting") return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-gray-100 text-gray-700 border-gray-300";
  };
  
  const now = new Date();
  
  const pastVisits = allAppointments.filter((apt) => {
    if (!apt.startAt) return false;
    const appointmentDate = utcToIst(apt.startAt);
    return appointmentDate < now;
  });
  
  const futureVisits = allAppointments.filter((apt) => {
    if (!apt.startAt) return false;
    const appointmentDate = utcToIst(apt.startAt);
    return appointmentDate >= now;
  });

  // Fetch most recent package bought by the customer
  const [recentPackage, setRecentPackage] = useState<{ name: string; totalSessions?: number; usedSessions?: number } | null>(null);
  // Function to fetch latest package
  const fetchLatestPackage = () => {
    if (!item.customer.id) return;
    axiosInstance.get(`/purchase/latest-package?customerId=${item.customer.id}`)
      .then(res => {
        if (res.data && res.data.success && res.data.data) {
          setRecentPackage(res.data.data);
        } else {
          setRecentPackage(null);
        }
      })
      .catch(() => {
        setRecentPackage(null);
      });
  };

  useEffect(() => {
    fetchLatestPackage();
  }, [item.customer.id]);

  // Handle payment-only (no purchase) - called from Record Payment button
  const handleRecordPaymentOnly = async (amount: number, method: 'cash' | 'online') => {
    if (recordingPayment) return;
    setRecordingPayment(true);

    try {
      const paymentRes = await axiosInstance.post('/payments', {
        tenantId: tenantId || '',
        customerId: item.customer.id,
        appointmentId: item.appointments[0]?.id || null,
        amount,
        currency: item.appointments[0]?.currency || 'INR',
        mode: method, // 'cash' or 'online'
        status: 'completed',
      });

      if (paymentRes.data && paymentRes.data.success) {
        toast.success(`Payment of ₹${amount} recorded successfully (${method})`);
        setRecordPaymentDialogOpen(false);
        if (onPaymentRecorded) {
          onPaymentRecorded();
        }
      } else {
        toast.error(paymentRes.data?.error || 'Failed to record payment');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'An error occurred while recording payment');
    } finally {
      setRecordingPayment(false);
    }
  };
  



  return (
    <div className="flex flex-col max-h-[728px] w-full">
      {/* Header */}
      <div className="border-b bg-white mb-[10px] border-gray-200 py-6 px-8 ">
        <div className="mb-[21px]">
            <div className="text-sm font-semibold text-[#1D5287]">Ticket No. <span className="ml-[7px] text-[16px] font-normal text-[#65758B]">{item.ticketNo}</span></div>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-[10px]">
            <div className="relative">
              <Avatar className="h-[60px] w-[60px]">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarPhoto}
                disabled={uploadingAvatar}
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Update profile photo"
              >
                {uploadingAvatar ? (
                  <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
              </label>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{fullName}</h2>
              <div className="flex items-center gap-3 mt-1">
                {item.customer.phone && (
                  <div className="flex items-center gap-1 text-xs font-medium text-[#1D5287]">
                    <Phone className="h-3 w-3" />
                    <span>{item.customer.phone}</span>
                  </div>
                )}
                {item.customer.email && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{item.customer.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Tab Buttons */}

        <div className="flex gap-5">
        {(() => {
          const appointment = item.appointments?.[0];
          if (!appointment) return null;
          
          // Check if endAt is not null and has passed - if so, don't show button
          if (appointment.endAt) {
            const endDate = new Date(appointment.endAt);
            const now = new Date();
            if (endDate < now) {
              return null; // Don't show button if appointment has ended
            }
          }
          
          // Determine button label based on startAt
          const buttonLabel = appointment.startAt ? 'Reschedule' : 'Manage';
          
          return (
            <Button 
              variant="outline" 
              className="text-xs font-medium"
              onClick={() => setManageWalkInDialogOpen(true)}
            >
              {buttonLabel}
            </Button>
          );
        })()}
          <Button 
            variant="outline" 
            className="text-xs font-medium"
            onClick={() => setGeneralInfoOpen(true)}
          >
            General Information
          </Button>
          <Button 
            variant="outline" 
            className="text-xs font-medium"
            onClick={() => setFeedbackOpen(true)}
          >
            Last Feedbacks
          </Button>

        </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex w-full gap-[10px] max-h-[286px] mb-2.5 shrink-0">
        {/* Prescriptions Photos Section */}
        <div className="flex-1 basis-[40%]">
          <Card className="border-gray-200 py-[21px] px-[15.5px] h-full">
          <h3 className="text-[18px] font-normal mb-[25px]">
                Prescription <span className="text-[#1D5287] font-bold">Photos</span>
            </h3>
            <CardContent className="p-0">
              <div className="flex items-start gap-4 bg-white border border-dashed border-[#E5E5E5] rounded-lg p-[11px]">
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="file"
                    id="prescription-upload"
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handlePrescriptionPhoto}
                  />
                  <label htmlFor="prescription-upload">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex items-center justify-center flex-col gap-[5px] h-auto px-[19.5px] py-[11.5px] bg-[#EEF7FB] hover:bg-blue-50 cursor-pointer rounded-lg"
                      onClick={() => document.getElementById('prescription-upload')?.click()}
                    >
                      <div className="w-12 h-12 rounded-full  flex items-center justify-center">
                        <img src="/Mask group (6).png" className="h-[25px] w-[25px] text-white" />
                      </div>
                      <span className="text-[10px] font-medium text-gray-700">Click Photo</span>
                    </Button>
                  </label>
                </div>
                <div className="flex gap-3">
                  {prescriptionPhotos.length > 0 ? (
                    <>
                      {[...prescriptionPhotos]
                        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                        .slice(0, 2)
                        .map((photo, idx) => (
                        <div
                          key={photo.id}
                          className="relative w-[92px] h-[92px] bg-gray-100 rounded-lg border border-gray-300 overflow-hidden flex-shrink-0"
                        >
                          <img
                            src={getFullPhotoUrl(photo.imageUrl)}
                            alt="Prescription"
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              const sortedPhotos = [...prescriptionPhotos].sort(
                                (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
                              );
                              const actualIndex = sortedPhotos.findIndex(p => p.id === photo.id);
                              setCurrentImageIndex(actualIndex);
                              setLightboxOpen(true);
                            }}
                          />
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!confirm('Are you sure you want to delete this prescription?')) return;
                              
                              try {
                                await axiosInstance.delete(`/prescriptions?id=${photo.id}`);
                                setPrescriptionPhotos(prescriptionPhotos.filter(p => p.id !== photo.id));
                                toast.success('Prescription deleted successfully');
                              } catch (error) {
                                console.error('Failed to delete prescription:', error);
                                toast.error('Failed to delete prescription');
                              }
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                            title="Delete prescription"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex items-center justify-center text-gray-400 text-sm h-[92px] flex-1">
                      No photos added yet
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-[#F0F9E8] border border-[#D4E7C5] rounded p-3 mt-4">
                <p className="text-xs text-gray-700">
                  <span className="font-semibold text-[#52813C]">Note:-</span> Always click a clean photo of your Prescription for better results.
                  {uploading && <span className="ml-2 text-blue-600">Uploading...</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Details Section */}
        <div className="flex-1 basis-[30%]">
          <Card className="border-gray-200 p-5 h-full flex flex-col">
           <h3 className="text-[18px] font-normal mb-[25px]">
                Plan <span className="text-[#1D5287] font-bold">Details</span>
            </h3>
            <CardContent className="p-0 bg-white flex flex-col justify-between flex-1">
              <div className="mb-6">
                <h4 className="text-xl font-medium mb-2">{recentPackage ? recentPackage.name : "No package purchased yet"}</h4>
              </div>
              <div>
              <Button
                className="w-full text-xs bg-gradient-to-r from-[#75B640] to-[#52813C] text-white"
                onClick={() => setSellPlanDialogOpen(true)}
              >
                Sell New Plan
              </Button>
              <SellPlanDialog
                open={sellPlanDialogOpen}
                onClose={() => setSellPlanDialogOpen(false)}
                onSelect={pkg => {
                  setSelectedPackage(pkg);
                  setSellPlanDialogOpen(false);
                }}
                tenantId={tenantId || ""}
                customerId={item.customer.id}
                appointmentId={item.appointments[0]?.id || null}
                currency={item.appointments[0]?.currency || "INR"}
                onPurchaseComplete={() => {
                  fetchLatestPackage();
                  if (onPaymentRecorded) {
                    onPaymentRecorded();
                  }
                }}
              />
              <Button variant="outline" className="w-full text-xs mt-2 font-medium" onClick={() => setPurchaseHistoryDialogOpen(true)}>
                  View Past Purchases
                </Button>
                <PurchaseHistoryDialog
                  open={purchaseHistoryDialogOpen}
                  onClose={() => setPurchaseHistoryDialogOpen(false)}
                  customerId={item.customer.id}
              />
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary Section */}
        <div className="flex-1 basis-[30%]">
          <Card className="border-gray-200 p-5 h-full flex flex-col">
            <h3 className="text-[18px] font-normal mb-[25px]">
                Payment <span className="text-[#1D5287] font-bold">Summary</span>
            </h3>
            <CardContent className="p-0 bg-white flex flex-col justify-between flex-1">
              <div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-[18px] font-medium text-[#101111]">
                    <span className={`font-semibold ${item.pendingAmount === 0 ? 'text-gray-500' : 'text-red-600'}`}>
                      ₹{item.pendingAmount.toLocaleString()}.00 PENDING
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[18px] font-semibold">
                    <span className="text-green-600 font-semibold">₹{item.paidAmount.toLocaleString()}.00 PAID</span>
                  </div>

                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-[#75B640] to-[#52813C] text-white text-xs font-medium"
                  onClick={() => {
                    setRecordPaymentDialogOpen(true);
                  }}
                >
                  Record Payment
                </Button>
                <Button variant="outline" className="w-full text-xs font-medium" onClick={() => setPaymentHistoryDialogOpen(true)}>
                  View Past Payment
                </Button>
                <PaymentHistoryDialog
                  open={paymentHistoryDialogOpen}
                  onClose={() => setPaymentHistoryDialogOpen(false)}
                  customerId={item.customer.id}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

        {/* Visits Section with Tabs */}
        <div>
          <Tabs defaultValue="future" className="w-full">
            <TabsList className="bg-blue-600 mb-4 p-0 h-auto rounded-lg overflow-hidden">
              <TabsTrigger 
                value="future" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 rounded-none px-6 py-2.5 font-medium"
              >
                Future Visits ({futureVisits.length})
              </TabsTrigger>
              <TabsTrigger 
                value="past"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 rounded-none px-6 py-2.5 font-medium"
              >
                Past Visits ({pastVisits.length})
              </TabsTrigger>
              {/* <TabsTrigger 
                value="planned"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 rounded-none px-6 py-2.5 font-medium"
              >
                Planned Treatments
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="future" className="mt-0 h-full">
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                      <colgroup>
                        <col className="w-[50%]" />
                        <col className="w-[20%]" />
                        <col className="w-[15%]" />
                        <col className="w-[15%]" />
                      </colgroup>
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Services</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Staff</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Visit</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                        </tr>
                      </thead>
                    </table>
                    <div className="max-h-[175px] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      <style>{`
                        div::-webkit-scrollbar { display: none; }
                      `}</style>
                      <table className="w-full table-fixed">
                      <colgroup>
                        <col className="w-[50%]" />
                        <col className="w-[20%]" />
                        <col className="w-[15%]" />
                        <col className="w-[15%]" />
                      </colgroup>
                      <tbody className="bg-white">
                        {futureVisits.length > 0 ? (
                          futureVisits.map((appointment) => {
                            const displayStatus = getAppointmentStatus(appointment);
                            // Get purchases for this appointment
                            const purchases = appointmentPurchases[appointment.id] || [];
                            // Extract item names from purchases
                            const itemNames: string[] = [];
                            purchases.forEach((purchase: any) => {
                              if (purchase.details && Array.isArray(purchase.details)) {
                                purchase.details.forEach((detail: any) => {
                                  if (detail.itemName) {
                                    itemNames.push(detail.itemName);
                                  }
                                });
                              }
                            });
                            
                            return (
                              <tr key={appointment.id} className="border-b border-gray-100">
                                <td className="p-4 text-sm">
                                  {itemNames.length > 0 ? (
                                    <div className="space-y-1">
                                      {itemNames.map((name, idx) => (
                                        <div key={idx}>{name}</div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">No plan purchased</span>
                                  )}
                                </td>
                                <td className="p-4 text-sm">{appointment.staff?.displayName || "N/A"}</td>
                                <td className="p-4 text-sm">{appointment.startAt ? formatDateInIstMMDDYYYY(appointment.startAt) : "-"}</td>
                                <td className="p-4">
                                  <Badge className={getStatusBadgeColor(displayStatus)}>
                                    {displayStatus}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-500">
                              No future visits scheduled
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

              <TabsContent value="past" className="mt-0">
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                      <colgroup>
                        <col className="w-[50%]" />
                        <col className="w-[20%]" />
                        <col className="w-[15%]" />
                        <col className="w-[15%]" />
                      </colgroup>
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Services</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Staff</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Visit</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                        </tr>
                      </thead>
                    </table>
                    <div className="max-h-[175px] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      <style>{`
                        div::-webkit-scrollbar { display: none; }
                      `}</style>
                      <table className="w-full table-fixed">
                      <colgroup>
                        <col className="w-[50%]" />
                        <col className="w-[20%]" />
                        <col className="w-[15%]" />
                        <col className="w-[15%]" />
                      </colgroup>
                      <tbody className="bg-white">
                        {pastVisits.length > 0 ? (
                          pastVisits.map((appointment) => {
                            const displayStatus = getAppointmentStatus(appointment);
                            const purchases = appointmentPurchases[appointment.id] || [];
                            const itemNames: string[] = [];
                            purchases.forEach((purchase: any) => {
                              if (purchase.details && Array.isArray(purchase.details)) {
                                purchase.details.forEach((detail: any) => {
                                  if (detail.itemName) {
                                    itemNames.push(detail.itemName);
                                  }
                                });
                              }
                            });
                            
                            return (
                              <tr key={appointment.id} className="border-b border-gray-100">
                                <td className="p-4 text-sm">
                                  {itemNames.length > 0 ? (
                                    <div className="space-y-1">
                                      {itemNames.map((name, idx) => (
                                        <div key={idx}>{name}</div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">No plan purchased</span>
                                  )}
                                </td>
                                <td className="p-4 text-sm">{appointment.staff?.displayName || "N/A"}</td>
                                <td className="p-4 text-sm">{appointment.startAt ? formatDateInIstMMDDYYYY(appointment.startAt) : "-"}</td>
                                <td className="p-4">
                                  <Badge className={getStatusBadgeColor(displayStatus)}>
                                    {displayStatus}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr className="h-full">
                            <td colSpan={4} className="p-8 text-center text-gray-500">
                              No past visits found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="planned" className="mt-0">
              <Card className="border-gray-200">
                <CardContent className="p-6 bg-white">
                  <p className="text-gray-500 text-center">Planned treatments will appear here</p>
                </CardContent>
              </Card>
              <div className="p-4 border-t border-gray-200 bg-white">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add/Edit Exercises
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      {/* General Information Dialog */}
      
      {/* General Information Dialog */}
      <GeneralInformationDialog
        open={generalInfoOpen}
        onOpenChange={setGeneralInfoOpen}
        customer={item.customer}
        onSave={() => {}}
      />

      {/* Client Last Feedback Dialog */}
      <ClientLastFeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        customer={item.customer}
        onSave={() => {}}
      />

      {/* Record Payment Dialog (Payment-only, no purchase) */}
      <RecordPaymentDialog
        open={recordPaymentDialogOpen}
        onClose={() => {
          setRecordPaymentDialogOpen(false);
          setCustomTotal(null);
          setIsEditingTotal(false);
        }}
        defaultAmount={Math.max(0, item.pendingAmount || 0)}
        onPay={handleRecordPaymentOnly}
        selectedPackages={[]}
        selectedServices={[]}
        totalCalculated={Math.max(0, item.pendingAmount || 0)}
        customTotal={customTotal}
        onTotalChange={setCustomTotal}
        isEditingTotal={isEditingTotal}
        onEditTotal={setIsEditingTotal}
        paying={recordingPayment}
        pendingAmount={item.pendingAmount || 0}
      />

      {/* Manage Walk-in Appointment Dialog */}
      {item.appointments && item.appointments[0] && (
        <ManageWalkInAppointmentDialog
          open={manageWalkInDialogOpen}
          onClose={() => setManageWalkInDialogOpen(false)}
          appointment={{
            id: item.appointments[0].id,
            staffId: item.appointments[0].staffId,
            startAt: item.appointments[0].startAt,
            endAt: item.appointments[0].endAt,
            customerId: item.customer.id,
          }}
          onUpdate={(appointmentId) => {
            // Mark that an appointment was updated - this will trigger TimeSlots refresh when dialog reopens
            setAppointmentUpdateTimestamp(Date.now());
            
            // Refresh all appointments for this customer (for Future/Past Visits tabs)
            const fetchAllAppointments = async () => {
              try {
                const res = await axiosInstance.get(
                  `/appointments?customerId=${item.customer.id}`
                );
                const appointments = res.data.data || [];
                setAllAppointments(appointments);
                
                // Refresh purchases for each appointment
                const purchasesMap: Record<string, any[]> = {};
                await Promise.all(
                  appointments.map(async (apt: any) => {
                    if (apt.id) {
                      try {
                        const purchaseRes = await axiosInstance.get(
                          `/purchase?appointmentId=${apt.id}`
                        );
                        if (purchaseRes.data?.success && purchaseRes.data.data) {
                          purchasesMap[apt.id] = purchaseRes.data.data;
                        }
                      } catch (err) {
                        console.error(`Failed to fetch purchases for appointment ${apt.id}:`, err);
                      }
                    }
                  })
                );
                setAppointmentPurchases(purchasesMap);
              } catch (err) {
                console.error("Error refreshing appointments:", err);
              }
            };
            fetchAllAppointments();

            // Trigger parent refresh (refreshes queue and updates selected item)
            if (onAppointmentUpdated && appointmentId) {
              onAppointmentUpdated(appointmentId);
            }
          }}
          appointmentUpdateTimestamp={appointmentUpdateTimestamp}
        />
      )}

      {/* Prescription Photos Lightbox */}
      {lightboxOpen && prescriptionPhotos.length > 0 && (() => {
        const sortedPhotos = [...prescriptionPhotos].sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
        const currentPhoto = sortedPhotos[currentImageIndex];
        
        const handlePrev = () => {
          setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : sortedPhotos.length - 1));
        };
        
        const handleNext = () => {
          setCurrentImageIndex((prev) => (prev < sortedPhotos.length - 1 ? prev + 1 : 0));
        };

        const formatDate = (dateString: string) => {
          if (!dateString) return 'Date not available';          
          try {
            // Try parsing the date
            let date = new Date(dateString);
            
            // If invalid, try with UTC timezone
            if (isNaN(date.getTime())) {
              date = new Date(dateString + 'Z');
            }
            
            // If still invalid
            if (isNaN(date.getTime())) {
              console.error('Invalid date:', dateString);
              return 'Date not available';
            }
                      
            return date.toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          } catch (error) {
            console.error('Date formatting error:', error, dateString);
            return 'Date not available';
          }
        };

        const handleDelete = async () => {
          if (!confirm('Are you sure you want to delete this prescription?')) return;
          
          try {
            await axiosInstance.delete(`/prescriptions?id=${currentPhoto.id}`);
            
            // Remove from local state
            const updatedPhotos = prescriptionPhotos.filter(p => p.id !== currentPhoto.id);
            setPrescriptionPhotos(updatedPhotos);
            
            // If no more photos, close lightbox
            if (updatedPhotos.length === 0) {
              setLightboxOpen(false);
            } else {
              // Adjust index if needed
              if (currentImageIndex >= updatedPhotos.length) {
                setCurrentImageIndex(updatedPhotos.length - 1);
              }
            }
          } catch (error) {
            console.error('Failed to delete prescription:', error);
            alert('Failed to delete prescription');
          }
        };

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-bold z-10 w-12 h-12 flex items-center justify-center"
            >
              ×
            </button>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="absolute top-4 right-20 text-white hover:text-red-400 z-10 w-12 h-12 flex items-center justify-center transition-colors"
              title="Delete prescription"
            >
              <Trash2 className="w-6 h-6" />
            </button>

            {/* Left arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="absolute top-4 right-20 text-white hover:text-red-400 z-10 w-12 h-12 flex items-center justify-center transition-colors"
              title="Delete prescription"
            >
              <Trash2 className="w-6 h-6" />
            </button>

            {/* Left arrow */}
            {sortedPhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-5xl font-bold z-10 w-16 h-16 flex items-center justify-center"
              >
                ‹
              </button>
            )}

            {sortedPhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-5xl font-bold z-10 w-16 h-16 flex items-center justify-center"
              >
                ›
              </button>
            )}
            <div 
              className="flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '90vw', maxHeight: '90vh' }}
            >
              <img
                src={getFullPhotoUrl(currentPhoto.imageUrl)}
                alt="Prescription"
                className="object-contain"
                style={{
                  width: '80vw',
                  height: '80vh',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                }}
                onError={(e) => {
                  e.currentTarget.src =
                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="16">Image not available</text></svg>';
                }}
              />
              <div className="mt-4 text-white text-center">
                <div className="text-lg font-medium">
                  {formatDate(currentPhoto.uploadedAt)}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  {currentImageIndex + 1} / {sortedPhotos.length}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
