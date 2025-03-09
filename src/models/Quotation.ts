export interface QuotationItem {
  id: string;
  itemId: string;
  name: string;
  description?: string;
  quantity: number;
  rentalDays: number;
  unitPrice: number;
  total: number;
  source?: 'internal' | 'vendor';
  vendorId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer: Customer;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdAt: string;
  validUntil: string;
  notes?: string;
  terms?: string;
  createdBy: string;
}