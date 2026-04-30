import { useState, useEffect } from 'react';
import { InventoryItem, Transaction, Notification } from '../types';

const STORAGE_KEYS = {
  INVENTORY: 'inventory_items',
  HISTORY: 'inventory_history',
  NOTIFICATIONS: 'inventory_notifications',
};

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedItems = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);

    if (storedItems) setItems(JSON.parse(storedItems));
    if (storedHistory) setHistory(JSON.parse(storedHistory));
    if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    checkLowStock();
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  const checkLowStock = () => {
    const newNotifs: Notification[] = [];
    items.forEach(item => {
      if (item.quantity <= item.minStock) {
        // Only add if not already notified recently or just general alert
        const alreadyExists = notifications.some(n => n.itemId === item.id && !n.read);
        if (!alreadyExists) {
          newNotifs.push({
            id: crypto.randomUUID(),
            itemId: item.id,
            message: `Low stock alert: ${item.name} (${item.quantity} ${item.unit} left)`,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      }
    });
    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev]);
    }
  };

  const addItem = (newItem: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const item: InventoryItem = {
      ...newItem,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
    };
    setItems(prev => [...prev, item]);
    
    // Log as transaction
    addTransaction({
      itemId: item.id,
      itemName: item.name,
      type: 'IN',
      quantity: item.quantity,
      recipient: 'Admin',
      notes: 'Initial stock entry',
    });
  };

  const updateItem = (updatedItem: InventoryItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? { ...updatedItem, lastUpdated: new Date().toISOString() } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setHistory(prev => prev.filter(h => h.itemId !== id));
    setNotifications(prev => prev.filter(n => n.itemId !== id));
  };

  const addTransaction = (t: Omit<Transaction, 'id' | 'timestamp'>) => {
    const transaction: Transaction = {
      ...t,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => [transaction, ...prev]);

    // Update item quantity
    setItems(prev => prev.map(item => {
      if (item.id === transaction.itemId) {
        const newQty = transaction.type === 'IN' 
          ? item.quantity + transaction.quantity 
          : item.quantity - transaction.quantity;
        return { ...item, quantity: Math.max(0, newQty), lastUpdated: new Date().toISOString() };
      }
      return item;
    }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    items,
    history,
    notifications,
    addItem,
    updateItem,
    removeItem,
    addTransaction,
    markNotificationRead,
    clearNotifications,
  };
}
