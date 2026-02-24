import { OrderStatus, PaymentStatus, Priority, ReminderStatus, QuotationStatus, QuotationRequestStatus } from '@/types';

interface StatusConfig {
  label: string;
  className: string;
}

export const orderStatusConfig: Record<OrderStatus, StatusConfig> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  received: { label: 'Received', className: 'bg-info/15 text-info' },
  in_progress: { label: 'In Progress', className: 'bg-warning/15 text-warning-foreground' },
  ready: { label: 'Ready', className: 'bg-success/15 text-success' },
  delivered: { label: 'Delivered', className: 'bg-success/20 text-success' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/15 text-destructive' },
};

export const paymentStatusConfig: Record<PaymentStatus, StatusConfig> = {
  unpaid: { label: 'Unpaid', className: 'bg-destructive/15 text-destructive' },
  partial: { label: 'Partial', className: 'bg-warning/15 text-warning-foreground' },
  paid: { label: 'Paid', className: 'bg-success/15 text-success' },
};

export const priorityConfig: Record<Priority, StatusConfig> = {
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  normal: { label: 'Normal', className: 'bg-info/15 text-info' },
  high: { label: 'High', className: 'bg-destructive/15 text-destructive' },
};

export const reminderStatusConfig: Record<ReminderStatus, StatusConfig> = {
  pending: { label: 'Pending', className: 'bg-warning/15 text-warning-foreground' },
  sent: { label: 'Sent', className: 'bg-success/15 text-success' },
  failed: { label: 'Failed', className: 'bg-destructive/15 text-destructive' },
};

export const quotationStatusConfig: Record<QuotationStatus, StatusConfig> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  sent: { label: 'Sent', className: 'bg-info/15 text-info' },
  accepted: { label: 'Accepted', className: 'bg-success/15 text-success' },
  rejected: { label: 'Rejected', className: 'bg-destructive/15 text-destructive' },
};

export const quotationRequestStatusConfig: Record<QuotationRequestStatus, StatusConfig> = {
  requested: { label: 'Requested', className: 'bg-warning/15 text-warning-foreground' },
  responded: { label: 'Responded', className: 'bg-success/15 text-success' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
};

export function StatusBadge({ config }: { config: StatusConfig }) {
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function formatDateTime(date: string | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}
