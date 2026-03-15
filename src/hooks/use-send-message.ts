import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SendMessageParams {
  to_phone: string;
  message_body: string;
  related_type: string;
  related_id: string;
  template_name?: string;
  channel?: 'whatsapp' | 'sms';
}

export function useSendMessage() {
  const qc = useQueryClient();
  const { shop } = useAuth();

  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          ...params,
          shop_id: shop!.id,
          channel: params.channel || 'whatsapp',
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['message_logs'] });
      if (data?.success) {
        toast.success('Message sent successfully');
      } else {
        toast.warning('Message queued but delivery may have failed');
      }
    },
    onError: (e: any) => toast.error(`Failed to send: ${e.message}`),
  });
}
