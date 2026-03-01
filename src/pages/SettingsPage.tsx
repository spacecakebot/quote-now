import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateShop } from '@/hooks/use-shop-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { UserCheck } from 'lucide-react';

export default function SettingsPage() {
  const { shop, profile } = useAuth();
  const updateShop = useUpdateShop();
  const [form, setForm] = useState({ name: shop?.name || '', phone: shop?.phone || '', address: shop?.address || '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    await updateShop.mutateAsync({ id: shop.id, name: form.name, phone: form.phone || undefined, address: form.address || undefined });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-display font-bold text-foreground">Settings</h1>

      <form onSubmit={handleSave} className="card-elevated p-4 space-y-4">
        <h2 className="text-sm font-display font-semibold text-foreground">Shop Details</h2>
        <div className="space-y-3">
          <div className="space-y-1"><Label className="text-xs text-muted-foreground">Shop Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="space-y-1"><Label className="text-xs text-muted-foreground">Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div className="space-y-1"><Label className="text-xs text-muted-foreground">Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          <Button type="submit" className="gold-gradient text-primary-foreground" size="sm" disabled={updateShop.isPending}>{updateShop.isPending ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>

      <Separator />

      <div className="card-elevated p-4 space-y-4">
        <h2 className="text-sm font-display font-semibold text-foreground">Team Members</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{profile?.full_name?.charAt(0)}</div>
            <div className="flex-1"><p className="text-sm font-medium text-foreground">{profile?.full_name}</p><p className="text-xs text-muted-foreground capitalize">{profile?.role}</p></div>
            <UserCheck className="w-4 h-4 text-success" />
          </div>
        </div>
      </div>
    </div>
  );
}
