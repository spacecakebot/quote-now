import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotationRequests, useQuotations, useUpdateQuotation, useVendors } from '@/hooks/use-shop-data';
import { formatCurrency, formatDate, quotationRequestStatusConfig, quotationStatusConfig, StatusBadge } from '@/lib/status-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Check, X, Loader2, Search, Filter } from 'lucide-react';
import SendMessageDialog from '@/components/SendMessageDialog';

export default function QuotationsPage() {
  const { role } = useAuth();
  const isVendor = role === 'vendor';
  const { data: quotationRequests = [], isLoading: loadingQR } = useQuotationRequests();
  const { data: quotations = [], isLoading: loadingQ } = useQuotations();
  const { data: vendors = [] } = useVendors();
  const updateQuotation = useUpdateQuotation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const getVendorPhone = (vendorId: string) => {
    const v = vendors.find((v: any) => v.id === vendorId);
    return v?.phone || '';
  };

  const filteredQR = quotationRequests.filter((qr: any) => {
    if (search && !(qr.order?.title || '').toLowerCase().includes(search.toLowerCase()) && !(qr.vendor?.name || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && qr.status !== statusFilter) return false;
    return true;
  });

  const filteredQ = quotations.filter((q: any) => {
    if (search && !(q.vendor?.name || '').toLowerCase().includes(search.toLowerCase()) && !(q.details || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loadingQR || loadingQ) return <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Quotations</h1>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by order, vendor..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-md border border-input hover:bg-accent"><Filter className="w-4 h-4" /></button>
        </div>
        {showFilters && (
          <div className="flex gap-2 animate-fade-in">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Request Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-display font-semibold text-foreground">
          {isVendor ? 'Your Quotation Requests' : 'Quotation Requests'} ({filteredQR.length})
        </h2>
        {filteredQR.map((qr: any, i: number) => (
          <div key={qr.id} className="card-elevated p-4 space-y-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><StatusBadge config={quotationRequestStatusConfig[qr.status as keyof typeof quotationRequestStatusConfig]} /></div>
                <p className="text-sm font-medium text-foreground mt-1">{qr.order?.title || 'Order'}</p>
                <p className="text-xs text-muted-foreground">Vendor: {qr.vendor?.name}</p>
                {qr.notes && <p className="text-xs text-muted-foreground mt-1">{qr.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{formatDate(qr.created_at)}</span>
                {getVendorPhone(qr.vendor_id) && (
                  <SendMessageDialog
                    defaultPhone={getVendorPhone(qr.vendor_id)}
                    defaultMessage={`Quotation request for: ${qr.order?.title || 'Order'}${qr.notes ? `\nNotes: ${qr.notes}` : ''}`}
                    relatedType="quotation_request"
                    relatedId={qr.id}
                    templateName="quotation_request"
                    triggerLabel=""
                    triggerSize="icon"
                    triggerVariant="ghost"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredQR.length === 0 && (
          <div className="text-center py-8 text-muted-foreground"><FileText className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No quotation requests</p></div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-display font-semibold text-foreground">Quotations ({filteredQ.length})</h2>
        {filteredQ.map((q: any, i: number) => (
          <div key={q.id} className="card-elevated p-4 space-y-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge config={quotationStatusConfig[q.status as keyof typeof quotationStatusConfig]} />
                  <span className="text-sm font-bold text-foreground">{formatCurrency(q.amount)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">From: {q.vendor?.name}</p>
                {q.details && <p className="text-sm text-foreground mt-2">{q.details}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(q.created_at)}</span>
            </div>
            {!isVendor && q.status === 'sent' && (
              <div className="flex gap-2">
                <Button size="sm" className="bg-success text-success-foreground flex-1" onClick={() => updateQuotation.mutate({ id: q.id, status: 'accepted' })}><Check className="w-4 h-4 mr-1" /> Accept</Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateQuotation.mutate({ id: q.id, status: 'rejected' })}><X className="w-4 h-4 mr-1" /> Reject</Button>
              </div>
            )}
          </div>
        ))}
        {filteredQ.length === 0 && <div className="text-center py-8 text-muted-foreground"><p className="text-sm">No quotations yet</p></div>}
      </div>
    </div>
  );
}
