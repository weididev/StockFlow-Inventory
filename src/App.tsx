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
  Plus,
  Share2,
  Download,
  Copy
} from 'lucide-react';
import { useInventory } from './hooks/useInventory';
import { cn } from './lib/utils';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';
import { HistoryLogs } from './components/HistoryLogs';
import { NotificationsPanel } from './components/NotificationsPanel';
import { QuickActionModal } from './components/QuickActionModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { Modal } from './components/Modal';

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
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDataString, setExportDataString] = useState('');
  
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

  const exportBackup = () => {
    const backupData = {
      inventory: inventory.items,
      history: inventory.history,
      notifications: inventory.notifications,
      exportedAt: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(backupData, null, 2);
    setExportDataString(jsonString);
    setIsExportModalOpen(true);
  };

  const processImportData = (data: any) => {
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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        processImportData(data);
      } catch (err) {
        alert("Could not process the backup file. Please ensure it is a valid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    try {
      if (!restoreText.trim()) {
        alert("Please paste the backup text first.");
        return;
      }
      const data = JSON.parse(restoreText);
      processImportData(data);
    } catch (err) {
      alert("Invalid backup data. Please make sure you copied the entire text correctly.");
    }
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
            onClick={() => setIsRestoreModalOpen(true)}
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

      {/* Restore Data Modal */}
      <Modal isOpen={isRestoreModalOpen} onClose={() => setIsRestoreModalOpen(false)} title="Restore Backup Data">
        <div className="flex flex-col gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm">
            You can restore your data either by choosing a backup file, or by directly pasting the backup text you saved (if your device doesn't support file saving).
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">1. Upload File</label>
            <input 
              type="file" 
              accept=".json,.txt"
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white dark:file:bg-white dark:file:text-black hover:file:opacity-90 transition-opacity file:cursor-pointer p-0"
              onChange={handleFileUpload}
            />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 dark:border-gray-800 absolute w-full"></div>
            <span className="bg-white dark:bg-gray-950 px-3 z-10 text-xs text-gray-400 uppercase font-bold tracking-widest">Or Paste Text</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">2. Paste Backup Text</label>
            <textarea
              className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:text-white font-mono resize-none"
              placeholder='Paste the full JSON text here starting with { ... }'
              value={restoreText}
              onChange={(e) => setRestoreText(e.target.value)}
            />
            <button
              onClick={handlePasteImport}
              className="px-6 py-3 mt-2 bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-95 transition-all shadow-md font-bold rounded-xl"
            >
              Restore from Text
            </button>
          </div>
        </div>
      </Modal>

      {/* Export Data Modal */}
      <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="Export Backup Data">
        <div className="flex flex-col gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-xl text-sm">
            Your backup data is ready! Choose how you want to export and save it.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={async () => {
                 const fileName = `stockflow-db-${new Date().toISOString().slice(0,10)}.json`;
                 if (navigator.share) {
                   try {
                     const file = new File([exportDataString], fileName, { type: 'text/plain' });
                     if (navigator.canShare && navigator.canShare({ files: [file] })) {
                       await navigator.share({
                         files: [file],
                         title: 'StockFlow Backup',
                       });
                       return;
                     }
                   } catch (e: any) {
                     if (e.name === 'AbortError' || String(e).includes('canceled')) return;
                   }

                   // Fallback to text share
                   try {
                     await navigator.share({
                       title: 'StockFlow Backup Data',
                       text: exportDataString
                     });
                   } catch(err2: any) {
                     if (err2.name === 'AbortError' || String(err2).includes('canceled')) return;
                     alert("Your device doesn't support direct app sharing. Please use 'Copy Text' instead.");
                   }
                 } else {
                   alert("Sharing is not supported on this browser.");
                 }
              }}
              className="flex items-center justify-center gap-3 px-4 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-md border border-transparent"
            >
              <Share2 size={20} />
              Share Details
            </button>

            <button 
              onClick={() => {
                const fileName = `stockflow-db-${new Date().toISOString().slice(0,10)}.json`;
                try {
                  const blob = new Blob([exportDataString], { type: 'application/json' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.style.display = 'none';
                  a.href = url;
                  a.download = fileName;
                  document.body.appendChild(a);
                  a.click();
                  setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  }, 100);
                } catch(e) {
                  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(exportDataString)}`;
                  const a = document.createElement('a');
                  a.style.display = 'none';
                  a.href = dataUri;
                  a.download = fileName;
                  document.body.appendChild(a);
                  a.click();
                  setTimeout(() => document.body.removeChild(a), 100);
                }
              }}
              className="flex items-center justify-center gap-3 px-4 py-4 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95"
            >
              <Download size={20} />
              Save to Device
            </button>
          </div>

          <div className="relative flex items-center justify-center mt-2">
            <div className="border-t border-gray-200 dark:border-gray-800 absolute w-full"></div>
            <span className="bg-white dark:bg-gray-950 px-3 z-10 text-xs text-gray-400 uppercase font-bold tracking-widest">Manual Backup</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Copy Backup Text</label>
            <p className="text-xs text-gray-500 mb-2 leading-relaxed">If Share or Download fails on this device, manually copy this raw text and save it to a safe place (like a Note app).</p>
            <div className="relative">
              <textarea
                readOnly
                className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none dark:text-white font-mono resize-none text-[10px]"
                value={exportDataString}
              />
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(exportDataString)
                  .then(() => alert("Copy Success! Default text copied to clipboard. Paste and save it securely!"))
                  .catch(() => alert("Clipboard write failed! Please select the text above, long press and choose 'Copy'."));
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 mt-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white transition-all font-bold rounded-xl"
            >
              <Copy size={18} />
              Copy Raw Text
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
