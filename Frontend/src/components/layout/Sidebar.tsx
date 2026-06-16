/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useApp } from "../../context/AppContext";
import { UserRole, UserStatus } from "../../types";
import {
  Layers,
  LayoutDashboard,
  Users,
  CreditCard,
  History,
  ShieldAlert,
  Webhook,
  Activity,
  KeyRound,
  FileCheck2,
  BrainCircuit,
  Settings,
  Coins,
  LogOut,
  Bell,
  Menu,
  X,
  Sparkles,
  ToggleLeft
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { authRole, activeTab, setActiveTab, logout, currentUser } = useApp();

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false); // Close mobile sidebar automatically
  };

  const adminMenu = [
    { id: "admin-dashboard", label: "Operations Dashboard", icon: LayoutDashboard },
    { id: "admin-users", label: "Merchant Accounts", icon: Users },
    { id: "admin-payments", label: "Inward Payments", icon: CreditCard },
    { id: "admin-transactions", label: "Ledger Transactions", icon: History },
    { id: "admin-fraud", label: "Risk Shield Matrix", icon: ShieldAlert },
    { id: "admin-webhooks", label: "Webhook Logs", icon: Webhook },
    { id: "admin-kafka", label: "Kafka Broker Stream", icon: Activity },
    { id: "admin-idempotency", label: "Idempotence Registry", icon: KeyRound },
    { id: "admin-audit", label: "Compliance Audit Logs", icon: FileCheck2 },
    { id: "admin-ai", label: "AI Analytical Insights", icon: BrainCircuit },
    { id: "admin-settings", label: "Gateway Parameters", icon: Settings },
  ];

  const userMenu = [
    { id: "user-dashboard", label: "Merchant Dashboard", icon: LayoutDashboard },
    { id: "user-pay", label: "Virtual Merchant Terminal", icon: Coins },
    { id: "user-transactions", label: "Transaction Archives", icon: History },
    { id: "user-ai", label: "AI Gateway Copilot", icon: BrainCircuit },
    { id: "user-notifications", label: "Operational Alerts", icon: Bell },
    { id: "user-profile", label: "Developer Keys & Profile", icon: Settings },
  ];

  const menuItems = authRole === UserRole.ADMIN ? adminMenu : userMenu;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 h-screen bg-slate-50 dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Upper Brand Section */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-600 shadow-lg shadow-purple-500/20 text-white font-bold text-lg select-none">
              <Layers className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-sans font-bold tracking-tight text-slate-800 dark:text-slate-100 block text-sm">
                Apogee Clearing
              </span>
              <span className="font-mono text-[9px] text-purple-600 dark:text-purple-400 tracking-wider uppercase font-semibold">
                Core Gateway
              </span>
            </div>
          </div>
          <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge Overview */}
        <div className="px-5 py-4 border-b border-slate-200/40 dark:border-slate-800/40 bg-slate-100/40 dark:bg-slate-900/10">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
              alt="avatar"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-800 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-snug">
                {currentUser?.name || "System Operative"}
              </span>
              <span className="font-mono text-[10px] text-slate-400 truncate block mt-0.5">
                {currentUser?.company || "Merchant Admin"}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-md font-mono font-medium">
            <span>ROLE ACCESS:</span>
            <span className="uppercase text-purple-600 dark:text-purple-400 font-bold">{authRole}</span>
          </div>
        </div>

        {/* Scrolling Menu Block */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl transition-all duration-150 group ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/10 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600"}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Lower Sandbox Swap Controller (Satisfies role switching tests easily) */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-semibold leading-none">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sandbox Helper</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Rapidly toggle simulated roles to review respective view restrictions:
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  window.localStorage.setItem("gwp_user", JSON.stringify({
                    id: "USR-001",
                    name: "Saketh (Sandbox Admin)",
                    email: "sakethteegala@gmail.com",
                    role: UserRole.ADMIN,
                    status: UserStatus.ACTIVE,
                    company: "Cloud Gateway Prime"
                  }));
                  window.location.reload();
                }}
                className={`flex-1 text-[10px] font-semibold py-1 rounded text-center border transition-all ${
                  authRole === UserRole.ADMIN
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-500"
                }`}
              >
                ADMIN
              </button>
              <button
                onClick={() => {
                  window.localStorage.setItem("gwp_user", JSON.stringify({
                    id: "USR-003",
                    name: "John Merchant (Sandbox User)",
                    email: "john.m@merchant.io",
                    role: UserRole.USER,
                    status: UserStatus.ACTIVE,
                    company: "Zeta Gaming Group Ltd."
                  }));
                  window.location.reload();
                }}
                className={`flex-1 text-[10px] font-semibold py-1 rounded text-center border transition-all ${
                  authRole === UserRole.USER
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-500"
                }`}
              >
                USER
              </button>
            </div>
          </div>
        </div>

        {/* Footer Logout Action */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-100/20 dark:bg-slate-900/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all duration-150"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
            <span>End Security Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
