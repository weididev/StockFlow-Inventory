import { useAnalytics } from '../hooks/useAnalytics';
import { InventoryItem, Transaction } from '../types';
import { TrendingUp, Package, Clock, AlertCircle } from 'lucide-react';

interface AnalyticsDashboardProps {
  items: InventoryItem[];
  history: Transaction[];
}

export function AnalyticsDashboard({ items, history }: AnalyticsDashboardProps) {
  const analytics = useAnalytics(items, history);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
          <TrendingUp size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold dark:text-white">Smart Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Inventory trends and restock suggestions based on your usual patterns.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Restocking Suggestions */}
        <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Clock size={18} className="text-blue-500" />
            Restock Times & Suggestions
          </h3>
          <div className="flex flex-col gap-3">
            {analytics.restockingPatterns.filter(p => p.avgDaysBetweenRestock !== null).length === 0 && (
              <p className="text-sm text-gray-400 italic">Not enough historical data to generate restock patterns yet. Add items more than once.</p>
            )}
            {analytics.restockingPatterns.filter(p => p.avgDaysBetweenRestock !== null)
              .sort((a, b) => {
                 if (a.isDue && !b.isDue) return -1;
                 if (!a.isDue && b.isDue) return 1;
                 return (a.nextExpectedRestock?.getTime() || 0) - (b.nextExpectedRestock?.getTime() || 0);
              })
              .slice(0, 8)
              .map(pattern => (
              <div key={pattern.item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                <div>
                  <p className="font-bold text-sm dark:text-white">{pattern.item.name}</p>
                  <p className="text-xs text-gray-500">Restocked every {pattern.avgDaysBetweenRestock?.toFixed(1)} days approx.</p>
                  <p className="text-[10px] text-gray-400">Current Stock: {pattern.item.quantity}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  {pattern.isDue ? (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <AlertCircle size={10} />
                      Due Now
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Next: {pattern.nextExpectedRestock?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Frequently Brought Items */}
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Package size={18} className="text-emerald-500" />
              Frequently Added Items
            </h3>
            <div className="flex flex-wrap gap-2">
              {analytics.frequentlyBought.length === 0 && (
                 <p className="text-sm text-gray-400 italic">No historical stock additions yet.</p>
              )}
              {analytics.frequentlyBought.slice(0, 10).map((pattern, index) => (
                <div key={pattern.item.id} className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-sm flex items-center gap-2">
                  <span className="font-bold text-gray-400 text-xs">#{index + 1}</span>
                  <span className="font-medium dark:text-gray-300">{pattern.item.name}</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-bold">
                    Added {pattern.frequency}x
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Items Bought Together */}
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-500" />
              Frequently Restocked Together
            </h3>
            <div className="flex flex-col gap-3">
              {analytics.boughtTogether.length === 0 && (
                <p className="text-sm text-gray-400 italic">No multiple items were restocked together recently.</p>
              )}
              {analytics.boughtTogether.slice(0, 5).map((pair, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm dark:text-gray-300">{pair.item1?.name}</span>
                    <span className="text-xs text-gray-400">&</span>
                    <span className="font-medium text-sm dark:text-gray-300">{pair.item2?.name}</span>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-lg border border-purple-200 dark:border-purple-800">
                    {pair.count} times
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
