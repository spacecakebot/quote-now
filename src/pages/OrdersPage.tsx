import { useState } from 'react';
import { Link } from 'react-router-dom';
import { demoOrders } from '@/data/demo';
import { orderStatusConfig, paymentStatusConfig, priorityConfig, StatusBadge, formatCurrency, formatDate } from '@/lib/status-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import type { OrderStatus, PaymentStatus } from '@/types';

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = demoOrders.filter(o => {
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.order_no.toLowerCase().includes(search.toLowerCase()) && !o.customer?.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (paymentFilter !== 'all' && o.payment_status !== paymentFilter) return false;
    return true;
  });

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Orders</h1>
        <Button className="gold-gradient text-primary-foreground" size="sm">
          <Plus className="w-4 h-4 mr-1" /> New Order
        </Button>
      </div>

      {/* Search & filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="flex gap-2 animate-fade-in">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {(Object.keys(orderStatusConfig) as OrderStatus[]).map(s => (
                  <SelectItem key={s} value={s}>{orderStatusConfig[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                {(Object.keys(paymentStatusConfig) as PaymentStatus[]).map(s => (
                  <SelectItem key={s} value={s}>{paymentStatusConfig[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Orders list */}
      <div className="space-y-2">
        {filtered.map((order, i) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="card-elevated p-4 block hover:shadow-md transition-shadow animate-fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">{order.order_no}</span>
                  <StatusBadge config={orderStatusConfig[order.status]} />
                  <StatusBadge config={priorityConfig[order.priority]} />
                </div>
                <h3 className="text-sm font-medium text-foreground mt-1 truncate">{order.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{order.customer?.name || 'No customer'}</p>
                {order.vendor && <p className="text-xs text-muted-foreground">Vendor: {order.vendor.name}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">{formatCurrency(order.total_amount)}</p>
                <StatusBadge config={paymentStatusConfig[order.payment_status]} />
                {order.due_date && (
                  <p className="text-[10px] text-muted-foreground mt-1">Due {formatDate(order.due_date)}</p>
                )}
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

function ShoppingBag(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
}
