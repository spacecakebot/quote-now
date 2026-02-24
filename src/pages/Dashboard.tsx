import { useAuth } from '@/contexts/AuthContext';
import KPICard from '@/components/KPICard';
import { demoOrders, demoReminders, demoQuotationRequests } from '@/data/demo';
import { formatCurrency, orderStatusConfig, StatusBadge, paymentStatusConfig, formatDate } from '@/lib/status-utils';
import { ShoppingBag, Clock, AlertTriangle, IndianRupee, FileText, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { role, profile } = useAuth();
  const isVendor = role === 'vendor';

  const activeOrders = demoOrders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const dueToday = demoOrders.filter(o => {
    if (!o.due_date) return false;
    const due = new Date(o.due_date);
    const today = new Date();
    return due.toDateString() === today.toDateString();
  });
  const overdueOrders = demoOrders.filter(o => {
    if (!o.due_date || ['delivered', 'cancelled'].includes(o.status)) return false;
    return new Date(o.due_date) < new Date();
  });
  const unpaidBalance = demoOrders
    .filter(o => o.payment_status !== 'paid')
    .reduce((sum, o) => sum + (o.total_amount - o.advance_amount), 0);
  const pendingQuotations = demoQuotationRequests.filter(q => q.status === 'requested');
  const pendingReminders = demoReminders.filter(r => r.status === 'pending');

  // Vendor view
  const vendorOrders = demoOrders.filter(o => o.vendor_id === 'v1');
  const vendorQuotations = demoQuotationRequests.filter(q => q.vendor_id === 'v1');

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-display font-bold text-foreground">
          {isVendor ? 'Vendor Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {isVendor ? (
          <>
            <KPICard title="Assigned Orders" value={vendorOrders.length} icon={<ShoppingBag className="w-5 h-5" />} variant="gold" />
            <KPICard title="Pending Quotes" value={vendorQuotations.filter(q => q.status === 'requested').length} icon={<FileText className="w-5 h-5" />} variant="warning" />
          </>
        ) : (
          <>
            <KPICard title="Active Orders" value={activeOrders.length} icon={<ShoppingBag className="w-5 h-5" />} variant="gold" />
            <KPICard title="Due Today" value={dueToday.length} subtitle={`${overdueOrders.length} overdue`} icon={<Clock className="w-5 h-5" />} variant="warning" />
            <KPICard title="Unpaid Balance" value={formatCurrency(unpaidBalance)} icon={<IndianRupee className="w-5 h-5" />} variant="info" />
            <KPICard title="Pending" value={`${pendingQuotations.length} quotes`} subtitle={`${pendingReminders.length} reminders`} icon={<AlertTriangle className="w-5 h-5" />} variant="default" />
          </>
        )}
      </div>

      {/* Recent Orders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-display font-semibold text-foreground">Recent Orders</h2>
          <Link to="/orders" className="text-xs text-primary font-medium hover:underline">View All</Link>
        </div>
        <div className="space-y-2">
          {(isVendor ? vendorOrders : demoOrders).slice(0, 5).map((order, i) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="card-elevated p-3 flex items-center gap-3 hover:shadow-md transition-shadow animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{order.order_no}</span>
                  <StatusBadge config={orderStatusConfig[order.status]} />
                </div>
                <p className="text-sm font-medium text-foreground mt-0.5 truncate">{order.title}</p>
                <p className="text-xs text-muted-foreground">{order.customer?.name || 'No customer'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-foreground">{formatCurrency(order.total_amount)}</p>
                <StatusBadge config={paymentStatusConfig[order.payment_status]} />
                {order.due_date && (
                  <p className="text-[10px] text-muted-foreground mt-1">Due {formatDate(order.due_date)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Reminders - owner/admin only */}
      {!isVendor && pendingReminders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-foreground">Upcoming Reminders</h2>
            <Link to="/reminders" className="text-xs text-primary font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {pendingReminders.map(r => (
              <div key={r.id} className="card-elevated p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.due_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
