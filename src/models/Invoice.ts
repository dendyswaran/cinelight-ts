import { Quotation } from './Quotation';

export interface InvoiceItem {
  id: string;
  itemId: string;
  name: string;
  description?: string;
  quantity: number;
  rentalDays: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId: string;
  quotation?: Quotation;
  customerId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
  terms?: string;
  createdBy: string;
}