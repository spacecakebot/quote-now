import { useState } from 'react';
import { demoCustomers, demoOrders } from '@/data/demo';
import { formatCurrency, formatDate } from '@/lib/status-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Phone, MapPin, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = demoCustomers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  const selectedCustomer = demoCustomers.find(c => c.id === selected);
  const customerOrders = selected ? demoOrders.filter(o => o.customer_id === selected) : [];

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Customers</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-primary-foreground" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Add Customer</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="Customer name" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+91..." type="tel" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="Address" />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Notes about the customer" />
              </div>
              <Button className="w-full gold-gradient text-primary-foreground">Save Customer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Customer detail view */}
      {selectedCustomer ? (
        <div className="space-y-4 animate-fade-in">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="text-muted-foreground">
            ← Back to list
          </Button>
          <div className="card-elevated p-4 space-y-3">
            <h2 className="text-lg font-display font-bold text-foreground">{selectedCustomer.name}</h2>
            {selectedCustomer.phone && (
              <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedCustomer.phone}</p>
            )}
            {selectedCustomer.address && (
              <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedCustomer.address}</p>
            )}
            {selectedCustomer.notes && <p className="text-sm text-foreground">{selectedCustomer.notes}</p>}
          </div>

          <h3 className="text-sm font-display font-semibold text-foreground">Order History ({customerOrders.length})</h3>
          {customerOrders.map(o => (
            <div key={o.id} className="card-elevated p-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-muted-foreground">{o.order_no}</span>
                  <p className="text-sm font-medium text-foreground">{o.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                </div>
                <p className="text-sm font-bold text-foreground">{formatCurrency(o.total_amount)}</p>
              </div>
            </div>
          ))}
          {customerOrders.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No orders yet</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className="card-elevated p-3 w-full text-left flex items-center gap-3 hover:shadow-md transition-shadow animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No customers found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
