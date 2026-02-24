import { useParams, Link } from 'react-router-dom';
import { demoOrders, demoPayments, demoReminders, demoMessageLogs } from '@/data/demo';
import { orderStatusConfig, paymentStatusConfig, priorityConfig, StatusBadge, formatCurrency, formatDate, formatDateTime } from '@/lib/status-utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, MapPin, Calendar, IndianRupee, Plus, MessageSquare, Bell, Edit } from 'lucide-react';
import type { OrderStatus } from '@/types';

const statusFlow: OrderStatus[] = ['draft', 'received', 'in_progress', 'ready', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = demoOrders.find(o => o.id === id);
  const payments = demoPayments.filter(p => p.order_id === id);
  const reminders = demoReminders.filter(r => r.order_id === id);
  const messages = demoMessageLogs.filter(m => m.related_id === id && m.related_type === 'order');

  if (!order) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/orders" className="text-primary text-sm hover:underline">Back to orders</Link>
      </div>
    );
  }

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = order.total_amount - totalPaid;
  const currentStatusIdx = statusFlow.indexOf(order.status);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/orders">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{order.order_no}</span>
            <StatusBadge config={orderStatusConfig[order.status]} />
            <StatusBadge config={priorityConfig[order.priority]} />
          </div>
          <h1 className="text-lg font-display font-bold text-foreground truncate">{order.title}</h1>
        </div>
        <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Edit</Button>
      </div>

      {/* Status timeline */}
      <div className="card-elevated p-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-3">ORDER PROGRESS</h3>
        <div className="flex items-center gap-1">
          {statusFlow.map((s, i) => {
            const reached = i <= currentStatusIdx && order.status !== 'cancelled';
            return (
              <div key={s} className="flex-1 flex flex-col items-center">
                <div className={`w-full h-1.5 rounded-full ${reached ? 'gold-gradient' : 'bg-muted'}`} />
                <span className={`text-[9px] mt-1 ${reached ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {orderStatusConfig[s].label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Customer */}
        {order.customer && (
          <div className="card-elevated p-4 space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">CUSTOMER</h3>
            <p className="text-sm font-semibold text-foreground">{order.customer.name}</p>
            {order.customer.phone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" /> {order.customer.phone}
              </p>
            )}
            {order.customer.address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {order.customer.address}
              </p>
            )}
          </div>
        )}

        {/* Financial summary */}
        <div className="card-elevated p-4 space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">FINANCIALS</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground">{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paid</span>
              <span className="text-success font-medium">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-1">
              <span className="text-muted-foreground font-medium">Balance</span>
              <span className={`font-bold ${balance > 0 ? 'text-destructive' : 'text-success'}`}>{formatCurrency(balance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      {order.description && (
        <div className="card-elevated p-4">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">DESCRIPTION</h3>
          <p className="text-sm text-foreground">{order.description}</p>
          {order.due_date && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Due: {formatDate(order.due_date)}
            </p>
          )}
        </div>
      )}

      {/* Payments */}
      <div className="card-elevated p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">PAYMENTS ({payments.length})</h3>
          <Button variant="outline" size="sm"><Plus className="w-3 h-3 mr-1" /> Add</Button>
        </div>
        {payments.length > 0 ? (
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">{p.method.toUpperCase()} • {formatDate(p.paid_at)}</p>
                </div>
                {p.notes && <p className="text-xs text-muted-foreground max-w-[40%] text-right truncate">{p.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">No payments recorded</p>
        )}
      </div>

      {/* Reminders */}
      {reminders.length > 0 && (
        <div className="card-elevated p-4 space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Bell className="w-3 h-3" /> REMINDERS
          </h3>
          {reminders.map(r => (
            <div key={r.id} className="flex items-center justify-between py-1">
              <p className="text-sm text-foreground truncate flex-1">{r.message}</p>
              <span className="text-xs text-muted-foreground ml-2">{formatDate(r.due_at)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="card-elevated p-4 space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> MESSAGE LOG
          </h3>
          {messages.map(m => (
            <div key={m.id} className="py-2 border-b last:border-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{m.to_phone} • {m.channel}</span>
                <span className={`status-badge text-[10px] ${m.status === 'sent' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>{m.status}</span>
              </div>
              <p className="text-sm text-foreground mt-1">{m.message_body}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(m.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
