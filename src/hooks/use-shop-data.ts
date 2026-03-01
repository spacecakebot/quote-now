import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { OrderStatus, PaymentStatus, Priority, QuotationRequestStatus, QuotationStatus, ReminderStatus, PaymentMethod, ReminderType, ReminderChannel } from '@/types';

// ─── Orders ───────────────────────────────────────
export function useOrders() {
  const { shop } = useAuth();
  return useQuery({
    queryKey: ['orders', shop?.id],
    enabled: !!shop?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:customers(*), vendor:vendors(*)')
        .eq('shop_id', shop!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useOrder(id: string | undefined) {
  const { shop } = useAuth();
  return useQuery({
    queryKey: ['order', id],
    enabled: !!id && !!shop?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:customers(*), vendor:vendors(*)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as any;
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  const { shop } = useAuth();
  return useMutation({
    mutationFn: async (values: { title: string; description?: string; customer_id?: string; vendor_id?: string; priority?: string; due_date?: string; total_amount?: number; advance_amount?: number }) => {
      // Generate order number
      const { data: orderNo } = await supabase.rpc('generate_order_no', { p_shop_id: shop!.id });
      const { data, error } = await supabase.from('orders').insert({
        shop_id: shop!.id,
        order_no: orderNo as string,
        title: values.title,
        description: values.description || null,
        customer_id: values.customer_id || null,
        vendor_id: values.vendor_id || null,
        priority: (values.priority || 'normal') as Priority,
        due_date: values.due_date || null,
        total_amount: values.total_amount || 0,
        advance_amount: values.advance_amount || 0,
        payment_status: (values.advance_amount && values.total_amount && values.advance_amount >= values.total_amount ? 'paid' : values.advance_amount && values.advance_amount > 0 ? 'partial' : 'unpaid') as PaymentStatus,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order created'); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; status?: string; priority?: string; title?: string; description?: string; customer_id?: string; vendor_id?: string; due_date?: string; total_amount?: number; advance_amount?: number; payment_status?: string }) => {
      const { error } = await supabase.from('orders').update(values as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); qc.invalidateQueries({ queryKey: ['order'] }); toast.success('Order updated'); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ─── Customers ────────────────────────────────────
export function useCustomers() {
  const { shop } = useAuth();
  return useQuery({
    queryKey: ['customers', shop?.id],
    enabled: !!shop?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*').eq('shop_id', shop!.id).order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  const { shop } = useAuth();
  return useMutation({
    mutationFn: async (values: { name: string; phone?: string; address?: string; notes?: string }) => {
      const { data, error } = await supabase.from('customers').insert({ shop_id: shop!.id, name: values.name, phone: values.phone || null, address: values.address || null, notes: values.notes || null }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer added'); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ─── Vendors ──────────────────────────────────────
export function useVendors() {
  const { shop } = useAuth();
  return useQuery({
    queryKey: ['vendors', shop?.id],
    enabled: !!shop?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('vendors').select('*').eq('shop_id', shop!.id).order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  const { shop } = useAuth();
  return useMutation({
    mutationFn: async (values: { name: string; phone?: string; address?: string; notes?: string }) => {
      const { data, error } = await supabase.from('vendors').insert({ shop_id: shop!.id, name: values.name, phone: values.phone || null, address: values.address || null, notes: values.notes || null }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendors'] }); toast.success('Vendor added'); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ─── Payments ─────────────────────────────────────
export function usePayments(orderId?: string) {
  const { shop } = useAuth();
  return useQuery({
    queryKey: ['payments', orderId || shop?.id],
    enabled: !!shop?.id,
    queryFn: async () => {
      let q = supabase.from('payments').select('*').eq('shop_id', shop!.id).order('paid_at', { ascending: false });
      if (orderId) q = q.eq('order_id', orderId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  const { shop } = useAuth();
  return useMutation({
    mutationFn: async (values: { order_id: string; amount: number; method?: string; notes?: string }) => {
      const { data, error } = await supabase.from('payments').insert({
        shop_id: shop!.id,
        order_id: values.order_id,
        amount: values.amount,
        method: (values.method || 'cash') as PaymentMethod,
        notes: values.notes || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); qc.invalidateQueries({ queryKey: ['orders'] }); qc.invalidateQueries({ queryKey: ['order'] }); toast.success('Payment recorded'); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ─── Reminders ────────────────────────────────────
export function useReminders() {
  const { shop } = useAuth();
  return useQuery({
    queryKey: ['reminders', shop?.id],
    enabled: !!shop?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('reminders').select('*').eq('shop_id', shop!.id).order('due_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  const { shop } = useAuth();
  return useMutation({
    mutationFn: async (values: { message: string; due_at: string; reminder_type?: string; channel?: string; order_id?: string; customer_id?: string; vendor_id?: string }) => {
      const { error } = await supabase.from('reminders').insert({
        shop_id: shop!.id,
        message: values.message,
        due_at: values.due_at,
        reminder_type: (values.reminder_type || 'custom') as ReminderType,
        channel: (values.channel || 'in_app') as ReminderChannel,
        order_id: values.order_id || null,
        customer_id: values.customer_id || null,
        vendor_id: values.vendor_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reminders'] }); toast.success('Reminder created'); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ─── Quotation Requests ──────────────────────────
export function useQuotationRequests() {
  const { shop } = useAuth();
  return useQuery({
    queryKey: ['quotation_requests', shop?.id],
    enabled: !!shop?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('quotation_requests').select('*, order:orders(title, order_no), vendor:vendors(name)').eq('shop_id', shop!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateQuotationRequest() {
  const qc = useQueryClient();
  const { shop } = useAuth();
  return useMutation({
    mutationFn: async (values: { order_id: string; vendor_id: string; notes?: string }) => {
      const { error } = await supabase.from('quotation_requests').insert({ shop_id: shop!.id, order_id: values.order_id, vendor_id: values.vendor_id, notes: values.notes || null });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quotation_requests'] }); toast.success('Quote requested'); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ─── Quotations ───────────────────────────────────
export function useQuotations() {
  const { shop } = useAuth();
  return useQuery({
    queryKey: ['quotations', shop?.id],
    enabled: !!shop?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('quotations').select('*, vendor:vendors(name)').eq('shop_id', shop!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useUpdateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('quotations').update({ status: status as QuotationStatus }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quotations'] }); toast.success('Quotation updated'); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ─── Message Logs ─────────────────────────────────
export function useMessageLogs() {
  const { shop } = useAuth();
  return useQuery({
    queryKey: ['message_logs', shop?.id],
    enabled: !!shop?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('message_logs').select('*').eq('shop_id', shop!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Shop Update ──────────────────────────────────
export function useUpdateShop() {
  const qc = useQueryClient();
  const { refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; name?: string; phone?: string; address?: string }) => {
      const { error } = await supabase.from('shops').update(values).eq('id', id);
      if (error) throw error;
    },
    onSuccess: async () => { await refreshProfile(); toast.success('Shop updated'); },
    onError: (e: any) => toast.error(e.message),
  });
}
