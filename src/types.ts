export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  recipient: string; // Who gave/received it
  timestamp: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string; // e.g., "Pcs", "Boxes"
  lastUpdated: string;
}

export interface Notification {
  id: string;
  itemId: string;
  message: string;
  type: 'LOW_STOCK' | 'SMART_SUGGESTION' | 'SYSTEM';
  timestamp: string;
  read: boolean;
}
