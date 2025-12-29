import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import GeneralInformationDialog from "./dialogs/GeneralInformationDialog";
import ClientLastFeedbackDialog from "./dialogs/ClientLastFeedbackDialog";
import { Pencil } from "lucide-react";
import { getDefaultStatus } from "@/utils/statusHelper";

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
import { utcToIst } from "@/utils/dateUtils";

interface AppointmentDetailsPanelProps {
  item: QueueItem;
}

export default function AppointmentDetailsPanel({ item }: AppointmentDetailsPanelProps) {
  const [generalInfoOpen, setGeneralInfoOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [prescriptionPhotos, setPrescriptionPhotos] = useState<{ id: string; imageUrl: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const fullName = `${item.customer.firstName || ""} ${item.customer.lastName || ""}`.trim() || "Unknown Patient";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Get avatar URL from metadata if present
  // Check for direct URL first (avatar/profileImage)
  let avatarUrl = item.customer.metadata?.avatar || item.customer.metadata?.profileImage;
  
  // If not found, check for base64 photo data
  if (!avatarUrl && item.customer.metadata?.photo?.data) {
    const photoMeta = item.customer.metadata.photo;
    avatarUrl = `data:${photoMeta.type || 'image/jpeg'};base64,${photoMeta.data}`;
  }

  // Fetch prescriptions from backend
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!item.customer.id || !item.appointments[0]?.id) return;
      try {
        const res = await axiosInstance.get(
          `/prescriptions?customerId=${item.customer.id}&appointmentId=${item.appointments[0].id}`
        );
        setPrescriptionPhotos(res.data.prescriptions || []);
      } catch (err) {
        setPrescriptionPhotos([]);
      }
    };
    fetchPrescriptions();
  }, [item.customer.id, item.appointments]);

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
      // Refresh prescription list
      const res = await axiosInstance.get(
        `/prescriptions?customerId=${item.customer.id}&appointmentId=${item.appointments[0].id}`
      );
      setPrescriptionPhotos(res.data.prescriptions || []);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Get automatic status based on time
  const getAppointmentStatus = (appointment: Appointment) => {
    if (appointment.status === "CANCELLED") return "Cancelled";
    if (appointment.status === "COMPLETED") return "Completed";
    
    // Calculate automatic status based on time
    const autoStatus = getDefaultStatus(appointment.startAt);
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

  const futureVisits = item.appointments.filter((apt) => apt.startAt && utcToIst(apt.startAt) > new Date());
  const pastVisits = item.appointments.filter((apt) => apt.startAt && utcToIst(apt.startAt) <= new Date());

  // Calculate package details
  const packageDetails = {
    name: "Rehab Package for 1 Month",
    totalSessions: 30,
    usedSessions: 21,
  };



  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white mb-[10px] border-gray-200 py-6 px-8 ">
        <div className="mb-[21px]">
            <div className="text-sm font-semibold text-[#1D5287]">Ticket No. <span className="ml-[7px] text-[16px] font-normal text-[#65758B]">{item.ticketNo}</span></div>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-[10px]">
            <Avatar className="h-[60px] w-[60px]">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
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
          <Button variant="outline" className="text-xs font-medium">
            Analytics
          </Button>
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
      <div className="flex w-full gap-[10px] flex-1 max-h-[286px] mb-2.5">
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
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {prescriptionPhotos.length > 0 ? (
                    <>
                      {prescriptionPhotos.slice(0, 2).map((photo) => (
                        <div
                          key={photo.id}
                          className="aspect-video bg-gray-100 rounded-lg border border-gray-300 overflow-hidden"
                        >
                          <img
                            src={photo.imageUrl}
                            alt="Prescription"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {prescriptionPhotos.length > 2 && (
                        <div className="aspect-video bg-blue-50 rounded-lg border-blue-300 overflow-hidden flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              +{prescriptionPhotos.length - 2}
                            </div>
                            <div className="text-xs text-blue-600 font-medium">
                              more
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="col-span-2 flex items-center justify-center text-gray-400 text-sm h-full min-h-[100px]">
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

        {/* Plans Details Section */}
        <div className="flex-1 basis-[30%]">
          <Card className="border-gray-200 p-5 h-full">
           <h3 className="text-[18px] font-normal mb-[25px]">
                Plan <span className="text-[#1D5287] font-bold">Details</span>
            </h3>
            <CardContent className="p-0 bg-white">
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">{packageDetails.name}</h4>
                <div className="text-[32px] font-semibold text-[#1D5287] mb-2">{packageDetails.totalSessions}</div>
                <p className="text-xs font-medium text-[#101111]">
                  Sessions Used ({packageDetails.usedSessions} Total)
                </p>
              </div>
              <Button className="w-full text-xs bg-gradient-to-r from-[#75B640] to-[#52813C] text-white">
                Sell New Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary Section */}
        <div className="flex-1 basis-[30%]">
          <Card className="border-gray-200 p-5 h-full">
            <h3 className="text-[18px] font-normal mb-[25px]">
                Payment <span className="text-[#1D5287] font-bold">Summary</span>
            </h3>
            <CardContent className="p-0 bg-white">
              <div className="mb-6">
                <h4 className="text-xs font-medium mb-[14px]">{packageDetails.name}</h4>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-[18px] font-semibold">
                    <span className="text-red-600 font-semibold">₹{item.totalAmount.toLocaleString()}.00 PAID</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-medium text-[#101111]">
                    <span>₹{item.pendingAmount.toLocaleString()}.00 PENDING</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full bg-gradient-to-r from-[#75B640] to-[#52813C] text-white text-xs font-medium">
                  Record Payment
                </Button>
                <Button variant="outline" className="w-full text-xs font-medium">
                  View Past Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

        {/* Visits Section with Tabs */}
        <div className="mb-6">
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
              <TabsTrigger 
                value="planned"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 rounded-none px-6 py-2.5 font-medium"
              >
                Planned Treatments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="future" className="mt-0">
              <Card className="border-gray-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Services</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Staff:-</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Visit</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {futureVisits.length > 0 ? (
                          futureVisits.map((appointment) => {
                            const displayStatus = getAppointmentStatus(appointment);
                            return (
                              <tr key={appointment.id} className="border-b border-gray-100">
                                <td className="p-4 text-sm">{appointment.service?.name || "Rehab Package"}</td>
                                <td className="p-4 text-sm">{appointment.staff?.displayName || "Dr. Sahil Behl"}</td>
                                <td className="p-4 text-sm">{appointment.startAt ? format(utcToIst(appointment.startAt), "MM/dd/yyyy") : "-"}</td>
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
                </CardContent>
              </Card>
            </TabsContent>

              <TabsContent value="past" className="mt-0">
              <Card className="border-gray-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Services</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Staff:-</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Visit</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {pastVisits.length > 0 ? (
                          pastVisits.map((appointment) => {
                            const displayStatus = getAppointmentStatus(appointment);
                            return (
                              <tr key={appointment.id} className="border-b border-gray-100">
                                <td className="p-4 text-sm">{appointment.service?.name || "Rehab Package"}</td>
                                <td className="p-4 text-sm">{appointment.staff?.displayName || "N/A"}</td>
                                <td className="p-4 text-sm">{appointment.startAt ? format(utcToIst(appointment.startAt), "MM/dd/yyyy") : "-"}</td>
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
                              No past visits found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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
    </div>
  );
}
