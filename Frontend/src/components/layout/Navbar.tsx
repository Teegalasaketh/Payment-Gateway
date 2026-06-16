/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { UserRole } from "../../types";
import {
  Bell,
  Sun,
  Moon,
  Search,
  Menu,
  CheckCircle2,
  AlertTriangle,
  X,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

interface NavbarProps {
  onMenuToggle: () => void;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, setSearchQuery }) => {
  const {
    theme,
    toggleTheme,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    activeTab,
    setActiveTab,
    paymentsList,
    setSelectedPayment
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Simple Breadcrumbs calculator
  const tabTitles: Record<string, string> = {
    "admin-dashboard": "Operations Hub / Root Admin",
    "admin-users": "Merchants Ledger / Registry",
    "admin-payments": "Acquiring Gateway / Inflows",
    "admin-transactions": "Financial Journal / Ledger",
    "admin-fraud": "Risk Shield Matrix / Anomalies",
    "admin-webhooks": "Developer Dispatch / Webhooks",
    "admin-kafka": "Event Brokers / Apache Kafka",
    "admin-idempotency": "Handshake Integrity / Idempotence",
    "admin-audit": "Compliance Trails / Log Auditing",
    "admin-ai": "Co-pilot Intelligence / Reporting",
    "admin-settings": "Gateway Core Parameters",
    "user-dashboard": "Partner Terminal / Overview",
    "user-pay": "Virtual Sandbox Terminal",
    "user-transactions": "Store Activity Logs",
    "user-ai": "Gateway Copilot Intelligence",
    "user-notifications": "Security & Core Bulletins",
    "user-profile": "Developer API Configurations"
  };

  const currentBreadcrumb = tabTitles[activeTab] || "Operational Console";

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setLocalSearch(term);
    setSearchQuery(term);

    if (term.trim().length > 1) {
      const filtered = paymentsList
        .filter(
          (p) =>
            p.id.toLowerCase().includes(term.toLowerCase()) ||
            p.customerName.toLowerCase().includes(term.toLowerCase()) ||
            p.customerEmail.toLowerCase().includes(term.toLowerCase())
        )
        .slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (payment: any) => {
    setSelectedPayment(payment);
    // Route to details
    if (activeTab.startsWith("admin")) {
      setActiveTab("admin-payments");
    } else {
      setActiveTab("user-transactions");
    }
    setLocalSearch("");
    setSearchResults([]);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
      
      {/* Breadcrumb / Left Side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg lg:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase select-none">
          <span>CONSOLE</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
          <span className="text-purple-600 dark:text-purple-400 font-bold truncate max-w-[200px]">
            {currentBreadcrumb}
          </span>
        </div>
      </div>

      {/* Global Interactive Search Input */}
      <div className="relative w-full max-w-xs md:max-w-sm mx-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={handleSearchChange}
          placeholder="Lookup payments, names e.g. PAY-00001..."
          className="w-full pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-500/30 rounded-xl transition-all font-sans"
        />

        {/* Live Search Results Portal dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden text-xs max-h-60 overflow-y-auto">
            <div className="p-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 font-mono text-[9px] uppercase tracking-wider text-slate-400">
              Gateway Reference Lookup
            </div>
            {searchResults.map((p) => (
              <button
                key={p.id}
                onClick={() => handleResultClick(p)}
                className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center transition"
              >
                <div>
                  <div className="font-semibold text-slate-700 dark:text-slate-200 font-mono">{p.id}</div>
                  <div className="text-[10px] text-slate-400 italic font-sans max-w-[180px] truncate">
                    {p.customerName} ({p.customerEmail})
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    ${p.amount.toFixed(2)}
                  </div>
                  <span
                    className={`inline-block px-1.5 py-0.5 text-[9px] font-mono leading-none rounded mt-0.5 uppercase ${
                      p.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                        : p.status === "FAILED"
                        ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right control utilities */}
      <div className="flex items-center gap-3.5">
        
        {/* Compliance Guard Shield (Visual assurance) */}
        <div className="hidden md:flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold select-none leading-none">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PCI-DSS ENCRYPTED</span>
        </div>

        {/* Theme Dynamic Toggler */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 transition-all cursor-pointer"
          title={theme === "light" ? "Switch to Secure Dark Theme" : "Light Theme View Mode"}
        >
          {theme === "light" ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
        </button>

        {/* Notification bell and slide-down dropdown menu */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 transition-all cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-650"></span>
              </span>
            )}
          </button>

          {/* Core Notifications List Panel layout */}
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800/60">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Gateway Alerts Feed</span>
                    <span className="text-[10px] text-slate-400">{unreadCount} active warnings</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-[10px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-350"
                    >
                      Clear Inbox
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900/80">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 font-sans">
                      No matching system alerts recorded. Operations normal.
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isUnread = !notif.read;
                      return (
                        <div
                          key={notif.id}
                          className={`p-4 transition hover:bg-slate-50 dark:hover:bg-slate-900/20 text-xs ${
                            isUnread ? "bg-purple-50/20 dark:bg-purple-950/10" : ""
                          }`}
                        >
                          <div className="flex gap-2.5 items-start">
                            <span className="mt-0.5">
                              {notif.type === "success" && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                              {notif.type === "warning" && (
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                              )}
                              {notif.type === "error" && (
                                <X className="w-4 h-4 text-red-500 rounded-full border border-red-500 p-0.5" />
                              )}
                              {notif.type === "info" && (
                                <Info className="w-4 h-4 text-purple-500" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">
                                  {notif.title}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400 shrink-0">
                                  {new Date(notif.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-slate-500 dark:text-slate-400 mt-1 leading-normal break-words">
                                {notif.message}
                              </p>
                              {isUnread && (
                                <button
                                  onClick={() => markNotificationRead(notif.id)}
                                  className="mt-2 text-[10px] font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-350"
                                >
                                  Mark Read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/20 text-center border-t border-slate-100 dark:border-slate-900">
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      setActiveTab(activeTab.startsWith("admin") ? "admin-audit" : "user-notifications");
                    }}
                    className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 flex justify-center items-center gap-1 mx-auto"
                  >
                    <span>Inspect Security Journal Log</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
