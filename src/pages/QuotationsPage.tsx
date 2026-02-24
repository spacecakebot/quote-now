import { useAuth } from '@/contexts/AuthContext';
import { demoQuotationRequests, demoQuotations } from '@/data/demo';
import { formatCurrency, formatDate, quotationRequestStatusConfig, quotationStatusConfig, StatusBadge } from '@/lib/status-utils';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Check, X } from 'lucide-react';

export default function QuotationsPage() {
  const { role } = useAuth();
  const isVendor = role === 'vendor';

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Quotations</h1>
        {!isVendor && (
          <Button className="gold-gradient text-primary-foreground" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Request Quote
          </Button>
        )}
      </div>

      {/* Quotation Requests */}
      <div className="space-y-3">
        <h2 className="text-sm font-display font-semibold text-foreground">
          {isVendor ? 'Your Quotation Requests' : 'Quotation Requests'}
        </h2>
        {demoQuotationRequests.map((qr, i) => (
          <div key={qr.id} className="card-elevated p-4 space-y-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge config={quotationRequestStatusConfig[qr.status]} />
                </div>
                <p className="text-sm font-medium text-foreground mt-1">{qr.order?.title}</p>
                <p className="text-xs text-muted-foreground">Vendor: {qr.vendor?.name}</p>
                {qr.notes && <p className="text-xs text-muted-foreground mt-1">{qr.notes}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(qr.created_at)}</span>
            </div>
            {isVendor && qr.status === 'requested' && (
              <div className="flex gap-2">
                <Button size="sm" className="gold-gradient text-primary-foreground flex-1">Submit Quote</Button>
                <Button size="sm" variant="outline" className="text-destructive">Decline</Button>
              </div>
            )}
          </div>
        ))}
        {demoQuotationRequests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No quotation requests</p>
          </div>
        )}
      </div>

      {/* Quotations */}
      <div className="space-y-3">
        <h2 className="text-sm font-display font-semibold text-foreground">Quotations</h2>
        {demoQuotations.map((q, i) => (
          <div key={q.id} className="card-elevated p-4 space-y-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge config={quotationStatusConfig[q.status]} />
                  <span className="text-sm font-bold text-foreground">{formatCurrency(q.amount)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">From: {q.vendor?.name}</p>
                {q.details && <p className="text-sm text-foreground mt-2">{q.details}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(q.created_at)}</span>
            </div>
            {!isVendor && q.status === 'sent' && (
              <div className="flex gap-2">
                <Button size="sm" className="bg-success text-success-foreground flex-1">
                  <Check className="w-4 h-4 mr-1" /> Accept
                </Button>
                <Button size="sm" variant="outline" className="text-destructive">
                  <X className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
