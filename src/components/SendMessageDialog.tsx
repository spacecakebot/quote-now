import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send } from 'lucide-react';
import { useSendMessage } from '@/hooks/use-send-message';

interface SendMessageDialogProps {
  defaultPhone?: string;
  defaultMessage?: string;
  relatedType: string;
  relatedId: string;
  templateName?: string;
  triggerLabel?: string;
  triggerVariant?: 'default' | 'outline' | 'ghost';
  triggerSize?: 'default' | 'sm' | 'icon';
}

export default function SendMessageDialog({
  defaultPhone = '',
  defaultMessage = '',
  relatedType,
  relatedId,
  templateName,
  triggerLabel = 'Send',
  triggerVariant = 'outline',
  triggerSize = 'sm',
}: SendMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(defaultPhone);
  const [message, setMessage] = useState(defaultMessage);
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const sendMessage = useSendMessage();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage.mutateAsync({
      to_phone: phone,
      message_body: message,
      related_type: relatedType,
      related_id: relatedId,
      template_name: templateName,
      channel,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) { setPhone(defaultPhone); setMessage(defaultMessage); } }}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize}>
          <Send className="w-3.5 h-3.5 mr-1" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display">Send Message</DialogTitle></DialogHeader>
        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <Input placeholder="+91..." value={phone} onChange={e => setPhone(e.target.value)} required type="tel" />
          </div>
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v as 'whatsapp' | 'sms')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Message *</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} required placeholder="Type your message..." />
          </div>
          <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={sendMessage.isPending}>
            {sendMessage.isPending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
