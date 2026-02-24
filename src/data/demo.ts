import { Customer, Vendor, Order, Payment, Reminder, QuotationRequest, Quotation, MessageLog } from '@/types';

// Demo customers
export const demoCustomers: Customer[] = [
  { id: 'c1', shop_id: 'shop-1', name: 'Anita Desai', phone: '+919812345001', address: 'Bandra West, Mumbai', notes: 'Regular customer, prefers 22K gold', created_at: '2024-01-15T10:00:00Z' },
  { id: 'c2', shop_id: 'shop-1', name: 'Vikram Patel', phone: '+919812345002', address: 'Juhu, Mumbai', notes: 'Corporate gifts buyer', created_at: '2024-02-20T10:00:00Z' },
  { id: 'c3', shop_id: 'shop-1', name: 'Meera Joshi', phone: '+919812345003', address: 'Powai, Mumbai', notes: 'Wedding order - May 2025', created_at: '2024-03-10T10:00:00Z' },
  { id: 'c4', shop_id: 'shop-1', name: 'Rahul Mehta', phone: '+919812345004', address: 'Colaba, Mumbai', notes: null, created_at: '2024-04-05T10:00:00Z' },
  { id: 'c5', shop_id: 'shop-1', name: 'Sunita Agarwal', phone: '+919812345005', address: 'Andheri East, Mumbai', notes: 'Antique jewellery collector', created_at: '2024-05-12T10:00:00Z' },
];

// Demo vendors
export const demoVendors: Vendor[] = [
  { id: 'v1', shop_id: 'shop-1', name: 'Sunil Goldworks', phone: '+919876543212', address: 'Zaveri Bazaar, Mumbai', notes: 'Specializes in temple jewellery', created_at: '2024-01-10T10:00:00Z' },
  { id: 'v2', shop_id: 'shop-1', name: 'Mahalaxmi Casting', phone: '+919876543213', address: 'Kalbadevi, Mumbai', notes: 'Casting and polishing', created_at: '2024-01-15T10:00:00Z' },
  { id: 'v3', shop_id: 'shop-1', name: 'Diamond Hub India', phone: '+919876543214', address: 'BKC, Mumbai', notes: 'Diamond supplier', created_at: '2024-02-01T10:00:00Z' },
];

// Demo orders
export const demoOrders: Order[] = [
  {
    id: 'o1', shop_id: 'shop-1', customer_id: 'c1', vendor_id: 'v1', order_no: 'GS-0001',
    title: '22K Gold Necklace Set', description: 'Bridal necklace with matching earrings, 45g approx',
    status: 'in_progress', priority: 'high', due_date: '2025-03-15T00:00:00Z',
    created_at: '2025-01-10T10:00:00Z', updated_at: '2025-02-20T10:00:00Z',
    total_amount: 285000, advance_amount: 100000, payment_status: 'partial',
    customer: demoCustomers[0], vendor: demoVendors[0],
  },
  {
    id: 'o2', shop_id: 'shop-1', customer_id: 'c2', vendor_id: null, order_no: 'GS-0002',
    title: 'Corporate Gold Coins (10 pcs)', description: '10g 24K gold coins with company logo',
    status: 'ready', priority: 'normal', due_date: '2025-02-28T00:00:00Z',
    created_at: '2025-02-01T10:00:00Z', updated_at: '2025-02-22T10:00:00Z',
    total_amount: 620000, advance_amount: 620000, payment_status: 'paid',
    customer: demoCustomers[1],
  },
  {
    id: 'o3', shop_id: 'shop-1', customer_id: 'c3', vendor_id: 'v1', order_no: 'GS-0003',
    title: 'Wedding Bangles Set (6 pcs)', description: '22K gold bangles, traditional Rajasthani design',
    status: 'received', priority: 'high', due_date: '2025-04-20T00:00:00Z',
    created_at: '2025-02-15T10:00:00Z', updated_at: '2025-02-15T10:00:00Z',
    total_amount: 450000, advance_amount: 50000, payment_status: 'partial',
    customer: demoCustomers[2], vendor: demoVendors[0],
  },
  {
    id: 'o4', shop_id: 'shop-1', customer_id: 'c4', vendor_id: 'v2', order_no: 'GS-0004',
    title: 'Ring Resizing', description: 'Resize gold ring from size 16 to 18',
    status: 'delivered', priority: 'low', due_date: '2025-02-10T00:00:00Z',
    created_at: '2025-02-05T10:00:00Z', updated_at: '2025-02-10T10:00:00Z',
    total_amount: 1500, advance_amount: 1500, payment_status: 'paid',
    customer: demoCustomers[3], vendor: demoVendors[1],
  },
  {
    id: 'o5', shop_id: 'shop-1', customer_id: 'c5', vendor_id: null, order_no: 'GS-0005',
    title: 'Antique Pendant Repair', description: 'Fix broken chain hook on vintage pendant',
    status: 'draft', priority: 'normal', due_date: null,
    created_at: '2025-02-23T10:00:00Z', updated_at: '2025-02-23T10:00:00Z',
    total_amount: 3000, advance_amount: 0, payment_status: 'unpaid',
    customer: demoCustomers[4],
  },
  {
    id: 'o6', shop_id: 'shop-1', customer_id: 'c1', vendor_id: 'v3', order_no: 'GS-0006',
    title: 'Diamond Stud Earrings', description: '0.5ct each, VS1 clarity, set in 18K white gold',
    status: 'in_progress', priority: 'high', due_date: '2025-03-05T00:00:00Z',
    created_at: '2025-02-10T10:00:00Z', updated_at: '2025-02-21T10:00:00Z',
    total_amount: 175000, advance_amount: 90000, payment_status: 'partial',
    customer: demoCustomers[0], vendor: demoVendors[2],
  },
];

// Demo payments
export const demoPayments: Payment[] = [
  { id: 'p1', order_id: 'o1', shop_id: 'shop-1', amount: 50000, method: 'upi', paid_at: '2025-01-10T10:00:00Z', notes: 'Initial advance' },
  { id: 'p2', order_id: 'o1', shop_id: 'shop-1', amount: 50000, method: 'cash', paid_at: '2025-02-01T10:00:00Z', notes: 'Second installment' },
  { id: 'p3', order_id: 'o2', shop_id: 'shop-1', amount: 620000, method: 'bank', paid_at: '2025-02-01T10:00:00Z', notes: 'Full payment via NEFT' },
  { id: 'p4', order_id: 'o3', shop_id: 'shop-1', amount: 50000, method: 'cash', paid_at: '2025-02-15T10:00:00Z', notes: 'Booking advance' },
  { id: 'p5', order_id: 'o4', shop_id: 'shop-1', amount: 1500, method: 'upi', paid_at: '2025-02-05T10:00:00Z', notes: 'Full payment' },
  { id: 'p6', order_id: 'o6', shop_id: 'shop-1', amount: 90000, method: 'card', paid_at: '2025-02-10T10:00:00Z', notes: 'Card payment' },
];

// Demo reminders
export const demoReminders: Reminder[] = [
  { id: 'r1', shop_id: 'shop-1', order_id: 'o1', customer_id: 'c1', vendor_id: null, reminder_type: 'delivery_due', message: 'Necklace set due for delivery on March 15', due_at: '2025-03-14T09:00:00Z', sent_at: null, channel: 'whatsapp', status: 'pending' },
  { id: 'r2', shop_id: 'shop-1', order_id: 'o3', customer_id: 'c3', vendor_id: null, reminder_type: 'payment_due', message: 'Balance ₹4,00,000 due for wedding bangles', due_at: '2025-03-01T09:00:00Z', sent_at: null, channel: 'whatsapp', status: 'pending' },
  { id: 'r3', shop_id: 'shop-1', order_id: 'o6', customer_id: 'c1', vendor_id: null, reminder_type: 'delivery_due', message: 'Diamond studs due March 5', due_at: '2025-03-04T09:00:00Z', sent_at: null, channel: 'in_app', status: 'pending' },
];

// Demo quotation requests
export const demoQuotationRequests: QuotationRequest[] = [
  { id: 'qr1', shop_id: 'shop-1', order_id: 'o3', vendor_id: 'v1', notes: 'Need quote for 6-piece wedding bangles set, Rajasthani design, 22K', status: 'responded', created_at: '2025-02-15T10:00:00Z', order: demoOrders[2], vendor: demoVendors[0] },
  { id: 'qr2', shop_id: 'shop-1', order_id: 'o5', vendor_id: 'v2', notes: 'Antique pendant repair cost estimate', status: 'requested', created_at: '2025-02-23T10:00:00Z', order: demoOrders[4], vendor: demoVendors[1] },
];

// Demo quotations
export const demoQuotations: Quotation[] = [
  { id: 'q1', shop_id: 'shop-1', quotation_request_id: 'qr1', vendor_id: 'v1', amount: 380000, details: '22K gold bangles x6, approx 120g total. Includes making charges ₹2,500/g.', status: 'sent', created_at: '2025-02-16T10:00:00Z', responded_at: '2025-02-16T10:00:00Z', vendor: demoVendors[0] },
];

// Demo message logs
export const demoMessageLogs: MessageLog[] = [
  { id: 'm1', shop_id: 'shop-1', related_type: 'order', related_id: 'o1', channel: 'whatsapp', to_phone: '+919812345001', template_name: 'order_update', message_body: 'Dear Anita, your necklace set (GS-0001) is now in progress. Expected delivery: March 15.', status: 'sent', provider_message_id: 'wamid_001', created_at: '2025-02-20T10:00:00Z' },
  { id: 'm2', shop_id: 'shop-1', related_type: 'order', related_id: 'o2', channel: 'whatsapp', to_phone: '+919812345002', template_name: 'order_ready', message_body: 'Dear Vikram, your gold coins order (GS-0002) is ready for pickup!', status: 'sent', provider_message_id: 'wamid_002', created_at: '2025-02-22T10:00:00Z' },
  { id: 'm3', shop_id: 'shop-1', related_type: 'quotation', related_id: 'qr1', channel: 'whatsapp', to_phone: '+919876543212', template_name: 'quotation_request', message_body: 'Hi Sunil, new quotation request for wedding bangles set. Please check the app for details.', status: 'sent', provider_message_id: 'wamid_003', created_at: '2025-02-15T10:00:00Z' },
];
