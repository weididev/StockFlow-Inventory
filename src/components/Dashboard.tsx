import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { InventoryItem, Transaction } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  items: InventoryItem[];
  history: Transaction[];
  onNavigate?: (tab: 'dashboard' | 'inventory' | 'history' | 'analytics') => void;
}

const COLORS = ['#000000', '#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export function Dashboard({ items, history, onNavigate }: DashboardProps) {
  const lowStockItems = items.filter(i => i.quantity <= i.minStock);
  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
  
  // Chart Data: Stock by Category
  const categoryData = items.reduce((acc: any[], item) => {
    const existing = acc.find(a => a.name === item.category);
    if (existing) {
      existing.value += item.quantity;
    } else {
      acc.push({ name: item.category, value: item.quantity });
    }
    return acc;
  }, []);

  // Last 7 days activity
  const recentActivity = history.slice(0, 5);

  const StatCard = ({ icon: Icon, label, value, colorClass, subText, onClick }: any) => (
    <button 
      id={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm",
        "hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5 hover:-translate-y-1 transition-all duration-500",
        "flex flex-col text-left group relative overflow-hidden h-full"
      )}
    >
      <div className={cn("absolute -right-4 -top-4 w-16 h-16 opacity-10 group-hover:scale-150 transition-transform duration-700 rounded-full", colorClass)} />
      
      <div className="flex items-center gap-2 mb-3 w-full relative z-10">
        <div className={cn("p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-black/10", colorClass)}>
          <Icon size={14} className="text-white" />
        </div>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-none">{label}</span>
      </div>
      
      <div className="mt-auto relative z-10">
        <span className="text-2xl font-black dark:text-white leading-none tracking-tight block mb-1">{value}</span>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold leading-tight line-clamp-1 opacity-80">{subText}</p>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-1">
        <StatCard 
          icon={Package} 
          label="Total Stock" 
          value={totalItems} 
          colorClass="bg-indigo-600" 
          subText="Items In Catalog"
          onClick={() => onNavigate?.('inventory')}
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Low Stock" 
          value={lowStockItems.length} 
          colorClass="bg-orange-500" 
          subText="Restock Required"
          onClick={() => onNavigate?.('inventory')}
        />
        <StatCard 
          icon={TrendingUp} 
          label="In Stock" 
          value={history.filter(h => h.type === 'IN').length} 
          colorClass="bg-emerald-500" 
          subText="Refills Logged"
          onClick={() => onNavigate?.('inventory')}
        />
        <StatCard 
          icon={TrendingDown} 
          label="Out Stock" 
          value={history.filter(h => h.type === 'OUT').length} 
          colorClass="bg-rose-500" 
          subText="Units Issued"
          onClick={() => onNavigate?.('history')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-950 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg dark:text-white">Inventory Distribution</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
              <span className="text-xs text-gray-400">Stock Levels</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1F2937', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#000000" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie */}
        <div className="bg-white dark:bg-gray-950 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-lg mb-8 dark:text-white">Category Share</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            {categoryData.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-xs font-medium dark:text-gray-300">{cat.name}</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Mini-list */}
      <div className="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between mb-6 min-w-[300px]">
          <h3 className="font-bold text-lg dark:text-white">Recent Movements</h3>
          <button 
            onClick={() => onNavigate?.('history')}
            className="text-xs font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider"
          >
            View All
          </button>
        </div>
        <div className="flex flex-col min-w-[400px]">
          {recentActivity.map((log) => (
            <div key={log.id} className="flex items-center justify-between py-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  log.type === 'IN' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                )}>
                  {log.type === 'IN' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white">{log.itemName}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">{log.type === 'IN' ? 'Restocked' : `Issued to ${log.recipient}`}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-bold", log.type === 'IN' ? "text-emerald-600" : "text-red-600")}>
                  {log.type === 'IN' ? '+' : '-'}{log.quantity}
                </p>
                <p className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No recent transactions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
