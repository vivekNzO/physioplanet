import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";

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

interface QueueCardProps {
  item: QueueItem;
  isSelected: boolean;
  onClick: () => void;
  onStatusChange?: (itemId: string, newStatus: PatientQueueStatus) => void;
}

export default function QueueCard({ item, isSelected, onClick, onStatusChange }: QueueCardProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Handle status update
  const handleStatusUpdate = async (newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUpdatingStatus(true);
    try {
      if (item.appointments && item.appointments.length > 0) {
        const appointmentId = item.appointments[0].id;
        await axiosInstance.put(`/appointments/${appointmentId}`, {
          status: newStatus,
        });
      }
      if (onStatusChange) {
        onStatusChange(item.id, newStatus as PatientQueueStatus);
      }
      toast.success(`Status updated to ${getStatusText(newStatus as PatientQueueStatus)}`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: PatientQueueStatus) => {
    switch (status) {
      case PatientQueueStatus.IN_EXERCISE:
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case PatientQueueStatus.WAITING:
        return "bg-rose-100 text-rose-700 border-rose-300";
      case PatientQueueStatus.COMPLETED:
        return "bg-green-100 text-green-700 border-green-300";
      case PatientQueueStatus.CANCELLED:
        return "bg-red-100 text-red-700 border-red-300";
      case PatientQueueStatus.PENDING:
        return "bg-amber-100 text-amber-700 border-amber-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusText = (status: PatientQueueStatus) => {
    switch (status) {
      case PatientQueueStatus.IN_EXERCISE:
        return "In Exercise";
      case PatientQueueStatus.WAITING:
        return "Waiting";
      case PatientQueueStatus.COMPLETED:
        return "Completed";
      case PatientQueueStatus.CANCELLED:
        return "Cancelled";
      case PatientQueueStatus.PENDING:
        return "Pending";
      default:
        return status;
    }
  };

  const getPendingAmountColor = () => {
    if (item.pendingAmount === 0) return "text-emerald-600";
    if (item.queueStatus === PatientQueueStatus.PENDING) return "text-orange-600";
    return "text-gray-600";
  };

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

  const avatarUrl = getFullPhotoUrl(item.customer.photoUrl) || item.customer.metadata?.avatar || item.customer.metadata?.profileImage;  
  const isWalkIn = item.appointments && item.appointments[0]?.appointmentType === 'WALKIN';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 max-[1023px]:gap-2 max-[870px]:gap-1.5 p-4 max-[1023px]:p-2.5 max-[870px]:p-2 max-lg:p-2 cursor-pointer transition-all hover:bg-gray-50 border-b border-gray-100 ${
        isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
      }`}
    >
      <Avatar className="h-12 w-12 max-[1023px]:h-10 max-[1023px]:w-10">
        <AvatarImage src={avatarUrl} alt={fullName} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold max-[1023px]:text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 justify-between">
        <div className="flex flex-col items-start justify-between">
          <h3 className="font-semibold max-[1023px]:text-sm text-gray-900 truncate">{fullName}</h3>
          <span
            className={`font-medium ${
              item.queueStatus === PatientQueueStatus.IN_EXERCISE
                ? "text-emerald-600"
                : item.queueStatus === PatientQueueStatus.WAITING
                ? "text-rose-600"
                : "text-gray-600"
            }`}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Select
                value={item.queueStatus}
                onValueChange={(value) => handleStatusUpdate(value)}
                disabled={updatingStatus}
              >
                <SelectTrigger className={`text-xs max-[1023px]:text-[10px] max-[870px]:text-[9px] ${getStatusColor(item.queueStatus)} border-0 flex justify-center min-w-[85px] max-[1023px]:min-w-[70px] max-[870px]:min-w-[60px] h-auto p-1 max-[1023px]:p-0.5 max-[870px]:p-0.5 [&>svg]:hidden focus:ring-0 focus:ring-offset-0`}>
                  <SelectValue>{getStatusText(item.queueStatus)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAITING">Waiting</SelectItem>
                  <SelectItem value="IN_EXERCISE">In Exercise</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </span>
        </div>

        <div className="flex flex-col items-center justify-between text-sm max-[1023px]:text-xs">
          <span className={`font-semibold max-[1023px]:font-medium ${getPendingAmountColor()}`}>
            {(() => {

              if (item.paidAmount >= item.totalAmount && item.totalAmount > 0) {
                return (
                  <span className="flex items-center gap-1 max-[1023px]:gap-0.5">
                    <span className="text-emerald-600 max-[1023px]:text-xs">Full Paid</span>
                  </span>
                );
              } else if (item.paidAmount > 0) {
                return (
                  <span className="flex items-center gap-1 max-[1023px]:gap-0.5">
                    <span className="text-gray-500 max-[1023px]:text-xs">Pending</span>
                  </span>
                );
              } else {
                return (
                  <span className="flex items-center gap-1 max-[1023px]:gap-0.5">
                    <span className="text-red-600 max-[1023px]:text-xs">Unpaid</span>
                  </span>
                );
              }
            })()}
          </span>
          <div>
            {isWalkIn ? (
              <Badge variant="outline" className="text-xs max-[1023px]:text-[10px] max-[870px]:text-[9px] max-[1023px]:px-1.5 max-[870px]:px-1 max-[1023px]:py-0.5 max-[870px]:py-0.5 border-gray-300 text-gray-600">
                Walk-in
              </Badge>
            ):(
              <Badge variant="outline" className="text-xs max-[1023px]:text-[10px] max-[870px]:text-[9px] max-[1023px]:px-1.5 max-[870px]:px-1 max-[1023px]:py-0.5 max-[870px]:py-0.5 border-gray-300 text-gray-600">
                Pre-Booked
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
