import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders, useCreateOrder, useCustomers, useVendors } from '@/hooks/use-shop-data';
import { orderStatusConfig, paymentStatusConfig, priorityConfig, StatusBadge, formatCurrency, formatDate } from '@/lib/status-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, Loader2, ShoppingBag } from 'lucide-react';
import type { OrderStatus, PaymentStatus } from '@/types';

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: orders = [], isLoading } = useOrders();
  const { data: customers = [] } = useCustomers();
  const { data: vendors = [] } = useVendors();
  const createOrder = useCreateOrder();

  // New order form state
  const [form, setForm] = useState({ title: '', description: '', customer_id: '', vendor_id: '', priority: 'normal', due_date: '', total_amount: '', advance_amount: '' });

  const filtered = orders.filter((o: any) => {
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.order_no.toLowerCase().includes(search.toLowerCase()) && !(o.customer?.name || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (paymentFilter !== 'all' && o.payment_status !== paymentFilter) return false;
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrder.mutateAsync({
      title: form.title,
      description: form.description || undefined,
      customer_id: form.customer_id || undefined,
      vendor_id: form.vendor_id || undefined,
      priority: form.priority,
      due_date: form.due_date || undefined,
      total_amount: form.total_amount ? Number(form.total_amount) : undefined,
      advance_amount: form.advance_amount ? Number(form.advance_amount) : undefined,
    });
    setForm({ title: '', description: '', customer_id: '', vendor_id: '', priority: 'normal', due_date: '', total_amount: '', advance_amount: '' });
    setDialogOpen(false);
  };

  if (isLoading) return <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Orders</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-primary-foreground" size="sm"><Plus className="w-4 h-4 mr-1" /> New Order</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">New Order</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Title *</Label><Input placeholder="Order title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select value={form.customer_id} onValueChange={v => setForm(f => ({ ...f, customer_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Select value={form.vendor_id} onValueChange={v => setForm(f => ({ ...f, vendor_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{vendors.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Total Amount (₹)</Label><Input type="number" placeholder="0" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Advance (₹)</Label><Input type="number" placeholder="0" value={form.advance_amount} onChange={e => setForm(f => ({ ...f, advance_amount: e.target.value }))} /></div>
              </div>
              <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={createOrder.isPending}>{createOrder.isPending ? 'Creating...' : 'Create Order'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}><Filter className="w-4 h-4" /></Button>
        </div>
        {showFilters && (
          <div className="flex gap-2 animate-fade-in">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {(Object.keys(orderStatusConfig) as OrderStatus[]).map(s => <SelectItem key={s} value={s}>{orderStatusConfig[s].label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Payment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                {(Object.keys(paymentStatusConfig) as PaymentStatus[]).map(s => <SelectItem key={s} value={s}>{paymentStatusConfig[s].label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {filtered.map((order: any, i: number) => (
          <Link key={order.id} to={`/orders/${order.id}`} className="card-elevated p-4 block hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">{order.order_no}</span>
                  <StatusBadge config={orderStatusConfig[order.status as keyof typeof orderStatusConfig]} />
                  <StatusBadge config={priorityConfig[order.priority as keyof typeof priorityConfig]} />
                </div>
                <h3 className="text-sm font-medium text-foreground mt-1 truncate">{order.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{order.customer?.name || 'No customer'}</p>
                {order.vendor && <p className="text-xs text-muted-foreground">Vendor: {order.vendor.name}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">{formatCurrency(order.total_amount)}</p>
                <StatusBadge config={paymentStatusConfig[order.payment_status as keyof typeof paymentStatusConfig]} />
                {order.due_date && <p className="text-[10px] text-muted-foreground mt-1">Due {formatDate(order.due_date)}</p>}
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
