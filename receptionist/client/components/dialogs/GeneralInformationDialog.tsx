import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { format } from "date-fns";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import { Customer } from "@/components/QueueCard";

interface GeneralInformationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any; // Using any to handle extended customer properties
  onSave: () => void;
}

export default function GeneralInformationDialog({
  open,
  onOpenChange,
  customer,
  onSave,
}: GeneralInformationDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    gender: customer.gender || "",
    dateOfBirth: customer.dateOfBirth || "",
    age: customer.metadata?.age || "",
    weight: customer.metadata?.weight || "",
    bloodGroup: customer.metadata?.bloodGroup || "",
    address: customer.metadata?.address || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.put(`/customers/${customer.id}`, {
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        metadata: {
          ...customer.metadata,
          age: formData.age,
          weight: formData.weight,
          bloodGroup: formData.bloodGroup,
          address: formData.address,
        },
      });

      // Update local customer data
      customer.gender = formData.gender;
      customer.dateOfBirth = formData.dateOfBirth;
      if (!customer.metadata) customer.metadata = {};
      customer.metadata.age = formData.age;
      customer.metadata.weight = formData.weight;
      customer.metadata.bloodGroup = formData.bloodGroup;
      customer.metadata.address = formData.address;

      toast.success("Customer information updated successfully");
      setIsEditing(false);
      onSave?.();
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer information");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      gender: customer.gender || "",
      dateOfBirth: customer.dateOfBirth || "",
      age: customer.metadata?.age || "",
      weight: customer.metadata?.weight || "",
      bloodGroup: customer.metadata?.bloodGroup || "",
      address: customer.metadata?.address || "",
    });
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <DialogDescription className="sr-only">
            View and edit customer general information
          </DialogDescription>
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
                  placeholder="House/Flat No., Locality, City, PIN"
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
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-b from-[#0557A8] to-[#1BB7E9]"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
