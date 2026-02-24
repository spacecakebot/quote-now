import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Mail, UserCheck, Clock } from 'lucide-react';

const demoInvites = [
  { email: 'newadmin@example.com', role: 'admin', status: 'pending' },
];

export default function SettingsPage() {
  const { shop, profile } = useAuth();

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-display font-bold text-foreground">Settings</h1>

      {/* Shop info */}
      <div className="card-elevated p-4 space-y-4">
        <h2 className="text-sm font-display font-semibold text-foreground">Shop Details</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Shop Name</Label>
            <Input defaultValue={shop?.name || ''} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Phone</Label>
            <Input defaultValue={shop?.phone || ''} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Address</Label>
            <Input defaultValue={shop?.address || ''} />
          </div>
          <Button className="gold-gradient text-primary-foreground" size="sm">Save Changes</Button>
        </div>
      </div>

      <Separator />

      {/* Team */}
      <div className="card-elevated p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-display font-semibold text-foreground">Team Members</h2>
          <Button variant="outline" size="sm"><Plus className="w-3 h-3 mr-1" /> Invite</Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {profile?.full_name?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
            </div>
            <UserCheck className="w-4 h-4 text-success" />
          </div>
          {demoInvites.map(inv => (
            <div key={inv.email} className="flex items-center gap-3 py-2 opacity-60">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{inv.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{inv.role}</p>
              </div>
              <span className="text-xs text-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Messaging provider */}
      <div className="card-elevated p-4 space-y-4">
        <h2 className="text-sm font-display font-semibold text-foreground">Messaging Provider</h2>
        <p className="text-xs text-muted-foreground">Configure WhatsApp Cloud API or Twilio for automated messages.</p>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">API URL</Label>
            <Input placeholder="https://graph.facebook.com/v18.0/..." />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">API Token</Label>
            <Input type="password" placeholder="Bearer token" />
          </div>
          <Button variant="outline" size="sm">Save Provider Settings</Button>
        </div>
      </div>
    </div>
  );
}
