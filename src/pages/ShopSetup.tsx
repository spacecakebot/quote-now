import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gem } from 'lucide-react';
import { toast } from 'sonner';

export default function ShopSetup() {
  const { user, refreshProfile, signOut } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      // Create shop
      const { data: shop, error: shopErr } = await supabase.from('shops').insert({
        name: name.trim(),
        phone: phone || null,
        address: address || null,
        created_by: user!.id,
      }).select().single();
      if (shopErr) throw shopErr;

      // Link profile to shop
      const { error: profileErr } = await supabase.from('profiles').update({ shop_id: shop.id }).eq('id', user!.id);
      if (profileErr) throw profileErr;

      await refreshProfile();
      toast.success('Shop created! Welcome aboard.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto">
            <Gem className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Set Up Your Shop</h1>
          <p className="text-sm text-muted-foreground">Create your gold shop to get started</p>
        </div>

        <form onSubmit={handleCreate} className="card-elevated p-6 space-y-4">
          <div className="space-y-2">
            <Label>Shop Name *</Label>
            <Input placeholder="e.g. Shree Gold Palace" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input placeholder="+91..." value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input placeholder="Shop address" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={loading}>
            {loading ? 'Creating...' : 'Create Shop'}
          </Button>
        </form>

        <p className="text-center">
          <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground">Sign out</button>
        </p>
      </div>
    </div>
  );
}
