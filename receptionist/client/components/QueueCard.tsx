import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
}

export default function QueueCard({ item, isSelected, onClick }: QueueCardProps) {
  const getStatusColor = (status: PatientQueueStatus) => {
    switch (status) {
      case PatientQueueStatus.IN_EXERCISE:
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case PatientQueueStatus.WAITING:
        return "bg-rose-100 text-rose-700 border-rose-300";
      case PatientQueueStatus.FULL_PAID:
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
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
      case PatientQueueStatus.FULL_PAID:
        return "Full Paid";
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

  // Get avatar URL from metadata if present
  // Check for direct URL first (avatar/profileImage)
  let avatarUrl = item.customer.metadata?.avatar || item.customer.metadata?.profileImage;
  
  // If not found, check for base64 photo data
  if (!avatarUrl && item.customer.metadata?.photo?.data) {
    const photoMeta = item.customer.metadata.photo;
    avatarUrl = `data:${photoMeta.type || 'image/jpeg'};base64,${photoMeta.data}`;
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50 border-b border-gray-100 ${
        isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
      }`}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatarUrl} alt={fullName} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 justify-between">
        <div className="flex flex-col items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{fullName}</h3>
            <span
            className={`font-medium ${
              item.queueStatus === PatientQueueStatus.IN_EXERCISE
                ? "text-emerald-600"
                : item.queueStatus === PatientQueueStatus.WAITING
                ? "text-rose-600"
                : "text-gray-600"
            }`}
          >
                <Badge className={`text-xs ${getStatusColor(item.queueStatus)} border min-w-[85px] flex items-center justify-center`}>
                    {getStatusText(item.queueStatus)}
                </Badge>
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className={`font-semibold ${getPendingAmountColor()}`}>
            {item.pendingAmount === 0 ? (
              <span className="flex items-center gap-1">
                <span className="text-emerald-600">Full Paid</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="text-orange-600">₹{item.pendingAmount.toLocaleString()}</span>
                <span className="text-gray-500">Pending</span>
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
