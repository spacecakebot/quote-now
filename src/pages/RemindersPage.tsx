import { useState } from 'react';
import { useReminders, useCreateReminder } from '@/hooks/use-shop-data';
import { formatDate, reminderStatusConfig, StatusBadge } from '@/lib/status-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Bell, Loader2 } from 'lucide-react';

export default function RemindersPage() {
  const { data: reminders = [], isLoading } = useReminders();
  const createReminder = useCreateReminder();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ message: '', due_at: '' });

  const pending = reminders.filter((r: any) => r.status === 'pending');
  const sent = reminders.filter((r: any) => r.status === 'sent');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReminder.mutateAsync({ message: form.message, due_at: new Date(form.due_at).toISOString() });
    setForm({ message: '', due_at: '' });
    setDialogOpen(false);
  };

  if (isLoading) return <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Reminders</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gold-gradient text-primary-foreground" size="sm"><Plus className="w-4 h-4 mr-1" /> New Reminder</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">New Reminder</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Message *</Label><Input placeholder="Reminder message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Due Date *</Label><Input type="datetime-local" value={form.due_at} onChange={e => setForm(f => ({ ...f, due_at: e.target.value }))} required /></div>
              <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={createReminder.isPending}>{createReminder.isPending ? 'Creating...' : 'Create Reminder'}</Button>
            </form>
          </DialogContent>
        </Dialog>
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
                  <p className="text-xs text-muted-foreground mt-0.5">Due: {formatDate(r.due_at)}</p>
                </div>
              </div>
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
    </div>
  );
}
