import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StaffSelect from "@/components/StaffSelect";
import TimeSlots, { Slot } from "@/components/TimeSlots";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ManageWalkInAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    staffId: string;
    startAt?: string;
    endAt?: string;
    customerId: string;
  };
  onUpdate?: (appointmentId: string) => void;
  appointmentUpdateTimestamp?: number; // Track when appointment was updated externally
}

export default function ManageWalkInAppointmentDialog({
  open,
  onClose,
  appointment,
  onUpdate,
  appointmentUpdateTimestamp,
}: ManageWalkInAppointmentDialogProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>(appointment.staffId);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [date] = useState<Date>(new Date()); // Today's date
  const [refreshKey, setRefreshKey] = useState(0); // Key to force TimeSlots refresh
  const [staffMap, setStaffMap] = useState<Record<string, string>>({});
  const [staffName, setStaffName] = useState<string | null>(null);
  const hasExistingSchedule = appointment.startAt && appointment.endAt;
  const formattedStart = hasExistingSchedule ? format(new Date(appointment.startAt as string), "hh:mm a") : "";
  const formattedEnd = hasExistingSchedule ? format(new Date(appointment.endAt as string), "hh:mm a") : "";

  // Reset selected slot when staff changes
  useEffect(() => {
    setSelectedSlot(null);
    // Force refresh when staff changes
    if (selectedStaffId) {
      setRefreshKey(prev => prev + 1);
    }
  }, [selectedStaffId]);

  // Initialize with appointment's staff and reset refresh key when dialog opens or appointment changes
  useEffect(() => {
    if (open) {
      if (appointment.staffId) {
        setSelectedStaffId(appointment.staffId);
      }
      // Force refresh of TimeSlots when dialog opens or appointment changes
      setRefreshKey(prev => prev + 1);
      setSelectedSlot(null);
    }
  }, [open, appointment.id, appointment.staffId, appointmentUpdateTimestamp]);

  // Fetch staff map for displaying staff name
  useEffect(() => {
    if (!open) return;
    const fetchStaff = async () => {
      try {
        const res = await axiosInstance.get("/staff", { params: { isActive: true } });
        const list = res.data?.data || [];
        const map: Record<string, string> = {};
        list.forEach((s: any) => {
          if (s?.id) map[s.id] = s.displayName || s.title || s.id;
        });
        setStaffMap(map);
      } catch (error) {
        console.error("Failed to fetch staff", error);
      }
    };
    fetchStaff();
  }, [open]);

  // Update staff name when selection or map changes
  useEffect(() => {
    if (selectedStaffId && staffMap[selectedStaffId]) {
      setStaffName(staffMap[selectedStaffId]);
    } else {
      setStaffName(null);
    }
  }, [selectedStaffId, staffMap]);

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  const handleUpdateAppointment = async () => {
    if (!selectedSlot || !selectedStaffId) {
      toast.error("Please select a staff member and time slot");
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = {
        staffId: selectedStaffId,
        startAt: new Date(selectedSlot.startIso).toISOString(),
        endAt: new Date(selectedSlot.endIso).toISOString(),
      };

      const response = await axiosInstance.put(`/appointments/${appointment.id}`, updateData);

      if (response.data?.success || response.status === 200) {
        toast.success("Appointment updated successfully");
        
        setRefreshKey(prev => prev + 1);
        
        // Small delay to ensure database is updated and slots refresh
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Trigger parent refresh to update appointment data
        if (onUpdate) {
          onUpdate(appointment.id);
        }
        
        // Close dialog after refresh
        onClose();
      } else {
        toast.error(response.data?.error || "Failed to update appointment");
      }
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      toast.error(error?.response?.data?.error || "An error occurred while updating appointment");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Manage Walk-in Appointment
          </DialogTitle>
        </DialogHeader>

        {hasExistingSchedule && (
          <div className="mt-2 mb-2 bg-blue-50 border text-center border-blue-200 rounded-lg p-3 text-sm text-blue-900">
            Your appointment is scheduled from{" "}
            <span className="font-semibold">{formattedStart}</span>{" "}
            to{" "}
            <span className="font-semibold">{formattedEnd}</span>
            {staffName && (
              <>
                {" "}with{" "}
                <span className="font-semibold">{staffName}</span>
              </>
            )}
          </div>
        )}

        <div className="space-y-6 mt-4">
          {/* Staff Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Staff Member</label>
            <StaffSelect value={selectedStaffId} onChange={setSelectedStaffId} />
          </div>

          {/* Time Slots */}
          {selectedStaffId && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Time Slots for Today ({format(date, "MMM dd, yyyy")})
              </label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <TimeSlots
                  key={`${selectedStaffId}-${refreshKey}-${appointmentUpdateTimestamp || 0}`}
                  staffId={selectedStaffId}
                  date={date}
                  onSelect={handleSlotSelect}
                  selectedSlotId={selectedSlot?.id}
                  excludeAppointmentId={appointment.id}
                  excludeSlots={
                    hasExistingSchedule && appointment.startAt && appointment.endAt
                      ? [{ startIso: appointment.startAt, endIso: appointment.endAt }]
                      : []
                  }
                />
              </div>
            </div>
          )}

          {/* Selected Slot Info */}
          {selectedSlot && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">
                Selected Slot: {format(new Date(selectedSlot.startIso), "hh:mm a")} -{" "}
                {format(new Date(selectedSlot.endIso), "hh:mm a")}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAppointment}
              disabled={!selectedSlot || !selectedStaffId || isUpdating}
              className="bg-gradient-to-r from-[#75B640] to-[#52813C]"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Appointment"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

