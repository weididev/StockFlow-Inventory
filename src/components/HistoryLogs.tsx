import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, Search, Filter, Download, ArrowDownRight, Package } from 'lucide-react';
import { Transaction } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface HistoryLogsProps {
  history: Transaction[];
}

export function HistoryLogs({ history }: HistoryLogsProps) {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const cats = new Set(history.map(h => h.itemCategory || 'General'));
    return ['All', ...Array.from(cats)].sort();
  }, [history]);

  const filteredHistory = history.filter(h => {
    const matchSearch = h.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedType === 'ALL' || h.type === selectedType;
    const matchCategory = selectedCategory === 'All' || (h.itemCategory || 'General') === selectedCategory;
    return matchSearch && matchType && matchCategory;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 w-full sm:w-64 dark:text-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-8 py-2 appearance-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5"
              >
                <option value="ALL">All Types</option>
                <option value="IN">Inflow Only</option>
                <option value="OUT">Outflow Only</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ArrowDownRight size={14} className="text-gray-400" />
              </div>
            </div>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
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
          onClick={() => {
            const csv = [
              ['ID', 'Date', 'Item', 'Type', 'Quantity', 'Recipient', 'Notes'].join(','),
              ...history.map(h => [
                h.id,
                format(new Date(h.timestamp), 'yyyy-MM-dd HH:mm:ss'),
                h.itemName,
                h.type,
                h.quantity,
                h.recipient,
                h.notes || ''
              ].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `inventory_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-bold hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all dark:text-gray-300"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
        <div className="flex flex-col min-w-[500px]">
          {filteredHistory.map((log, index) => (
            <div 
              key={log.id} 
              className={cn(
                "flex items-center justify-between p-6 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors",
                index !== filteredHistory.length - 1 && "border-b border-gray-50 dark:border-gray-800"
              )}
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  log.type === 'IN' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                )}>
                  {log.type === 'IN' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold dark:text-white">{log.itemName}</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                        log.type === 'IN' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {log.type === 'IN' ? 'Inflow' : 'Outflow'}
                      </span>
                   </div>
                   <p className="text-xs text-gray-500 dark:text-gray-400">
                    {log.type === 'OUT' ? `Issued to ${log.recipient}` : `Restocked by System`}
                    {log.notes && <span className="ml-2 text-gray-400 font-normal">• {log.notes}</span>}
                   </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className={cn(
                  "text-lg font-bold",
                  log.type === 'IN' ? "text-emerald-600" : "text-red-600"
                )}>
                  {log.type === 'IN' ? '+' : '-'}{log.quantity}
                </span>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={12} />
                  <span className="text-[10px] uppercase font-bold tracking-tighter">
                    {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filteredHistory.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center justify-center gap-4 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center">
                <Clock size={32} className="opacity-20" />
              </div>
              <div>
                <p className="font-bold dark:text-gray-300">No history available</p>
                <p className="text-xs">Transactions will appear here once you start managing stock.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
