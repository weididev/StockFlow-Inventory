import { useState, useMemo, FormEvent } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  Package
} from 'lucide-react';
import { InventoryItem } from '../types';
import { cn } from '../lib/utils';
import { Modal } from './Modal';

interface InventoryListProps {
  inventory: {
    items: InventoryItem[];
    addItem: (item: any) => void;
    updateItem: (item: InventoryItem) => void;
    removeItem: (id: string) => void;
    addTransaction: (t: any) => void;
  };
}

export function InventoryList({ inventory }: InventoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '' as number | string,
    minStock: '' as number | string,
    unit: 'Pcs',
  });
  const [giveData, setGiveData] = useState({
    quantity: 1,
    recipient: '',
    notes: '',
  });

  const categories = useMemo(() => {
    const cats = new Set(inventory.items.map(i => i.category));
    return ['All', ...Array.from(cats)].sort();
  }, [inventory.items]);

  const filteredItems = useMemo(() => {
    return inventory.items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [inventory.items, searchQuery, selectedCategory]);

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    inventory.addItem({
      ...formData,
      quantity: Number(formData.quantity) || 0,
      minStock: Number(formData.minStock) || 0
    });
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      inventory.updateItem({ 
        ...selectedItem, 
        ...formData,
        quantity: Number(formData.quantity) || 0,
        minStock: Number(formData.minStock) || 0
      });
      setIsEditModalOpen(false);
      resetForm();
    }
  };

  const handleGiveSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      inventory.addTransaction({
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        type: 'OUT',
        quantity: giveData.quantity,
        recipient: giveData.recipient,
        notes: giveData.notes,
      });
      setIsGiveModalOpen(false);
      setGiveData({ quantity: 1, recipient: '', notes: '' });
    }
  };

  const handleAddStockSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      inventory.addTransaction({
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        type: 'IN',
        quantity: giveData.quantity,
        recipient: 'Admin',
        notes: 'Restock addition',
      });
      setIsGiveModalOpen(false); 
      setGiveData({ quantity: 1, recipient: '', notes: '' });
    }
  }

  const resetForm = () => {
    setFormData({ name: '', category: '', quantity: '', minStock: '', unit: 'Pcs' });
    setSelectedItem(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 w-64 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 appearance-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowDownRight size={14} className="text-gray-400" />
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-sm font-bold shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>Add New Item</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item Details</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stock Level</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alert At</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Sync</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold dark:text-white">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium">#{item.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                       <span className={cn(
                        "text-sm font-bold dark:text-white",
                        item.quantity <= item.minStock ? "text-red-500" : ""
                      )}>{item.quantity} {item.unit}</span>
                      {item.quantity <= item.minStock && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
                    </div>
                    <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          item.quantity <= item.minStock ? "bg-red-500" : "bg-black dark:bg-white"
                        )}
                        style={{ width: `${Math.min(100, (item.quantity / (item.minStock * 2)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs font-medium text-gray-400 tracking-wider">≤ {item.minStock} {item.unit}</span>
                </td>
                <td className="px-6 py-5">
                   <p className="text-xs text-gray-400">{new Date(item.lastUpdated).toLocaleDateString()}</p>
                   <p className="text-[10px] text-gray-300 uppercase">{new Date(item.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button 
                      onClick={() => { setSelectedItem(item); setIsGiveModalOpen(true); }}
                      title="Stock Movement"
                      className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                    >
                      <ArrowDownRight size={18} />
                    </button>
                    <button 
                      onClick={() => { 
                        setSelectedItem(item); 
                        setFormData({ 
                          name: item.name, 
                          category: item.category, 
                          quantity: item.quantity, 
                          minStock: item.minStock, 
                          unit: item.unit 
                        }); 
                        setIsEditModalOpen(true); 
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => setItemToDelete(item)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                   <Package size={48} className="mx-auto mb-4 opacity-20" />
                   <p className="text-sm">No items found matching your search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Item">
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Item Name</label>
              <div className="relative z-20">
                <input 
                  required
                  type="text" 
                  autoComplete="off"
                  placeholder="e.g. Printer Paper A4"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                  value={formData.name}
                  onChange={e => {
                    const val = e.target.value;
                    const existingItem = inventory.items.find(i => i.name.toLowerCase() === val.toLowerCase());
                    if (existingItem) {
                      setFormData({...formData, name: val, category: existingItem.category, unit: existingItem.unit});
                    } else {
                      setFormData({...formData, name: val});
                    }
                  }}
                />
                {formData.name.length >= 1 && (
                  (() => {
                    const matches = Array.from(new Set(inventory.items.map(i => i.name)))
                      .filter(name => name.toLowerCase().startsWith(formData.name.toLowerCase()) && name.toLowerCase() !== formData.name.toLowerCase());
                    
                    if (matches.length === 0) return null;
                    
                    return (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-30 max-h-48 overflow-y-auto">
                        {matches.map((name, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-white border-b border-gray-50 dark:border-gray-800 last:border-0"
                            onClick={() => {
                              const existingItem = inventory.items.find(i => i.name.toLowerCase() === name.toLowerCase());
                              if (existingItem) {
                                setFormData({...formData, name, category: existingItem.category, unit: existingItem.unit});
                              } else {
                                setFormData({...formData, name});
                              }
                            }}
                          >
                            <span className="font-bold">{name.slice(0, formData.name.length)}</span>
                            {name.slice(formData.name.length)}
                          </button>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                      // Small delay to allow the layout to settle
                      setTimeout(() => {
                        const list = document.getElementById('category-suggestions-dropdown');
                        if (list) list.style.display = 'block';
                      }, 50);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        const list = document.getElementById('category-suggestions-dropdown');
                        if (list) list.style.display = 'none';
                      }, 200);
                    }}
                  />
                  <div
                    id="category-suggestions-dropdown" 
                    className="hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-30 max-h-48 overflow-y-auto"
                  >
                    {Array.from(new Set(inventory.items.map(item => item.category)))
                      .filter(cat => cat.toLowerCase().includes(formData.category.toLowerCase()) || formData.category === '')
                      .map((cat, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-white border-b border-gray-50 dark:border-gray-800 last:border-0"
                        onClick={() => {
                          setFormData({...formData, category: cat});
                          const list = document.getElementById('category-suggestions-dropdown');
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Initial Qty</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)})}
                />
              </div>
              <div className="flex flex-col gap-1.5">
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
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <button 
              type="button" 
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-2 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-sm font-bold shadow-xl shadow-black/10 hover:shadow-2xl transition-all"
            >
              Create Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Item Details">
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
             <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Item Name</label>
                <input 
                  required
                  type="text" 
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quantity</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)})}
                  />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                  <input 
                    required
                    type="text" 
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Min. Alert</label>
                  <input 
                    required
                    type="number" 
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                    value={formData.minStock}
                    onChange={e => setFormData({...formData, minStock: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)})}
                  />
                </div>
              </div>
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-sm font-bold shadow-xl shadow-black/10 transition-all"
          >
            Update Item
          </button>
        </form>
      </Modal>

      {/* Give/Add Stock Modal */}
      <Modal isOpen={isGiveModalOpen} onClose={() => setIsGiveModalOpen(false)} title="Stock Movement">
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-800">
           <div className="w-12 h-12 bg-white dark:bg-gray-950 rounded-xl flex items-center justify-center text-black dark:text-white border border-gray-100 dark:border-gray-800">
             <Package size={24} />
           </div>
           <div>
             <h4 className="font-bold dark:text-white">{selectedItem?.name}</h4>
             <p className="text-xs text-gray-400">Current Stock: {selectedItem?.quantity} {selectedItem?.unit}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
           <button 
            onClick={() => handleGiveSubmit({ preventDefault: () => {} } as any)}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900 hover:bg-red-100 transition-all group"
           >
              <ArrowDownRight size={24} className="group-hover:translate-y-1 group-hover:translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Issue Stock</span>
           </button>
           <button 
            onClick={() => handleAddStockSubmit({ preventDefault: () => {} } as any)}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100 transition-all group"
           >
              <ArrowUpRight size={24} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Add Stock</span>
           </button>
        </div>

        <div className="flex flex-col gap-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  max={selectedItem?.quantity}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                  value={giveData.quantity}
                  onChange={e => setGiveData({...giveData, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">For/From</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe / Room 4"
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white"
                  value={giveData.recipient}
                  onChange={e => setGiveData({...giveData, recipient: e.target.value})}
                />
              </div>
           </div>
           <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notes</label>
              <textarea 
                placeholder="Optional purpose..."
                className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 h-20 resize-none dark:text-white"
                value={giveData.notes}
                onChange={e => setGiveData({...giveData, notes: e.target.value})}
              />
           </div>
        </div>
        <p className="mt-4 text-[10px] text-gray-400 italic text-center">Click one of the above colored action buttons to confirm movement.</p>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title="Confirm Deletion">
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-6">
            <Trash2 size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2 dark:text-white">Delete Item?</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Are you sure you want to permanently delete <span className="font-bold text-gray-900 dark:text-gray-200">"{itemToDelete?.name}"</span>? This action cannot be undone.
          </p>
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => setItemToDelete(null)}
              className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (itemToDelete) {
                  inventory.removeItem(itemToDelete.id);
                  setItemToDelete(null);
                }
              }}
              className="flex-2 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-red-500/20 transition-all"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
