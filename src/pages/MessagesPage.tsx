import { useMessageLogs } from '@/hooks/use-shop-data';
import { formatDateTime } from '@/lib/status-utils';
import { MessageSquare, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

const statusIcons: Record<string, JSX.Element> = {
  sent: <CheckCircle className="w-4 h-4 text-success" />,
  failed: <XCircle className="w-4 h-4 text-destructive" />,
  queued: <Clock className="w-4 h-4 text-warning" />,
};

export default function MessagesPage() {
  const { data: messages = [], isLoading } = useMessageLogs();

  if (isLoading) return <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-xl font-display font-bold text-foreground">Message Log</h1>
      <p className="text-sm text-muted-foreground">Outbound message history</p>

      <div className="space-y-2">
        {messages.map((m: any, i: number) => (
          <div key={m.id} className="card-elevated p-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0 mt-0.5"><MessageSquare className="w-4 h-4 text-success" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{m.to_phone}</span>
                  <div className="flex items-center gap-1">{statusIcons[m.status] || null}<span className="text-xs text-muted-foreground">{m.status}</span></div>
                </div>
                <p className="text-sm text-foreground mt-1 leading-relaxed">{m.message_body}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-muted-foreground uppercase">{m.channel}</span>
                  {m.template_name && <span className="text-[10px] text-muted-foreground">Template: {m.template_name}</span>}
                  <span className="text-[10px] text-muted-foreground">{formatDateTime(m.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="text-sm">No messages sent yet</p></div>
        )}
      </div>
    </div>
  );
}
