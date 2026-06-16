/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { UserRole, UserStatus, PaymentStatus } from "../../types";
import {
  RevenueTrendChart,
  MonthlyTransactionsChart,
  PaymentMethodDistributionChart
} from "../../components/charts/CustomCharts";
import {
  Layers,
  Users,
  CreditCard,
  History,
  ShieldCheck,
  Webhook,
  Activity,
  KeyRound,
  FileCheck2,
  BrainCircuit,
  Search,
  Plus,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  Send,
  Eye,
  Settings,
  AlertTriangle,
  Play,
  FileDown,
  Lock,
  Globe,
  Database
} from "lucide-react";

export const AdminMainPages: React.FC = () => {
  const {
    activeTab,
    usersList,
    paymentsList,
    transactionsList,
    webhookList,
    idempotencyList,
    kafkaList,
    auditList,
    fraudList,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    addUser,
    triggerWebhookRetry,
    addToastNotif,
    setSelectedPayment,
    setActiveTab
  } = useApp();

  // Local Search & UI configurations
  const [userSearch, setUserSearch] = useState("");
  const [webhookSearch, setWebhookSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");
  
  // Create User Modal local states
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUName, setNewUName] = useState("");
  const [newUEmail, setNewUEmail] = useState("");
  const [newURole, setNewURole] = useState(UserRole.USER);
  const [newUCompany, setNewUCompany] = useState("");

  // Webhook detail viewer modal state
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  // Idempotency sandbox generator state
  const [idempSimKey, setIdempSimKey] = useState("idemp_k_gwp_sim_01");
  const [idempLogOutput, setIdempLogOutput] = useState<string[]>([]);
  const [idempLoading, setIdempLoading] = useState(false);

  // Pagination states
  const [usersPage, setUsersPage] = useState(0);
  const usersPerPage = 7;
  const [webhooksPage, setWebhooksPage] = useState(0);
  const webhooksPerPage = 10;
  const [auditsPage, setAuditsPage] = useState(0);
  const auditsPerPage = 10;

  // Render Submodule: Operations Dashboard
  const renderDashboard = () => {
    // Calculators
    const completedPayments = paymentsList.filter(p => p.status === PaymentStatus.COMPLETED);
    const failedPayments = paymentsList.filter(p => p.status === PaymentStatus.FAILED);
    const activeMerchants = usersList.filter(u => u.status === UserStatus.ACTIVE);
    const activeRiskAlerts = fraudList.filter(f => f.status === "FLAGGED" || f.status === "BLOCKED");

    const totalRevenue = completedPayments.reduce((acc, p) => acc + p.amount, 0);
    const successRateValue = paymentsList.length > 0 
      ? (completedPayments.length / paymentsList.length) * 100 
      : 100;

    const successfulWebdispatches = webhookList.filter(w => w.status === "SUCCESS").length;
    const webhookSuccessRate = webhookList.length > 0
      ? (successfulWebdispatches / webhookList.length) * 100
      : 100;

    const stats = [
      { id: "stat-1", label: "Gross Settled Revenue", val: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: "+14.2% week-on-week", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/20" },
      { id: "stat-2", label: "Registered Merchants", val: String(usersList.length), sub: `${activeMerchants.length} accounts verified online`, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
      { id: "stat-3", label: "Processing Handshakes", val: String(paymentsList.length), sub: "Within past 30 days active lifecycle", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/15" },
      { id: "stat-4", label: "Settlement Success Rate", val: `${successRateValue.toFixed(1)}%`, sub: `${failedPayments.length} declined capture exceptions`, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20" },
      { id: "stat-5", label: "Active Risk Alerts", val: String(activeRiskAlerts.length), sub: "Awaiting administrative review", color: "text-red-500", bg: "bg-rose-50 dark:bg-rose-950/20" },
      { id: "stat-6", label: "Failed Transactions", val: String(failedPayments.length), sub: "Re-routed or aborted orders", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
      { id: "stat-7", label: "Webhook Success Rate", val: `${webhookSuccessRate.toFixed(1)}%`, sub: `${webhookList.length} total event notifications`, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/20" },
      { id: "stat-8", label: "Active Nodes", val: "12 / 12 Service", sub: "Gcloud clusters running healthy", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/10" }
    ];

    const recentPayments = paymentsList.slice(0, 6);

    return (
      <div className="space-y-6">
        
        {/* Core Quick KPI Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((st) => (
            <div key={st.id} className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/45 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{st.label}</span>
                <div className={`text-xl font-bold font-mono tracking-tight mt-1.5 ${st.color}`}>
                  {st.val}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">{st.sub}</p>
            </div>
          ))}
        </div>

        {/* Analytical Custom SVG Charts visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueTrendChart payments={paymentsList} />
          <MonthlyTransactionsChart payments={paymentsList} />
          <div className="lg:col-span-2">
            <PaymentMethodDistributionChart payments={paymentsList} />
          </div>
        </div>

        {/* Dashboard Activity Stream list & recent event queue layouts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Recent Payments Quick Overview Widget */}
          <div className="xl:col-span-2 p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Terminal Inflows Feed</h3>
              <button
                onClick={() => setActiveTab("admin-payments")}
                className="text-xs text-purple-500 hover:text-purple-600 font-semibold"
              >
                Inspect Ledger
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="pb-3 font-semibold">Payment ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Method</th>
                    <th className="pb-3 font-semibold text-right">Settled Amount</th>
                    <th className="pb-3 font-semibold text-center">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  {recentPayments.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => { setSelectedPayment(p); setActiveTab("admin-payments"); }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 cursor-pointer transition"
                    >
                      <td className="py-3 font-mono font-bold text-purple-600 dark:text-purple-400">{p.id}</td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{p.customerName}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{p.customerEmail}</div>
                      </td>
                      <td className="py-3 capitalize text-slate-400">{p.method.replace('_', ' ').toLowerCase()}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                        ${p.amount.toFixed(2)}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-mono leading-none rounded uppercase ${
                          p.status === PaymentStatus.COMPLETED
                            ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-350"
                            : p.status === PaymentStatus.FAILED
                            ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-350"
                            : p.status === PaymentStatus.REFUNDED
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-350"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-350"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Real-Time Kafka Stream Activity Widget */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Kafka Broker Telemetry</h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal mb-4">
                Active partition buffers: <span className="font-mono text-emerald-500 font-semibold uppercase">Cluster healthy (Active)</span>. Live events feed tracking:
              </p>
              
              <div className="space-y-3 max-h-[190px] overflow-y-auto">
                {kafkaList.slice(0, 4).map((k) => (
                  <div key={k.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-350">{k.eventName}</span>
                      <span className={`px-1.5 py-0.5 text-[8px] font-mono leading-none rounded uppercase font-bold ${
                        k.status === "CONSUMED" ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300" : "bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300"
                      }`}>
                        {k.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[9px] font-mono text-slate-400">
                      <span>Topic: {k.topic}</span>
                      <span>{new Date(k.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveTab("admin-kafka")}
              className="w-full text-center text-xs text-purple-500 hover:text-purple-600 font-semibold mt-4 pt-4 border-t border-slate-100 dark:border-slate-800"
            >
              Analyze Event Raw Payload Logs
            </button>
          </div>

        </div>
      </div>
    );
  };


  // Render Submodule: User accounts Management Page
  const renderUsers = () => {
    // Search & Filter
    const filteredUsers = usersList.filter(u =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.company?.toLowerCase().includes(userSearch.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice(usersPage * usersPerPage, (usersPage + 1) * usersPerPage);

    const handleCreateUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUName || !newUEmail || !newUCompany) {
        addToastNotif("error", "Failed To Provision", "All partner registration details are mandatory.");
        return;
      }
      addUser(newUName, newUEmail, newURole, UserStatus.ACTIVE, newUCompany);
      setNewUName("");
      setNewUEmail("");
      setNewUCompany("");
      setShowAddUser(false);
    };

    return (
      <div className="space-y-6">
        
        {/* Search header & configuration controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative w-full max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); setUsersPage(0); }}
              placeholder="Search merchants, labels, or email credentials..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={() => setShowAddUser(true)}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs shadow cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Merchant</span>
          </button>
        </div>

        {/* Dynamic ADD USER modal overlay dialogue layout */}
        {showAddUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                <Users className="w-5 h-5 text-purple-600" />
                <span>Provision Merchant Account</span>
              </h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Contact Representative Name</label>
                  <input
                    type="text"
                    value={newUName}
                    onChange={(e) => setNewUName(e.target.value)}
                    placeholder="e.g. Liam Jenkins"
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-purple-500 focus:outline-none p-2 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Corporate Email</label>
                  <input
                    type="email"
                    value={newUEmail}
                    onChange={(e) => setNewUEmail(e.target.value)}
                    placeholder="e.g. liam@merchant.io"
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-purple-500 focus:outline-none p-2 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Registered Business Label</label>
                  <input
                    type="text"
                    value={newUCompany}
                    onChange={(e) => setNewUCompany(e.target.value)}
                    placeholder="e.g. Apex Trade & Logistics"
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-purple-500 focus:outline-none p-2 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-semibold text-slate-500 transition"
                  >
                    Abort Provision
                  </button>
                  <button
                    type="submit"
                    className="py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow transition"
                  >
                    Confirm Provision
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Desktop accounts tracking ledger table */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-150 dark:border-slate-800 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="p-4 font-semibold">User ID</th>
                  <th className="p-4 font-semibold">Account Label Details</th>
                  <th className="p-4 font-semibold">Allocated Role</th>
                  <th className="p-4 font-semibold">Registration date</th>
                  <th className="p-4 font-semibold text-center">API state</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedUsers.map((u) => {
                  const isActive = u.status === UserStatus.ACTIVE;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition">
                      <td className="p-4 font-mono font-bold text-slate-500">{u.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div>
                            <span className="block font-bold text-slate-800 dark:text-slate-200">{u.name}</span>
                            <span className="block text-[10px] text-slate-400">{u.email}</span>
                            {u.company && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400">
                                {u.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 font-mono text-[9px] rounded font-bold uppercase ${
                          u.role === UserRole.ADMIN ? "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300" : "bg-sky-100 text-sky-700 dark:bg-sky-950/20 dark:text-sky-300"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-slate-400">
                        {new Date(u.createdDate).toLocaleDateString("en-US", { year: '2-digit', month: '2-digit', day: '2-digit' })}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => updateUserStatus(u.id, isActive ? UserStatus.DEACTIVATED : UserStatus.ACTIVE)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-mono font-bold leading-none rounded-full border transition cursor-pointer select-none uppercase ${
                            isActive
                              ? "bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300"
                              : "bg-red-50 hover:bg-red-100 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900 dark:text-red-300"
                          }`}
                        >
                          {isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          <span>{u.status}</span>
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {u.id !== "USR-001" && ( // Protect primary Administrator sandbox record
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/15 text-slate-400 transition cursor-pointer"
                              title="Revoke Credentials permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table pagination utilities */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 bg-slate-50/60 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-mono">
              <span>Showing users {usersPage * usersPerPage + 1} - {Math.min((usersPage + 1) * usersPerPage, filteredUsers.length)} of {filteredUsers.length}</span>
              <div className="flex gap-1.5">
                <button
                  disabled={usersPage === 0}
                  onClick={() => setUsersPage(prev => prev - 1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 disabled:opacity-40 transition font-sans"
                >
                  Previous
                </button>
                <button
                  disabled={usersPage >= totalPages - 1}
                  onClick={() => setUsersPage(prev => prev + 1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 disabled:opacity-40 transition font-sans"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    );
  };


  // Render Submodule: Webhooks Monitor Center
  const renderWebhooks = () => {
    const filteredWebhooks = webhookList.filter(w =>
      w.endpoint.toLowerCase().includes(webhookSearch.toLowerCase()) ||
      w.event.toLowerCase().includes(webhookSearch.toLowerCase())
    );

    const totalPages = Math.ceil(filteredWebhooks.length / webhooksPerPage);
    const paginatedWebhooks = filteredWebhooks.slice(webhooksPage * webhooksPerPage, (webhooksPage + 1) * webhooksPerPage);

    const handleRetry = async (whId: string) => {
      addToastNotif("info", "Rescheduling Dispatch", `Initiating handshake on webhook key: ${whId}`);
      await triggerWebhookRetry(whId);
    };

    return (
      <div className="space-y-6">
        
        {/* Search header parameters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative w-full max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={webhookSearch}
              onChange={(e) => { setWebhookSearch(e.target.value); setWebhooksPage(0); }}
              placeholder="Search destination endpoints or dispatch events..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-850 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-400 leading-none">
            Total logs: {webhookList.length} transmissions
          </span>
        </div>

        {/* Detail Visualizer log drawer popup */}
        {selectedWebhook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center whitespace-nowrap">
                <div className="truncate pr-4">
                  <span className="font-mono text-xs font-bold text-purple-400">{selectedWebhook.id}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5 truncate">{selectedWebhook.endpoint}</span>
                </div>
                <button
                  onClick={() => setSelectedWebhook(null)}
                  className="p-1 rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-350"
                >
                  <RefreshCw className="w-5 h-5 transform rotate-45" />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                
                {/* Event payload code highlight */}
                <div className="space-y-1">
                  <span className="block font-mono text-[10px] text-slate-500 capitalize">JSON Dispatch Payload Body</span>
                  <pre className="p-3 bg-slate-900 border border-slate-850 rounded-xl overflow-x-auto text-[10px] font-mono text-emerald-450 leading-relaxed max-h-48 overflow-y-auto w-full">
                    <code>{selectedWebhook.payload}</code>
                  </pre>
                </div>

                {/* Handshake operational steps logging */}
                <div className="space-y-1.5">
                  <span className="block font-mono text-[10px] text-slate-500 capitalize">TLS Handshake Event Pipeline Trace</span>
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedWebhook.logs.map((log: string, idx: number) => (
                      <div key={idx} className="font-mono text-[9.5px] text-slate-300 leading-normal border-b border-slate-850 pb-1 last:border-0 last:pb-0">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="p-4 bg-slate-900/40 border-t border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWebhook(null)}
                  className="flex-1 py-2 border border-slate-800 hover:bg-slate-900 text-xs font-bold text-slate-400 rounded-xl transition cursor-pointer"
                >
                  Close logs
                </button>
                <button
                  type="button"
                  onClick={() => { handleRetry(selectedWebhook.id); setSelectedWebhook(null); }}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow flex justify-center items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Manual Retry (TLS Redispatch)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Webhook logs index ledger list */}
        <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-150 dark:border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-4 font-semibold">Transmission ID</th>
                  <th className="p-4 font-semibold">Event Code</th>
                  <th className="p-4 font-semibold">Merchant Destination Endpoint</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">HTTP Response</th>
                  <th className="p-4 font-semibold text-center">Attempts</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {paginatedWebhooks.map((w) => {
                  const isSuccess = w.status === "SUCCESS";
                  return (
                    <tr key={w.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition">
                      <td className="p-4 font-mono font-bold text-slate-500">{w.id}</td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{w.event}</span>
                      </td>
                      <td className="p-4 font-mono text-[10.5px] text-slate-400 truncate max-w-[200px]" title={w.endpoint}>
                        {w.endpoint}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-mono leading-none rounded-full font-bold uppercase ${
                          isSuccess
                            ? "bg-green-50 text-green-750 dark:bg-green-950/20 dark:text-green-300 border border-green-100 dark:border-green-900/30"
                            : "bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-300 border border-red-100 dark:border-red-900/30"
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono font-bold">
                        <span className={isSuccess ? "text-green-600 dark:text-green-400" : "text-red-500"}>
                          {w.responseCode}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono text-slate-500">{w.retries} / 3</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedWebhook(w)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-750 dark:hover:text-slate-300 transition cursor-pointer"
                            title="Inspect logs & metadata payload"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRetry(w.id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/20 text-slate-400 transition cursor-pointer"
                            title="Force dispatch recheck"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 bg-slate-50/60 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-mono">
              <span>Showing logs {webhooksPage * webhooksPerPage + 1} - {Math.min((webhooksPage + 1) * webhooksPerPage, filteredWebhooks.length)} of {filteredWebhooks.length}</span>
              <div className="flex gap-1.5">
                <button
                  disabled={webhooksPage === 0}
                  onClick={() => setWebhooksPage(prev => prev - 1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 disabled:opacity-40 transition font-sans"
                >
                  Previous
                </button>
                <button
                  disabled={webhooksPage >= totalPages - 1}
                  onClick={() => setWebhooksPage(prev => prev + 1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 disabled:opacity-40 transition font-sans"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    );
  };


  // Render Submodule: Kafka Brokers event list stream
  const renderKafka = () => {
    return (
      <div className="space-y-6">
        
        {/* Connection status card layout banner */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Apache Kafka Broker Infrastructure</span>
            </h3>
            <p className="text-[11px] text-slate-400 max-w-xl">
              Simulating standard enterprise events dispatch on topics: `payment-events` & `fraud-analysis`. Message delivery offsets committed directly inside zookeeper indexes automatically.
            </p>
          </div>
          <div className="flex gap-3 text-[10px] font-mono leading-none">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="block text-slate-500">CONSUMERS</span>
              <span className="block font-bold text-emerald-400 mt-1">3 ACTIVE</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="block text-slate-500">LAG LATENCY</span>
              <span className="block font-bold text-white mt-1">~0.42ms</span>
            </div>
          </div>
        </div>

        {/* Core stream payload split layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Stream timeline feed list */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <span className="block font-mono text-[10px] uppercase font-bold text-slate-400">Live topics broadcast feed</span>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {kafkaList.map((k) => (
                <div key={k.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 rounded-xl space-y-2 select-none hover:border-slate-350 dark:hover:border-slate-800 transition">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{k.eventName}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-mono leading-none rounded uppercase font-bold ${
                      k.status === "CONSUMED" ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300" : "bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300"
                    }`}>
                      {k.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono space-y-1">
                    <div className="flex justify-between">
                      <span>Broker segment:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{k.topic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subscriber consumer:</span>
                      <span className="font-semibold">{k.consumer}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono text-right pt-1.5 border-t border-slate-100 dark:border-slate-900">
                    {new Date(k.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive consumer detailed parser card */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span>Consumer Broker Inspection Details</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Select key brokers to inspect specific event dispatch parameters and serialized JSON metadata envelopes.
                </p>
              </div>

              <div className="space-y-2">
                <span className="block font-mono text-[10px] uppercase font-semibold text-slate-400">Seeded Client Topic Envelopes (Example Payload Payload Parser)</span>
                <pre className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-[10px] font-mono text-emerald-400 leading-relaxed overflow-x-auto max-h-[50vh] overflow-y-auto">
<code>{JSON.stringify({
  cluster_name: "prod-clearing",
  network_handshake_route: "gwp-kafka-broker-01.c.clearing-vpc.internal:9092",
  serializer: "org.apache.kafka.common.serialization.StringSerializer",
  compression_algorithm: "snappy",
  retries_config: 2147483647,
  acks_setting: "all",
}, null, 2)}</code>
                </pre>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-150 dark:border-slate-800 text-[11px] font-mono text-slate-400 leading-tight">
              Kafka brokers synchronize live events asynchronously. When you process a checkout on the <span className="font-semibold text-purple-500 cursor-pointer" onClick={() => setActiveTab("user-pay")}>Virtual Terminal</span>, this stream instantly produces a new payload!
            </div>
          </div>

        </div>
      </div>
    );
  };


  // Render Submodule: Idempotency matrix deduplication controller
  const renderIdempotency = () => {
    // Handler to run a mock duplicate submit simulation
    const simulateIdempotency = async () => {
      if (!idempSimKey.trim()) return;
      setIdempLoading(true);
      const timeStr = new Date().toLocaleTimeString();
      
      const logs = [`[${timeStr}] [INFO] Post request initialized with Key: \`${idempSimKey}\``];
      setIdempLogOutput(logs);

      // Pass 1: API handshakes, finds no record
      await new Promise(r => setTimeout(r, 600));
      logs.push(`[${timeStr}] [INFO] Checking redis key cache repository...`);
      logs.push(`[${timeStr}] [WARNING] Key \`${idempSimKey}\` NOT found. This is a fresh original payout intent.`);
      logs.push(`[${timeStr}] [INFO] Processing transaction...`);
      setIdempLogOutput([...logs]);

      // Pass 2: Clearing succeeds, records key
      await new Promise(r => setTimeout(r, 700));
      logs.push(`[${timeStr}] [SUCCESS] captured $250.00. Writing locking coordinate offset...`);
      logs.push(`[${timeStr}] [SUCCESS] Key written to repository. Lock expiration set to 24 Hours.`);
      setIdempLogOutput([...logs]);

      // Pass 3: Simultaneously, duplicate is triggered!
      await new Promise(r => setTimeout(r, 800));
      logs.push(`[${timeStr}] [SIMULATED DUPLICATE] Re-submitting identical payload with identical key \`${idempSimKey}\``);
      logs.push(`[${timeStr}] [INFO] Checking redis key cache repository...`);
      logs.push(`[${timeStr}] [FATAL] DEDUPLICATION TRIGGERED: Key \`${idempSimKey}\` ALREADY RESOLVED.`);
      logs.push(`[${timeStr}] [FATAL] Blocking secondary gateway execution. Returning cached success envelope.`);
      logs.push(`[${timeStr}] [SUCCESS] Duplicate request rejected safely with no double charging. Returning original payload response.`);
      
      setIdempLogOutput([...logs]);
      setIdempLoading(false);
      addToastNotif("success", "Deduplication Succeeded", "Idempotency key blocked potential double capture safely.");
    };

    return (
      <div className="space-y-6">
        
        {/* Interactive duplicate request simulator sandbox card */}
        <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-150 dark:border-slate-800 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Simulator control form */}
          <div className="space-y-4 lg:col-span-1">
            <div className="space-y-1">
              <span className="block font-mono text-[10px] uppercase font-bold text-purple-500">Idempotency Sandbox</span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Replay Attack Shield</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Avoid merchant API double billing. Trigger duplicate payout handshakes using an identical key token to test system defenses.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 block">Idempotence key simulation token</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={idempSimKey}
                  onChange={(e) => setIdempSimKey(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 p-2 text-xs rounded-xl flex-1 text-slate-700 dark:text-slate-200 font-mono focus:outline-none"
                />
                <button
                  onClick={simulateIdempotency}
                  disabled={idempLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-xl transition shadow disabled:opacity-40 flex items-center justify-center cursor-pointer"
                  title="Fire simulated request replay"
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-sans leading-tight">
              Our Spring Boot backend verifies client idempotency payloads in Redis caches first before routing capture parameters to clearing institutions.
            </p>
          </div>

          {/* Interactive simulator real-time logs terminal */}
          <div className="lg:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-850 flex flex-col justify-between h-64">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Lock telemetry output terminal</span>
              <button
                onClick={() => setIdempLogOutput([])}
                className="text-[9px] font-mono uppercase text-slate-400 hover:text-white"
              >
                Clear terminal
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[9.5px] leading-relaxed pr-1 text-slate-350">
              {idempLogOutput.length === 0 ? (
                <div className="text-slate-500 italic h-full flex items-center justify-center">
                  Awaiting sandbox replay initiation execution...
                </div>
              ) : (
                idempLogOutput.map((l, index) => {
                  let colorClass = "text-slate-300";
                  if (l.includes("[SUCCESS]")) colorClass = "text-emerald-400";
                  if (l.includes("[FATAL]")) colorClass = "text-red-400 font-bold";
                  if (l.includes("[WARNING]")) colorClass = "text-amber-400";
                  if (l.includes("[SIMULATED DUPLICATE]")) colorClass = "text-purple-400 font-bold";

                  return <div key={index} className={colorClass}>{l}</div>;
                })
              )}
            </div>
          </div>

        </div>

        {/* Existing Idempotency active locks records ledger table */}
        <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-150 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200">
            Active Token Caches (Spring Boot Redis memory registry)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/20 dark:bg-slate-900/10 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-4 font-semibold">Idempotency Key Parameter</th>
                  <th className="p-4 font-semibold">Request Body Hash (sha256)</th>
                  <th className="p-4 font-semibold">Target Route</th>
                  <th className="p-4 font-semibold">Cache Written At</th>
                  <th className="p-4 font-semibold text-right">Lock state</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105 dark:divide-slate-800/60 font-mono">
                {idempotencyList.map((idemp) => {
                  const isResolved = idemp.status === "RESOLVED";
                  return (
                    <tr key={idemp.key} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition text-[11px]">
                      <td className="p-4 font-bold text-slate-500 truncate max-w-[150px]" title={idemp.key}>{idemp.key}</td>
                      <td className="p-4 text-slate-400">{idemp.requestHash.substring(0, 20)}...</td>
                      <td className="p-4 text-slate-700 dark:text-slate-350 font-sans">{idemp.endpoint}</td>
                      <td className="p-4 text-slate-400">
                        {new Date(idemp.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-block px-2 py-0.5 text-[8.5px] leading-none rounded-full font-bold uppercase ${
                          isResolved
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300"
                            : idemp.status === "LOCKED"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/10 dark:text-amber-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {idemp.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  };


  // Render Submodule: Compliance Audit Logs Page
  const renderAudit = () => {
    const filteredAudits = auditList.filter(a =>
      a.userEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.module.toLowerCase().includes(auditSearch.toLowerCase())
    );

    const totalPages = Math.ceil(filteredAudits.length / auditsPerPage);
    const paginatedAudits = filteredAudits.slice(auditsPage * auditsPerPage, (auditsPage + 1) * auditsPerPage);

    return (
      <div className="space-y-6">
        
        {/* Search header with csv exporter button */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative w-full max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => { setAuditSearch(e.target.value); setAuditsPage(0); }}
              placeholder="Search by action codes, modules, or login email..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <button
            onClick={() => addToastNotif("success", "Compliance CSV Generated", "Authorized sandbox CSV format downloaded.")}
            className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-250 dark:border-slate-700 text-xs shadow hover:bg-slate-200 cursor-pointer transition"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span>Export CSV Audit log</span>
          </button>
        </div>

        {/* Audit timeline table */}
        <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-150 dark:border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-4 font-semibold">Audit ID</th>
                  <th className="p-4 font-semibold">Action Commitment</th>
                  <th className="p-4 font-semibold">Compliance Module</th>
                  <th className="p-4 font-semibold">Authorized session email</th>
                  <th className="p-4 font-semibold">IP Origin</th>
                  <th className="p-4 font-semibold text-right">Commit Date/Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {paginatedAudits.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition">
                    <td className="p-4 font-mono font-bold text-slate-500">{a.id}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-150">{a.action}</td>
                    <td className="p-4 font-mono text-[10.5px]">
                      <span className="bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-bold uppercase text-[9px]">
                        {a.module}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 truncate max-w-[150px]">{a.userEmail}</td>
                    <td className="p-4 font-mono text-[10px] text-slate-400">{a.ipAddress}</td>
                    <td className="p-4 text-right font-mono text-[10.5px] text-slate-400">
                      {new Date(a.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 bg-slate-50/60 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-mono">
              <span>Showing elements {auditsPage * auditsPerPage + 1} - {Math.min((auditsPage + 1) * auditsPerPage, filteredAudits.length)} of {filteredAudits.length}</span>
              <div className="flex gap-1.5">
                <button
                  disabled={auditsPage === 0}
                  onClick={() => setAuditsPage(prev => prev - 1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 disabled:opacity-40 transition font-sans"
                >
                  Previous
                </button>
                <button
                  disabled={auditsPage >= totalPages - 1}
                  onClick={() => setAuditsPage(prev => prev + 1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 disabled:opacity-40 transition font-sans"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    );
  };


  // Render Submodule: System settings page layout
  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 shadow-sm space-y-4 text-xs font-sans">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-500" />
              <span>PCI-DSS Firewall Matrix Settings</span>
            </h3>
            
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="rounded text-purple-600 focus:ring-0 bg-slate-100 border-slate-300" />
                <div>
                  <span className="block font-semibold text-slate-700 dark:text-slate-300 text-xs">Simultaneous IP Velocity Firewalls</span>
                  <p className="text-[10px] text-slate-400">Enable automatic carding limits: block IPs attempting 10 checkout checkouts in 3 minutes.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="rounded text-purple-600 focus:ring-0 bg-slate-100 border-slate-300" />
                <div>
                  <span className="block font-semibold text-slate-700 dark:text-slate-300 text-xs">AI Risk score automatic reject</span>
                  <p className="text-[10px] text-slate-400">Abort payment intents with a classifier risk score exceeding 95/100 parameters immediately.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" className="rounded text-purple-600 focus:ring-0 bg-slate-100 border-slate-300" />
                <div>
                  <span className="block font-semibold text-slate-700 dark:text-slate-300 text-xs">MTO OTP Verification bypass</span>
                  <p className="text-[10px] text-slate-400">Disable 3D secure pin coordinates for checkouts under $10 (Not recommended / Developer testing).</p>
                </div>
              </label>
            </div>
            
            <button
              onClick={() => addToastNotif("success", "Compliance rules saved", "Gateway secure operational guidelines synced successfully.")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl transition shadow text-xs mt-4 cursor-pointer text-center block"
            >
              Update secure guidelines matrix
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 shadow-sm space-y-4 text-xs font-sans">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-purple-500" />
              <span>Standalone Backup & Logs Purge</span>
            </h3>

            <div className="space-y-4 text-xs">
              <p className="text-[11px] text-slate-500 leading-normal">
                Administrative database backups and redis caching caches are retained inside Google VPC buckets. You can trigger simulated manual backups below:
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addToastNotif("success", "System Backup Synced", "PCI logs committed to standby storage.")}
                  className="flex-1 py-2 border border-slate-250 dark:border-slate-700 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-200 rounded-xl transition text-center text-xs font-semibold"
                >
                  Backup Database
                </button>
                <button
                  type="button"
                  onClick={() => addToastNotif("warning", "Cache Purged", "Transient Redis cache tables flushed.")}
                  className="flex-1 py-2 text-rose-500 border border-rose-200 hover:bg-rose-50 dark:border-rose-950/20 dark:hover:bg-rose-955/15 rounded-xl transition text-center text-xs font-semibold"
                >
                  Flush Cache
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {activeTab === "admin-dashboard" && renderDashboard()}
      {activeTab === "admin-users" && renderUsers()}
      {activeTab === "admin-webhooks" && renderWebhooks()}
      {activeTab === "admin-kafka" && renderKafka()}
      {activeTab === "admin-idempotency" && renderIdempotency()}
      {activeTab === "admin-audit" && renderAudit()}
      {activeTab === "admin-settings" && renderSettings()}
    </div>
  );
};
