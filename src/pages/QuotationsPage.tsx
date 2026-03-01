import { useAuth } from '@/contexts/AuthContext';
import { useQuotationRequests, useQuotations, useUpdateQuotation } from '@/hooks/use-shop-data';
import { formatCurrency, formatDate, quotationRequestStatusConfig, quotationStatusConfig, StatusBadge } from '@/lib/status-utils';
import { Button } from '@/components/ui/button';
import { FileText, Check, X, Loader2 } from 'lucide-react';

export default function QuotationsPage() {
  const { role } = useAuth();
  const isVendor = role === 'vendor';
  const { data: quotationRequests = [], isLoading: loadingQR } = useQuotationRequests();
  const { data: quotations = [], isLoading: loadingQ } = useQuotations();
  const updateQuotation = useUpdateQuotation();

  if (loadingQR || loadingQ) return <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Quotations</h1>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-display font-semibold text-foreground">
          {isVendor ? 'Your Quotation Requests' : 'Quotation Requests'}
        </h2>
        {quotationRequests.map((qr: any, i: number) => (
          <div key={qr.id} className="card-elevated p-4 space-y-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><StatusBadge config={quotationRequestStatusConfig[qr.status as keyof typeof quotationRequestStatusConfig]} /></div>
                <p className="text-sm font-medium text-foreground mt-1">{qr.order?.title || 'Order'}</p>
                <p className="text-xs text-muted-foreground">Vendor: {qr.vendor?.name}</p>
                {qr.notes && <p className="text-xs text-muted-foreground mt-1">{qr.notes}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(qr.created_at)}</span>
            </div>
          </div>
        ))}
        {quotationRequests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground"><FileText className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No quotation requests</p></div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-display font-semibold text-foreground">Quotations</h2>
        {quotations.map((q: any, i: number) => (
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
        {quotations.length === 0 && <div className="text-center py-8 text-muted-foreground"><p className="text-sm">No quotations yet</p></div>}
      </div>
    </div>
  );
}
