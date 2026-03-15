import { useState } from 'react';
import { useMessageLogs } from '@/hooks/use-shop-data';
import { formatDateTime } from '@/lib/status-utils';
import { MessageSquare, CheckCircle, XCircle, Clock, Loader2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusIcons: Record<string, JSX.Element> = {
  sent: <CheckCircle className="w-4 h-4 text-success" />,
  failed: <XCircle className="w-4 h-4 text-destructive" />,
  queued: <Clock className="w-4 h-4 text-warning" />,
};

export default function MessagesPage() {
  const { data: messages = [], isLoading } = useMessageLogs();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = messages.filter((m: any) => {
    if (search && !m.to_phone.includes(search) && !m.message_body.toLowerCase().includes(search.toLowerCase()) && !(m.template_name || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (channelFilter !== 'all' && m.channel !== channelFilter) return false;
    return true;
  });

  if (isLoading) return <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="text-xl font-display font-bold text-foreground">Message Log</h1>
      <p className="text-sm text-muted-foreground">Outbound message history ({filtered.length})</p>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by phone, message, template..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-md border border-input hover:bg-accent"><Filter className="w-4 h-4" /></button>
        </div>
        {showFilters && (
          <div className="flex gap-2 animate-fade-in">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Channel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {filtered.map((m: any, i: number) => (
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
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="text-sm">No messages found</p></div>
        )}
      </div>
    </div>
  );
}
