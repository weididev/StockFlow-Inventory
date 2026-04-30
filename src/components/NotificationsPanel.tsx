import { Bell, CheckCircle, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { Notification } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClear: () => void;
}

export function NotificationsPanel({ notifications, onMarkRead, onClear }: NotificationsPanelProps) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2 dark:text-white">
          <Bell size={20} />
          Alert Center
          {notifications.some(n => !n.read) && (
            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase">
              New Alerts
            </span>
          )}
        </h3>
        {notifications.length > 0 && (
          <button 
            onClick={onClear}
            className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {notifications.map((notif) => (
          <div 
            key={notif.id}
            className={cn(
              "group relative bg-white dark:bg-gray-950 p-6 rounded-3xl border transition-all duration-300",
              notif.read ? "border-gray-100 dark:border-gray-800 opacity-60" : "border-red-100 dark:border-red-900 shadow-lg shadow-red-500/5 ring-1 ring-red-50 dark:ring-red-900"
            )}
          >
             <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  notif.read ? "bg-gray-50 dark:bg-gray-900 text-gray-400" : "bg-red-50 dark:bg-red-950 text-red-500"
                )}>
                  <AlertTriangle size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className={cn("text-sm font-bold dark:text-white", !notif.read && "text-red-600 dark:text-red-400")}>
                      Inventory Alert
                    </p>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock size={12} />
                      <span className="text-[10px] uppercase font-bold tracking-tight">
                        {format(new Date(notif.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                </div>
                {!notif.read && (
                  <button 
                    onClick={() => onMarkRead(notif.id)}
                    className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-900 rounded-xl transition-all"
                    title="Mark as read"
                  >
                    <CheckCircle size={20} />
                  </button>
                )}
             </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-40 text-center flex flex-col items-center justify-center gap-6 text-gray-400">
             <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center relative">
                <Bell size={40} className="opacity-10" />
                <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white dark:border-gray-900"></div>
             </div>
             <div>
                <p className="font-bold text-black dark:text-white">Perfect Inventory Health</p>
                <p className="text-sm max-w-xs mx-auto text-gray-500 dark:text-gray-400">All items are sufficiently stocked. Alerts will appear here if stock levels drop below thresholds.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
