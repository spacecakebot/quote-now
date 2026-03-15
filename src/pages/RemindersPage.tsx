import { useState } from 'react';
import { useReminders, useCreateReminder, useCustomers } from '@/hooks/use-shop-data';
import { formatDate, formatDateTime, reminderStatusConfig, StatusBadge } from '@/lib/status-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Bell, Loader2, Search, Filter } from 'lucide-react';
import SendMessageDialog from '@/components/SendMessageDialog';

export default function RemindersPage() {
  const { data: reminders = [], isLoading } = useReminders();
  const { data: customers = [] } = useCustomers();
  const createReminder = useCreateReminder();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ message: '', due_at: '', channel: 'in_app', customer_id: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = reminders.filter((r: any) => {
    if (search && !r.message.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const pending = filtered.filter((r: any) => r.status === 'pending');
  const sent = filtered.filter((r: any) => r.status === 'sent');
  const failed = filtered.filter((r: any) => r.status === 'failed');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReminder.mutateAsync({
      message: form.message,
      due_at: new Date(form.due_at).toISOString(),
      channel: form.channel as any,
      customer_id: form.customer_id || undefined,
    });
    setForm({ message: '', due_at: '', channel: 'in_app', customer_id: '' });
    setDialogOpen(false);
  };

  // Get customer phone for a reminder
  const getCustomerPhone = (customerId: string | null) => {
    if (!customerId) return '';
    const c = customers.find((c: any) => c.id === customerId);
    return c?.phone || '';
  };

  if (isLoading) return <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Reminders</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gold-gradient text-primary-foreground" size="sm"><Plus className="w-4 h-4 mr-1" /> New Reminder</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">New Reminder</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Message *</Label><Input placeholder="Reminder message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Due Date *</Label><Input type="datetime-local" value={form.due_at} onChange={e => setForm(f => ({ ...f, due_at: e.target.value }))} required /></div>
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={form.customer_id} onValueChange={v => setForm(f => ({ ...f, customer_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={form.channel} onValueChange={v => setForm(f => ({ ...f, channel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_app">In App</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={createReminder.isPending}>{createReminder.isPending ? 'Creating...' : 'Create Reminder'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search reminders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-md border border-input hover:bg-accent"><Filter className="w-4 h-4" /></button>
        </div>
        {showFilters && (
          <div className="flex gap-2 animate-fade-in">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-display font-semibold text-foreground">Upcoming / Overdue ({pending.length})</h2>
        {pending.map((r: any, i: number) => (
          <div key={r.id} className="card-elevated p-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0 mt-0.5"><Bell className="w-4 h-4 text-warning" /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><StatusBadge config={reminderStatusConfig[r.status as keyof typeof reminderStatusConfig]} /><span className="text-[10px] text-muted-foreground uppercase">{r.channel}</span></div>
                  <p className="text-sm font-medium text-foreground mt-1">{r.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Due: {formatDateTime(r.due_at)}</p>
                </div>
              </div>
              {r.customer_id && getCustomerPhone(r.customer_id) && (
                <SendMessageDialog
                  defaultPhone={getCustomerPhone(r.customer_id)}
                  defaultMessage={r.message}
                  relatedType="reminder"
                  relatedId={r.id}
                  templateName="reminder"
                  triggerLabel="Send"
                  triggerSize="sm"
                />
              )}
            </div>
          </div>
        ))}
        {pending.length === 0 && (
          <div className="text-center py-8 text-muted-foreground"><Bell className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No pending reminders</p></div>
        )}
      </div>

      {sent.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-display font-semibold text-foreground">Sent ({sent.length})</h2>
          {sent.map((r: any) => (
            <div key={r.id} className="card-elevated p-3 opacity-60">
              <p className="text-sm text-foreground">{r.message}</p>
              <p className="text-xs text-muted-foreground">Sent: {formatDate(r.sent_at)}</p>
            </div>
          ))}
        </div>
      )}

      {failed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-display font-semibold text-foreground">Failed ({failed.length})</h2>
          {failed.map((r: any) => (
            <div key={r.id} className="card-elevated p-3 opacity-60 border-destructive/30">
              <p className="text-sm text-foreground">{r.message}</p>
              <p className="text-xs text-destructive">Failed • Due: {formatDate(r.due_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
