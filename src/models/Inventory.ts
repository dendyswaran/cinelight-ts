export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  location?: string;
  rentalPrice: number;
  rentalPeriod: 'day' | 'week' | 'month';
  isRented: boolean;
  rentedUntil?: string;
  deliveryOrderId?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string;
}