import { demoReminders } from '@/data/demo';
import { formatDate, reminderStatusConfig, StatusBadge } from '@/lib/status-utils';
import { Button } from '@/components/ui/button';
import { Plus, Bell, Send } from 'lucide-react';

export default function RemindersPage() {
  const pending = demoReminders.filter(r => r.status === 'pending');
  const sent = demoReminders.filter(r => r.status === 'sent');

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Reminders</h1>
        <Button className="gold-gradient text-primary-foreground" size="sm">
          <Plus className="w-4 h-4 mr-1" /> New Reminder
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Run Reminder Check
        </Button>
      </div>

      {/* Pending */}
      <div className="space-y-3">
        <h2 className="text-sm font-display font-semibold text-foreground">Upcoming / Overdue ({pending.length})</h2>
        {pending.map((r, i) => (
          <div key={r.id} className="card-elevated p-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-warning" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge config={reminderStatusConfig[r.status]} />
                    <span className="text-[10px] text-muted-foreground uppercase">{r.channel}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1">{r.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Due: {formatDate(r.due_at)}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                <Send className="w-3 h-3 mr-1" /> Send
              </Button>
            </div>
          </div>
        ))}
        {pending.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No pending reminders</p>
          </div>
        )}
      </div>

      {/* Sent */}
      {sent.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-display font-semibold text-foreground">Sent ({sent.length})</h2>
          {sent.map(r => (
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
