/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  History as HistoryIcon, 
  Bell, 
  Search,
  LogOut,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  X,
  DatabaseBackup,
  UploadCloud,
  Menu,
  Plus
} from 'lucide-react';
import { useInventory } from './hooks/useInventory';
import { cn } from './lib/utils';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';
import { HistoryLogs } from './components/HistoryLogs';
import { NotificationsPanel } from './components/NotificationsPanel';
import { QuickActionModal } from './components/QuickActionModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

type Tab = 'dashboard' | 'inventory' | 'history' | 'analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const inventory = useInventory();
  
  const unreadCount = inventory.notifications.filter(n => !n.read).length;

  // Theme toggle effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const exportBackup = async () => {
    try {
      const backupData = {
        inventory: inventory.items,
        history: inventory.history,
        notifications: inventory.notifications,
        exportedAt: new Date().toISOString()
      };
      
      const fileName = `stockflow-db-${new Date().toISOString().slice(0,10)}.json`;
      const jsonString = JSON.stringify(backupData, null, 2);
      
      // CREATE BLOB ("CACHE MEMORY" / "CATCH MEMORY") AND SHARE DIRECTLY
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], fileName, { type: 'application/json' });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'StockFlow Backup',
          text: 'StockFlow DB Backup'
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Backup export failed:", error);
    }
  };

  const importBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json, text/plain, .json, .txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const contentStr = e.target?.result as string;
          const data = JSON.parse(contentStr);
          
          // Support both direct arrays (new) and stringified (old storage style)
          const setStorage = (key: string, val: any) => {
            if (typeof val === 'string') {
              localStorage.setItem(key, val);
            } else if (val) {
              localStorage.setItem(key, JSON.stringify(val));
            }
          };

          if (data.inventory || data.items) setStorage('inventory_items', data.inventory || data.items);
          if (data.history) setStorage('inventory_history', data.history);
          if (data.notifications) setStorage('inventory_notifications', data.notifications);
          
          alert("Import successful! The app will now reload.");
          window.location.reload();
        } catch (err) {
          alert("Could not process the backup file. Please ensure it is a valid StockFlow JSON file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const NavItem = ({ icon: Icon, label, tab }: { icon: any, label: string, tab: Tab }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
      }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
        activeTab === tab 
          ? "bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/10" 
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-gray-300"
      )}
    >
      <Icon size={20} className={cn("transition-transform duration-200", activeTab === tab ? "scale-110" : "group-hover:scale-110")} />
      <span className="font-medium text-sm">{label}</span>
      {activeTab === tab && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 bg-black dark:bg-white rounded-xl -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-gray-900 text-[#1A1A1A] dark:text-gray-100 font-sans overflow-hidden">
      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col p-6 gap-8 transform transition-transform duration-300 md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black">
            <Package size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">StockFlow</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Inventory Pro</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" tab="dashboard" />
          <NavItem icon={Package} label="Inventory" tab="inventory" />
          <NavItem icon={HistoryIcon} label="Activity History" tab="history" />
          <NavItem icon={TrendingUp} label="Smart Analytics" tab="analytics" />
          
          <div className="my-4 border-t border-gray-100 dark:border-gray-800"></div>
          
          <button
            onClick={exportBackup}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-gray-300"
          >
            <DatabaseBackup size={20} />
            <span className="font-medium text-sm">Export Backup</span>
          </button>
          
          <button
            onClick={importBackup}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-gray-300"
          >
            <UploadCloud size={20} />
            <span className="font-medium text-sm">Restore Data</span>
          </button>
        </nav>

        <div className="flex flex-col gap-4 mt-auto">
          <div className="text-center opacity-50 hover:opacity-100 transition-opacity">
            <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">Developer: Weididev</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#F8F9FA] dark:bg-gray-900 w-full">
        <header className="h-20 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:block">
              <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
              <p className="text-xs text-gray-400">Manage your items and track stock efficiently.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-gray-600 dark:text-gray-400" />}
            </button>
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors relative"
            >
              <Bell size={18} className="text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsQuickActionOpen(true)}
              className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer transition-all shadow-lg"
            >
              <Plus size={20} />
            </button>
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 dark:text-white w-48 md:w-64 transition-all"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <Dashboard items={inventory.items} history={inventory.history} onNavigate={setActiveTab} />}
              {activeTab === 'inventory' && <InventoryList inventory={inventory} />}
              {activeTab === 'history' && <HistoryLogs history={inventory.history} />}
              {activeTab === 'analytics' && <AnalyticsDashboard items={inventory.items} history={inventory.history} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Notifications Drawer */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#F8F9FA] dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto border-l border-gray-200 dark:border-gray-800"
            >
              <div className="p-6 pt-16 relative">
                <button 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                <NotificationsPanel notifications={inventory.notifications} onMarkRead={inventory.markNotificationRead} onClear={inventory.clearNotifications} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        inventory={inventory}
      />
    </div>
  );
}
