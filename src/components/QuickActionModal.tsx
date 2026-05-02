import { useState, FormEvent } from 'react';
import { Modal } from './Modal';
import { InventoryItem } from '../types';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: {
    items: InventoryItem[];
    addItem: (item: any) => void;
    updateItem: (item: InventoryItem) => void;
    addTransaction: (t: any) => void;
  };
}

export function QuickActionModal({ isOpen, onClose, inventory }: QuickActionModalProps) {
  const [tab, setTab] = useState<'IN' | 'OUT'>('IN');
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    quantity: '' as number | string,
    minStock: '' as number | string,
    unit: 'Pcs',
    recipient: '',
    notes: '',
  });

  const existingItem = inventory.items.find(i => i.name.toLowerCase() === formData.itemName.toLowerCase());
  const isNewItem = tab === 'IN' && formData.itemName.trim().length > 0 && !existingItem;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tab === 'IN') {
      if (isNewItem) {
        inventory.addItem({
          name: formData.itemName.trim(),
          category: formData.category || 'Uncategorized',
          unit: formData.unit,
          quantity: Number(formData.quantity) || 0,
          minStock: Number(formData.minStock) || 0
        });
      } else {
        if (!existingItem) {
          alert('Item not found! Please select an existing item or create a new one.');
          return;
        }
        
        inventory.updateItem({
          ...existingItem,
          category: formData.category || existingItem.category,
          unit: formData.unit || existingItem.unit,
          minStock: formData.minStock !== '' ? Number(formData.minStock) : existingItem.minStock,
        });

        inventory.addTransaction({
          itemId: existingItem.id,
          itemName: existingItem.name,
          type: 'IN',
          quantity: Number(formData.quantity) || 0,
          recipient: formData.recipient || 'Admin',
          notes: formData.notes,
        });
      }
    } else {
      if (!existingItem) {
        alert('Item not found! Please select an existing item.');
        return;
      }
      inventory.addTransaction({
        itemId: existingItem.id,
        itemName: existingItem.name,
        type: 'OUT',
        quantity: Number(formData.quantity) || 0,
        recipient: formData.recipient || '',
        notes: formData.notes,
      });
    }
    
    onClose();
    setFormData({ itemName: '', category: '', quantity: '', minStock: '', unit: 'Pcs', recipient: '', notes: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Action">
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
        <button 
          type="button"
          onClick={() => setTab('IN')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'IN' ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Add Stock
        </button>
        <button 
          type="button"
          onClick={() => setTab('OUT')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'OUT' ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Issue Stock
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Item Name</label>
            <div className="relative z-20">
              <input 
                required
                type="text" 
                placeholder="Start typing item name (or new name)..."
                autoComplete="off"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                value={formData.itemName}
                onChange={e => {
                  const val = e.target.value;
                  const item = inventory.items.find(i => i.name.toLowerCase() === val.toLowerCase());
                  if (item) {
                    setFormData({
                      ...formData, 
                      itemName: val,
                      category: item.category,
                      unit: item.unit,
                      minStock: item.minStock
                    });
                  } else {
                    setFormData({...formData, itemName: val});
                  }
                }}
              />
              {formData.itemName.length >= 1 && (
                (() => {
                  const matches = Array.from(new Set(inventory.items.map(i => i.name)))
                    .filter(name => name.toLowerCase().startsWith(formData.itemName.toLowerCase()) && name.toLowerCase() !== formData.itemName.toLowerCase());
                  
                  if (matches.length === 0) return null;
                  
                  return (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-30 max-h-48 overflow-y-auto">
                      {matches.map((name, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-white border-b border-gray-50 dark:border-gray-800 last:border-0"
                          onClick={() => {
                            const item = inventory.items.find(i => i.name.toLowerCase() === name.toLowerCase());
                            if (item) {
                              setFormData({
                                ...formData, 
                                itemName: name,
                                category: item.category,
                                unit: item.unit,
                                minStock: item.minStock
                              });
                            } else {
                              setFormData({ ...formData, itemName: name });
                            }
                          }}
                        >
                          <span className="font-bold">{name.slice(0, formData.itemName.length)}</span>
                          {name.slice(formData.itemName.length)}
                        </button>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          {tab === 'IN' && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                <div className="relative">
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Stationery"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    onFocus={() => {
                      const list = document.getElementById('quick-category-suggestions');
                      if (list) list.style.display = 'block';
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        const list = document.getElementById('quick-category-suggestions');
                        if (list) list.style.display = 'none';
                      }, 200);
                    }}
                  />
                  <div
                    id="quick-category-suggestions" 
                    className="hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-40 max-h-48 overflow-y-auto"
                  >
                    {Array.from(new Set(inventory.items.map(item => item.category)))
                      .filter(cat => cat.toLowerCase().includes(formData.category.toLowerCase()) || formData.category === '')
                      .map((cat, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onPointerDown={(e) => e.preventDefault()}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-white border-b border-gray-50 dark:border-gray-800 last:border-0"
                        onClick={() => {
                          setFormData({...formData, category: cat});
                          const list = document.getElementById('quick-category-suggestions');
                          if (list) list.style.display = 'none';
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Unit</label>
                <select 
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                >
                  <option>Pcs</option>
                  <option>Boxes</option>
                  <option>Packets</option>
                  <option>Rolls</option>
                  <option>Units</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tab === 'IN' ? 'Quantity to Add' : 'Quantity to Issue'}</label>
              <input 
                required
                type="number" 
                min={isNewItem ? "0" : "1"}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value === '' ? '' : Math.max(isNewItem ? 0 : 1, parseInt(e.target.value) || (isNewItem ? 0 : 1))})}
              />
            </div>

            {tab === 'IN' ? (
              <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Min. Stock Alert</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                  value={formData.minStock}
                  onChange={e => setFormData({...formData, minStock: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)})}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Issue To</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe / Room 5"
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                  value={formData.recipient}
                  onChange={e => setFormData({...formData, recipient: e.target.value})}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notes / Source</label>
            <textarea 
              placeholder={tab === 'IN' ? 'Optional supplier or notes...' : 'Optional purpose...'}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 h-20 resize-none dark:text-white"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          {isNewItem && tab === 'IN' && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
              This item doesn't exist yet, it will be automatically created.
            </div>
          )}
          {!isNewItem && tab === 'IN' && existingItem && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
              Updating details & adding stock to existing item (Current stock: {existingItem.quantity} {existingItem.unit}).
            </div>
          )}
        </div>
        <div className="flex gap-4 mt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className={`flex-2 px-8 py-4 text-white rounded-2xl text-sm font-bold shadow-xl transition-all ${
              tab === 'OUT' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 
              'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
            }`}
          >
            {isNewItem ? 'Create & Add Stock' : 'Confirm Movement'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
