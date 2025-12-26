import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";

export enum PatientQueueStatus {
  IN_EXERCISE = "IN_EXERCISE",
  WAITING = "WAITING",
  FULL_PAID = "FULL_PAID",
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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    gender: item.customer.gender || "",
    dateOfBirth: item.customer.dateOfBirth || "",
    age: item.customer.metadata?.age || "",
    weight: item.customer.metadata?.weight || "",
    bloodGroup: item.customer.metadata?.bloodGroup || "",
    address: item.customer.metadata?.address || "",
  });

  const fullName = `${item.customer.firstName || ""} ${item.customer.lastName || ""}`.trim() || "Unknown Patient";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Get avatar URL from metadata if present
  const avatarUrl = item.customer.metadata?.avatar || item.customer.metadata?.profileImage;

  // Mock data for prescriptions - in real app, this would come from API
  const prescriptionPhotos = [
    { id: 1, url: "/placeholder-prescription-1.jpg" },
    { id: 2, url: "/placeholder-prescription-2.jpg" },
  ];

  const futureVisits = item.appointments.filter((apt) => utcToIst(apt.startAt) > new Date());
  const pastVisits = item.appointments.filter((apt) => utcToIst(apt.startAt) <= new Date());

  // Calculate package details
  const packageDetails = {
    name: "Rehab Package for 1 Month",
    totalSessions: 30,
    usedSessions: 21,
  };

  const handleSaveGeneralInfo = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.patch(`/customers/${item.customer.id}`, {
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        metadata: {
          ...item.customer.metadata,
          age: formData.age,
          weight: formData.weight,
          bloodGroup: formData.bloodGroup,
          address: formData.address,
        },
      });
      
      // Update local customer data
      item.customer.gender = formData.gender;
      item.customer.dateOfBirth = formData.dateOfBirth;
      if (!item.customer.metadata) item.customer.metadata = {};
      item.customer.metadata.age = formData.age;
      item.customer.metadata.weight = formData.weight;
      item.customer.metadata.bloodGroup = formData.bloodGroup;
      item.customer.metadata.address = formData.address;
      
      toast.success("Customer information updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer information");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original values
    setFormData({
      gender: item.customer.gender || "",
      dateOfBirth: item.customer.dateOfBirth || "",
      age: item.customer.metadata?.age || "",
      weight: item.customer.metadata?.weight || "",
      bloodGroup: item.customer.metadata?.bloodGroup || "",
      address: item.customer.metadata?.address || "",
    });
    setIsEditing(false);
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
          <Button variant="outline" className="text-xs font-medium  ">Last Feedbacks</Button>
        </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex w-full gap-[10px] flex-1 min-h-[222px] mb-2.5">
        {/* Prescriptions Photos Section */}
        <div className="flex-1 basis-[40%]">
          <Card className="border-gray-200 py-[21px] px-[15.5px] h-full">
          <h3 className="text-[18px] font-normal mb-[25px]">
                Prescription <span className="text-[#1D5287] font-bold">Photos</span>
            </h3>
            <CardContent className="p-0">
              <div className="flex items-start gap-4 bg-white">
                <Button variant="outline" className="flex items-center gap-2 px-[5px] py-[5px] text-[10px] font-medium flex-col justify-center">
                  <img src="/Mask group (5).png"/>
                  <span>Click Photo</span>
                </Button>
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {prescriptionPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-video bg-gray-100 rounded-lg border border-gray-300 overflow-hidden"
                    >
                      <img
                        src={photo.url}
                        alt="Prescription"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600 bg-green-50 p-3 rounded border border-green-200 mt-4">
                <span className="font-semibold">Note:</span> Always click a clean photo of your
                Prescription for better results.
              </p>
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
                          futureVisits.map((appointment) => (
                            <tr key={appointment.id} className="border-b border-gray-100">
                              <td className="p-4 text-sm">{appointment.service?.name || "Rehab Package"}</td>
                              <td className="p-4 text-sm">{appointment.staff?.displayName || "Dr. Sahil Behl"}</td>
                              <td className="p-4 text-sm">{format(utcToIst(appointment.startAt), "MM/dd/yyyy")}</td>
                              <td className="p-4">
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                                  Scheduled
                                </Badge>
                              </td>
                            </tr>
                          ))
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
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add/Edit Exercises
                    </Button>
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
                          pastVisits.map((appointment) => (
                            <tr key={appointment.id} className="border-b border-gray-100">
                              <td className="p-4 text-sm">{appointment.service?.name || "Rehab Package"}</td>
                              <td className="p-4 text-sm">{appointment.staff?.displayName || "N/A"}</td>
                              <td className="p-4 text-sm">{format(utcToIst(appointment.startAt), "MM/dd/yyyy")}</td>
                              <td className="p-4">
                                <Badge className={
                                  appointment.status === "COMPLETED" 
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : appointment.status === "CANCELLED"
                                    ? "bg-red-100 text-red-700 border-red-300"
                                    : "bg-gray-100 text-gray-700 border-gray-300"
                                }>
                                  {appointment.status === "COMPLETED" ? "Completed" : appointment.status === "CANCELLED" ? "Cancelled" : appointment.status}
                                </Badge>
                              </td>
                            </tr>
                          ))
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
            </TabsContent>
          </Tabs>
        </div>

      {/* General Information Dialog */}
      <Dialog open={generalInfoOpen} onOpenChange={setGeneralInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                General <span className="text-[#1D5287] font-bold">Information</span>
              </DialogTitle>
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              ) : null}
            </div>
          </DialogHeader>
          
          {/* Show placeholder if no data exists */}
          {!isEditing && !formData.gender && !formData.dateOfBirth && !formData.age && !formData.weight && !formData.bloodGroup && !formData.address ? (
            <div className="py-12 text-center">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Information Available</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                Patient information has not been added yet. Click the edit button to add details.
              </p>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-b from-[#0557A8] to-[#1BB7E9]"
              >
                Add Information
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Gender */}
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm font-normal text-gray-600 w-32">Gender:</Label>
                {isEditing ? (
                  <Input
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    placeholder="Female"
                    className="flex-1"
                  />
                ) : (
                  <p className="text-sm text-gray-900 flex-1 text-right">{formData.gender || "—"}</p>
                )}
              </div>

              {/* Age & Weight */}
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm font-normal text-gray-600 w-32">Age & Weight:</Label>
                {isEditing ? (
                  <div className="flex gap-2 flex-1">
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="54"
                      className="w-20"
                    />
                    <Input
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="80kg"
                      className="w-24"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-900 flex-1 text-right">
                    {formData.age || formData.weight ? (
                      <>
                        {formData.age && <>{formData.age} Year</>}
                        {formData.age && formData.weight && " & "}
                        {formData.weight && <>{formData.weight}</>}
                      </>
                    ) : "—"}
                  </p>
                )}
              </div>

              {/* Blood Group */}
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm font-normal text-gray-600 w-32">Blood Group:</Label>
                {isEditing ? (
                  <Input
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    placeholder="O+"
                    className="flex-1"
                  />
                ) : (
                  <p className="text-sm text-gray-900 flex-1 text-right">{formData.bloodGroup || "—"}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm font-normal text-gray-600 w-32">Date Of Birth:</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="flex-1"
                  />
                ) : (
                  <p className="text-sm text-gray-900 flex-1 text-right">
                    {formData.dateOfBirth ? format(new Date(formData.dateOfBirth), "dd.MM.yyyy") : "—"}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="flex items-start justify-between py-2">
                <Label className="text-sm font-normal text-gray-600 w-32 pt-2">Address:</Label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="#462/c, Dhanas, Chandigarh"
                    className="flex-1 min-h-[60px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900 flex-1 text-right">{formData.address || "—"}</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveGeneralInfo}
                disabled={isSaving}
                className="bg-gradient-to-b from-[#0557A8] to-[#1BB7E9]"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
