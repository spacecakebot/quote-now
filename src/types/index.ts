// Types for the Gold Shop Management System

export type AppRole = 'owner' | 'admin' | 'vendor';

export type OrderStatus = 'draft' | 'received' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';

export type Priority = 'low' | 'normal' | 'high';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank' | 'other';

export type ReminderType = 'payment_due' | 'delivery_due' | 'custom';

export type ReminderChannel = 'in_app' | 'whatsapp';

export type ReminderStatus = 'pending' | 'sent' | 'failed';

export type QuotationRequestStatus = 'requested' | 'responded' | 'cancelled';

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export type MessageStatus = 'queued' | 'sent' | 'failed';

export type RelatedType = 'order' | 'reminder' | 'quotation';

export interface Shop {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  created_by: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: AppRole;
  shop_id: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  shop_id: string;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  shop_id: string;
  customer_id: string | null;
  vendor_id: string | null;
  order_no: string;
  title: string;
  description: string | null;
  status: OrderStatus;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  total_amount: number;
  advance_amount: number;
  payment_status: PaymentStatus;
  customer?: Customer;
  vendor?: Vendor;
}

export interface OrderAttachment {
  id: string;
  order_id: string;
  shop_id: string;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  shop_id: string;
  amount: number;
  method: PaymentMethod;
  paid_at: string;
  notes: string | null;
}

export interface Reminder {
  id: string;
  shop_id: string;
  order_id: string | null;
  customer_id: string | null;
  vendor_id: string | null;
  reminder_type: ReminderType;
  message: string;
  due_at: string;
  sent_at: string | null;
  channel: ReminderChannel;
  status: ReminderStatus;
  order?: Order;
  customer?: Customer;
  vendor?: Vendor;
}

export interface QuotationRequest {
  id: string;
  shop_id: string;
  order_id: string;
  vendor_id: string;
  notes: string | null;
  status: QuotationRequestStatus;
  created_at: string;
  order?: Order;
  vendor?: Vendor;
}

export interface Quotation {
  id: string;
  shop_id: string;
  quotation_request_id: string;
  vendor_id: string;
  amount: number;
  details: string | null;
  status: QuotationStatus;
  created_at: string;
  responded_at: string | null;
  vendor?: Vendor;
  quotation_request?: QuotationRequest;
}

export interface MessageLog {
  id: string;
  shop_id: string;
  related_type: RelatedType;
  related_id: string;
  channel: string;
  to_phone: string;
  template_name: string | null;
  message_body: string;
  status: MessageStatus;
  provider_message_id: string | null;
  created_at: string;
}

export interface InviteRecord {
  id: string;
  shop_id: string;
  email: string;
  role: AppRole;
  status: 'pending' | 'accepted';
  invited_by: string;
  created_at: string;
}
