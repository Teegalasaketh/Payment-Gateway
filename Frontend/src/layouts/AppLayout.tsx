/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useApp } from "../context/AppContext";
import { Sidebar } from "../components/layout/Sidebar";
import { Navbar } from "../components/layout/Navbar";
import { AdminMainPages } from "../pages/admin/AdminMainPages";
import { AdminTransactionPages } from "../pages/admin/AdminTransactionPages";
import { AdminAiInsightsTab } from "../pages/admin/AdminAiInsightsTab";
import { UserMainPages } from "../pages/user/UserMainPages";
import { AuthPages } from "../pages/auth/AuthPages";
import {
  AlertTriangle,
  XCircle,
  CheckCircle,
  Info,
  Layers,
  Sparkles,
  Search,
  BellRing
} from "lucide-react";

export const AppLayout: React.FC = () => {
  const {
    activeTab,
    authRole,
    currentUser,
    toasts,
    removeToastNotif,
    theme,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useApp();

  // Route/Tab switcher mapping
  const renderTabContent = () => {
    switch (activeTab) {
      // ADMIN Pages mapping
      case "admin-dashboard":
      case "admin-users":
      case "admin-webhooks":
      case "admin-kafka":
      case "admin-idempotency":
      case "admin-audit":
      case "admin-settings":
        return <AdminMainPages />;
      case "admin-payments":
      case "admin-transactions":
      case "admin-fraud":
        return <AdminTransactionPages />;
      case "admin-ai":
        return <AdminAiInsightsTab />;

      // USER Pages mapping
      case "user-dashboard":
      case "user-pay":
      case "user-transactions":
      case "user-profile":
      case "user-notifications":
        return <UserMainPages />;

      default:
        return (
          <div className="py-24 text-center font-mono text-xs">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-pulse" />
            <span className="block font-bold">404: RESOURCE ENDPOINT NOT FOUND</span>
            <p className="text-slate-400 mt-1 max-w-sm mx-auto">The requested tab context could not be located inside our dynamic state controller routing registry map.</p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen font-sans antialiased text-slate-800 dark:text-slate-100 flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-250`}>
      
      {/* 1. Left Responsive Sidebar Navigation Rail */}
      <Sidebar />

      {/* 2. Main Page Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* 3. Global Header control Navbar */}
        <Navbar />

        {/* 4. Page layout viewport slot with animations */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-7xl w-full mx-auto pb-24">
          <div className="animate-fade-in duration-200">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* 5. Direct global stackable toast elements container block overlay */}
      <div className="fixed bottom-5 right-5 z-55 space-y-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          let icon = <Info className="w-5 h-5 text-purple-500" />;
          let accentBorder = "border-purple-500";
          
          if (toast.type === "success") {
            icon = <CheckCircle className="w-5 h-5 text-emerald-500" />;
            accentBorder = "border-emerald-500";
          } else if (toast.type === "error") {
            icon = <XCircle className="w-5 h-5 text-red-500" />;
            accentBorder = "border-red-500";
          } else if (toast.type === "warning") {
            icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
            accentBorder = "border-amber-500";
          }

          return (
            <div
              key={toast.id}
              className={`p-4 bg-white dark:bg-slate-900 border-l-4 ${accentBorder} shadow-2xl rounded-xl flex items-start gap-3.5 pointer-events-auto transition duration-300 transform translate-y-0 scale-100 animate-in slide-in-from-bottom duration-250`}
            >
              <div className="shrink-0">{icon}</div>
              <div className="flex-1 min-w-0 pr-1.5 text-xs">
                <span className="block font-bold text-slate-800 dark:text-slate-250 truncate leading-none mb-1">{toast.title}</span>
                <p className="text-slate-405 leading-normal">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToastNotif(toast.id)}
                className="shrink-0 font-mono text-[10.5px] font-bold text-slate-400 hover:text-slate-705 p-1"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
