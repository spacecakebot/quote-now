import { useState } from 'react';
import { useVendors, useCreateVendor, useQuotationRequests, useQuotations } from '@/hooks/use-shop-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Phone, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency, formatDate, quotationRequestStatusConfig, quotationStatusConfig, StatusBadge } from '@/lib/status-utils';

export default function VendorsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });

  const { data: vendors = [], isLoading } = useVendors();
  const { data: quotationRequests = [] } = useQuotationRequests();
  const { data: quotations = [] } = useQuotations();
  const createVendor = useCreateVendor();

  const filtered = vendors.filter((v: any) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) || (v.phone || '').includes(search)
  );

  const selectedVendor = vendors.find((v: any) => v.id === selected);
  const vendorQRs = selected ? quotationRequests.filter((q: any) => q.vendor_id === selected) : [];
  const vendorQuotes = selected ? quotations.filter((q: any) => q.vendor_id === selected) : [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createVendor.mutateAsync({ name: form.name, phone: form.phone || undefined, address: form.address || undefined, notes: form.notes || undefined });
    setForm({ name: '', phone: '', address: '', notes: '' });
    setDialogOpen(false);
  };

  if (isLoading) return <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Vendors</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gold-gradient text-primary-foreground" size="sm"><Plus className="w-4 h-4 mr-1" /> Add</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Add Vendor</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Name *</Label><Input placeholder="Vendor name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Phone</Label><Input placeholder="+91..." type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Address</Label><Input placeholder="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Specialization notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={createVendor.isPending}>{createVendor.isPending ? 'Saving...' : 'Save Vendor'}</Button>
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
          {vendorQRs.map((qr: any) => (
            <div key={qr.id} className="card-elevated p-3">
              <div className="flex justify-between"><div><p className="text-sm font-medium text-foreground">{qr.order?.title}</p><p className="text-xs text-muted-foreground">{formatDate(qr.created_at)}</p></div><StatusBadge config={quotationRequestStatusConfig[qr.status as keyof typeof quotationRequestStatusConfig]} /></div>
            </div>
          ))}
          <h3 className="text-sm font-display font-semibold text-foreground">Quotations</h3>
          {vendorQuotes.map((q: any) => (
            <div key={q.id} className="card-elevated p-3">
              <div className="flex justify-between"><div><p className="text-sm font-bold text-foreground">{formatCurrency(q.amount)}</p><p className="text-xs text-muted-foreground">{formatDate(q.created_at)}</p></div><StatusBadge config={quotationStatusConfig[q.status as keyof typeof quotationStatusConfig]} /></div>
            </div>
          ))}
          {vendorQRs.length === 0 && vendorQuotes.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No quotation history</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((v: any, i: number) => (
            <button key={v.id} onClick={() => setSelected(v.id)} className="card-elevated p-3 w-full text-left flex items-center gap-3 hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent shrink-0">{v.name.charAt(0)}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground">{v.name}</p>{v.phone && <p className="text-xs text-muted-foreground">{v.phone}</p>}{v.notes && <p className="text-xs text-muted-foreground truncate">{v.notes}</p>}</div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
