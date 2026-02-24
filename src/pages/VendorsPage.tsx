import { useState } from 'react';
import { demoVendors, demoQuotationRequests, demoQuotations } from '@/data/demo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Phone, MapPin, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate, quotationRequestStatusConfig, quotationStatusConfig, StatusBadge } from '@/lib/status-utils';

export default function VendorsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = demoVendors.filter(v =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.phone?.includes(search)
  );

  const selectedVendor = demoVendors.find(v => v.id === selected);
  const vendorQRs = selected ? demoQuotationRequests.filter(q => q.vendor_id === selected) : [];
  const vendorQuotes = selected ? demoQuotations.filter(q => q.vendor_id === selected) : [];

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Vendors</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-primary-foreground" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Add Vendor</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input placeholder="Vendor name" /></div>
              <div className="space-y-2"><Label>Phone</Label><Input placeholder="+91..." type="tel" /></div>
              <div className="space-y-2"><Label>Address</Label><Input placeholder="Address" /></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Specialization notes" /></div>
              <Button className="w-full gold-gradient text-primary-foreground">Save Vendor</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {selectedVendor ? (
        <div className="space-y-4 animate-fade-in">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="text-muted-foreground">← Back to list</Button>
          <div className="card-elevated p-4 space-y-3">
            <h2 className="text-lg font-display font-bold text-foreground">{selectedVendor.name}</h2>
            {selectedVendor.phone && <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedVendor.phone}</p>}
            {selectedVendor.address && <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedVendor.address}</p>}
            {selectedVendor.notes && <p className="text-sm text-foreground">{selectedVendor.notes}</p>}
          </div>

          <h3 className="text-sm font-display font-semibold text-foreground">Quotation Requests</h3>
          {vendorQRs.map(qr => (
            <div key={qr.id} className="card-elevated p-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{qr.order?.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(qr.created_at)}</p>
                </div>
                <StatusBadge config={quotationRequestStatusConfig[qr.status]} />
              </div>
            </div>
          ))}

          <h3 className="text-sm font-display font-semibold text-foreground">Quotations</h3>
          {vendorQuotes.map(q => (
            <div key={q.id} className="card-elevated p-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">{formatCurrency(q.amount)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(q.created_at)}</p>
                </div>
                <StatusBadge config={quotationStatusConfig[q.status]} />
              </div>
            </div>
          ))}
          {vendorQRs.length === 0 && vendorQuotes.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No quotation history</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setSelected(v.id)}
              className="card-elevated p-3 w-full text-left flex items-center gap-3 hover:shadow-md transition-shadow animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent shrink-0">
                {v.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{v.name}</p>
                {v.phone && <p className="text-xs text-muted-foreground">{v.phone}</p>}
                {v.notes && <p className="text-xs text-muted-foreground truncate">{v.notes}</p>}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
