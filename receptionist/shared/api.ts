/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Enums
export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW"
}

export enum PatientQueueStatus {
  IN_EXERCISE = "IN_EXERCISE",
  WAITING = "WAITING",
  FULL_PAID = "FULL_PAID",
  PENDING = "PENDING"
}

// Customer/Patient Types
export interface Customer {
  id: string;
  tenantId: string;
  userId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  notes?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// Staff Types
export interface Staff {
  id: string;
  userId: string;
  tenantId: string;
  displayName: string;
  title?: string;
  bio?: string;
  avatar?: string;
  isActive: boolean;
}

// Service Types
export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
}

// Appointment Types
export interface Appointment {
  id: string;
  tenantId: string;
  staffId: string;
  serviceId?: string;
  customerId: string;
  bookedById: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  price: number;
  currency: string;
  notes?: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  customer?: Customer;
  staff?: Staff;
  service?: Service;
  payment?: Payment;
}

// Payment Types
export interface Payment {
  id: string;
  tenantId: string;
  appointmentId?: string;
  customerId: string;
  amount: number;
  currency: string;
  provider: string;
  transactionId?: string;
  status: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// Queue Item Type for Dashboard
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
