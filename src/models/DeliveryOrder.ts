import { Quotation } from './Quotation';

export interface DeliveryItem {
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  source: 'internal' | 'vendor';
  vendorId?: string;
  inventoryIds?: string[];
  status: 'pending' | 'delivered' | 'returned';
}

export interface DeliveryOrder {
  id: string;
  deliveryNumber: string;
  quotationId: string;
  quotation?: Quotation;
  customerId: string;
  deliveryDate: string;
  returnDate: string;
  items: DeliveryItem[];
  status: 'pending' | 'partial' | 'delivered' | 'returned';
  notes?: string;
  createdAt: string;
  createdBy: string;
}