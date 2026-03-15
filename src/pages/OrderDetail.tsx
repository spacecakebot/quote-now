import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder, usePayments, useCreatePayment, useUpdateOrder } from '@/hooks/use-shop-data';
import { orderStatusConfig, paymentStatusConfig, priorityConfig, StatusBadge, formatCurrency, formatDate, formatDateTime } from '@/lib/status-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Phone, MapPin, Calendar, Plus, Loader2 } from 'lucide-react';
import SendMessageDialog from '@/components/SendMessageDialog';
import type { OrderStatus } from '@/types';

const statusFlow: OrderStatus[] = ['draft', 'received', 'in_progress', 'ready', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { data: payments = [] } = usePayments(id);
  const createPayment = useCreatePayment();
  const updateOrder = useUpdateOrder();
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', notes: '' });
  const [payDialogOpen, setPayDialogOpen] = useState(false);

  if (isLoading) return <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  if (!order) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/orders" className="text-primary text-sm hover:underline">Back to orders</Link>
      </div>
    );
  }

  const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
  const balance = Number(order.total_amount) - totalPaid;
  const currentStatusIdx = statusFlow.indexOf(order.status);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPayment.mutateAsync({ order_id: order.id, amount: Number(payForm.amount), method: payForm.method, notes: payForm.notes || undefined });
    const newTotalPaid = totalPaid + Number(payForm.amount);
    const newStatus = newTotalPaid >= Number(order.total_amount) ? 'paid' : newTotalPaid > 0 ? 'partial' : 'unpaid';
    await updateOrder.mutateAsync({ id: order.id, payment_status: newStatus });
    setPayForm({ amount: '', method: 'cash', notes: '' });
    setPayDialogOpen(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateOrder.mutateAsync({ id: order.id, status: newStatus });
  };

  // Build order summary for WhatsApp
  const orderSummary = `Order: ${order.order_no}\nTitle: ${order.title}\nStatus: ${orderStatusConfig[order.status as keyof typeof orderStatusConfig]?.label}\nTotal: ${formatCurrency(order.total_amount)}\nPaid: ${formatCurrency(totalPaid)}\nBalance: ${formatCurrency(balance)}${order.due_date ? `\nDue: ${formatDate(order.due_date)}` : ''}`;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/orders"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{order.order_no}</span>
            <StatusBadge config={orderStatusConfig[order.status as keyof typeof orderStatusConfig]} />
            <StatusBadge config={priorityConfig[order.priority as keyof typeof priorityConfig]} />
          </div>
          <h1 className="text-lg font-display font-bold text-foreground truncate">{order.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {order.customer?.phone && (
            <SendMessageDialog
              defaultPhone={order.customer.phone}
              defaultMessage={orderSummary}
              relatedType="order"
              relatedId={order.id}
              templateName="order_details"
              triggerLabel="Send"
              triggerSize="sm"
            />
          )}
          <Select value={order.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {statusFlow.map(s => <SelectItem key={s} value={s}>{orderStatusConfig[s].label}</SelectItem>)}
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                <span className={`text-[9px] mt-1 ${reached ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{orderStatusConfig[s].label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {order.customer && (
          <div className="card-elevated p-4 space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">CUSTOMER</h3>
            <p className="text-sm font-semibold text-foreground">{order.customer.name}</p>
            {order.customer.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {order.customer.phone}</p>}
            {order.customer.address && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.customer.address}</p>}
          </div>
        )}
        <div className="card-elevated p-4 space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">FINANCIALS</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-semibold text-foreground">{formatCurrency(order.total_amount)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Paid</span><span className="text-success font-medium">{formatCurrency(totalPaid)}</span></div>
            <div className="flex justify-between text-sm border-t pt-1"><span className="text-muted-foreground font-medium">Balance</span><span className={`font-bold ${balance > 0 ? 'text-destructive' : 'text-success'}`}>{formatCurrency(balance)}</span></div>
          </div>
        </div>
      </div>

      {order.description && (
        <div className="card-elevated p-4">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">DESCRIPTION</h3>
          <p className="text-sm text-foreground">{order.description}</p>
          {order.due_date && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {formatDate(order.due_date)}</p>}
        </div>
      )}

      {/* Payments */}
      <div className="card-elevated p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">PAYMENTS ({payments.length})</h3>
          <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="w-3 h-3 mr-1" /> Add</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Record Payment</DialogTitle></DialogHeader>
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div className="space-y-2"><Label>Amount (₹) *</Label><Input type="number" required value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={payForm.method} onValueChange={v => setPayForm(f => ({ ...f, method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Notes</Label><Input value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional note" /></div>
                <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={createPayment.isPending}>{createPayment.isPending ? 'Saving...' : 'Record Payment'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {payments.length > 0 ? (
          <div className="space-y-2">
            {payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">{(p.method || '').toUpperCase()} • {formatDate(p.paid_at)}</p>
                </div>
                {p.notes && <p className="text-xs text-muted-foreground max-w-[40%] text-right truncate">{p.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">No payments recorded</p>
        )}
      </div>
    </div>
  );
}
