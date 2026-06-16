/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { PaymentStatus, PaymentMethod, TransactionStatus, TransactionType, FraudRiskStatus } from "../../types";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  FileDown,
  ShieldCheck,
  Flag,
  UserX,
  UserCheck,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react";

export const AdminTransactionPages: React.FC = () => {
  const {
    activeTab,
    paymentsList,
    transactionsList,
    fraudList,
    refundPayment,
    retryFailedPayment,
    updateFraudStatus,
    addToastNotif,
    selectedPayment,
    setSelectedPayment,
    setActiveTab
  } = useApp();

  // Search & Filters state
  const [paySearch, setPaySearch] = useState("");
  const [payStatusFilter, setPayStatusFilter] = useState<string>("ALL");
  const [txnSearch, setTxnSearch] = useState("");
  const [txnTypeFilter, setTxnTypeFilter] = useState<string>("ALL");
  const [fraudSearch, setFraudSearch] = useState("");
  const [fraudStatusFilter, setFraudStatusFilter] = useState<string>("ALL");

  // Pagination
  const [payPage, setPayPage] = useState(0);
  const payPerPage = 10;
  const [txnPage, setTxnPage] = useState(0);
  const txnPerPage = 10;

  // Selected details modal trigger
  const [viewPayDetails, setViewPayDetails] = useState<any>(null);

  const handleRefundClick = async (pId: string) => {
    addToastNotif("info", "Processing Reversal", `Sending transaction return clearance reference: ${pId}`);
    const ok = await refundPayment(pId);
    if (ok) {
      setViewPayDetails(null);
    }
  };

  const handleRetryClick = async (pId: string) => {
    addToastNotif("info", "Retrying Inflow", `Injecting payment retry parameters into routing queue: ${pId}`);
    const ok = await retryFailedPayment(pId);
    if (ok) {
      setViewPayDetails(null);
    }
  };


  // Render Submodule: Payment Management Console
  const renderPayments = () => {
    // Filter
    const filteredPayments = paymentsList.filter(p => {
      const matchSearch = p.id.toLowerCase().includes(paySearch.toLowerCase()) ||
        p.customerName.toLowerCase().includes(paySearch.toLowerCase()) ||
        p.customerEmail.toLowerCase().includes(paySearch.toLowerCase());
      
      const matchStatus = payStatusFilter === "ALL" || p.status === payStatusFilter;
      return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filteredPayments.length / payPerPage);
    const paginatedPayments = filteredPayments.slice(payPage * payPerPage, (payPage + 1) * payPerPage);

    return (
      <div className="space-y-6">
        
        {/* Dynamic header filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pr-3 pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={paySearch}
              onChange={(e) => { setPaySearch(e.target.value); setPayPage(0); }}
              placeholder="Search payments, emails, customer name..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2.5">
            <select
              value={payStatusFilter}
              onChange={(e) => { setPayStatusFilter(e.target.value); setPayPage(0); }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">Status: All Inflows</option>
              <option value={PaymentStatus.COMPLETED}>Status: Completed</option>
              <option value={PaymentStatus.FAILED}>Status: Failed</option>
              <option value={PaymentStatus.PROCESSING}>Status: Processing</option>
              <option value={PaymentStatus.REFUNDED}>Status: Refunded</option>
            </select>

            <button
              onClick={() => addToastNotif("success", "Ledger Logs Ready", "Authorized Inward Payout report generated.")}
              className="bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-250 dark:border-slate-700 rounded-xl text-xs hover:bg-slate-200 transition cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Existing payment ledger timeline list table layout */}
        <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-150 dark:border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-4 font-semibold">Payment ID</th>
                  <th className="p-4 font-semibold">Registered Customer</th>
                  <th className="p-4 font-semibold">Processor Terminal</th>
                  <th className="p-4 font-semibold text-center">Security Risk</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right">Settlement Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {paginatedPayments.map((p) => {
                  const riskColor = p.riskScore > 80 ? "text-red-500" : p.riskScore > 50 ? "text-amber-500" : "text-emerald-500";
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setViewPayDetails(p)}
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 cursor-pointer transition"
                    >
                      <td className="p-4 font-mono font-bold text-purple-600 dark:text-purple-400">{p.id}</td>
                      <td className="p-4">
                        <span className="block font-bold text-slate-800 dark:text-slate-200">{p.customerName}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{p.customerEmail}</span>
                      </td>
                      <td className="p-4 text-slate-500 font-medium capitalize">
                        {p.method.replace('_', ' ').toLowerCase()}
                      </td>
                      <td className="p-4 text-center font-mono font-bold">
                        <span className={riskColor}>{p.riskScore}/100</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-mono leading-none rounded uppercase ${
                          p.status === PaymentStatus.COMPLETED
                            ? "bg-green-150 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                            : p.status === PaymentStatus.FAILED
                            ? "bg-red-150 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                            : p.status === PaymentStatus.REFUNDED
                            ? "bg-purple-150 text-purple-700 dark:bg-purple-950/30 dark:text-purple-350"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-800 dark:text-slate-150">
                        ${p.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 bg-slate-50/60 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-mono">
              <span>Showing inflows {payPage * payPerPage + 1} - {Math.min((payPage + 1) * payPerPage, filteredPayments.length)} of {filteredPayments.length}</span>
              <div className="flex gap-1.5">
                <button
                  disabled={payPage === 0}
                  onClick={() => setPayPage(prev => prev - 1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 disabled:opacity-40 transition font-sans"
                >
                  Previous
                </button>
                <button
                  disabled={payPage >= totalPages - 1}
                  onClick={() => setPayPage(prev => prev + 1)}
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


  // Render Submodule: Ledgers & Journal Transactions Tracking
  const renderTransactions = () => {
    const filteredTxns = transactionsList.filter(t => {
      const matchSearch = t.id.toLowerCase().includes(txnSearch.toLowerCase()) ||
        t.paymentId.toLowerCase().includes(txnSearch.toLowerCase()) ||
        t.referenceNumber.toLowerCase().includes(txnSearch.toLowerCase());
      
      const matchType = txnTypeFilter === "ALL" || t.type === txnTypeFilter;
      return matchType && matchSearch;
    });

    const totalPages = Math.ceil(filteredTxns.length / txnPerPage);
    const paginatedTxns = filteredTxns.slice(txnPage * txnPerPage, (txnPage + 1) * txnPerPage);

    return (
      <div className="space-y-6">
        
        {/* Simple filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={txnSearch}
              onChange={(e) => { setTxnSearch(e.target.value); setTxnPage(0); }}
              placeholder="Search reference, transaction ID, payment..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
            />
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2">
            <select
              value={txnTypeFilter}
              onChange={(e) => { setTxnTypeFilter(e.target.value); setTxnPage(0); }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs px-3 py-2 rounded-xl focus:outline-none"
            >
              <option value="ALL">Journal: All Types</option>
              <option value={TransactionType.PAYMENT}>Type: Payment</option>
              <option value={TransactionType.REFUND}>Type: Refund</option>
              <option value={TransactionType.CHARGEBACK}>Type: Chargeback</option>
            </select>
            <span className="text-xs text-slate-400 font-mono font-semibold hidden md:inline">Ledger index size: {transactionsList.length}</span>
          </div>
        </div>

        {/* ledger list */}
        <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto font-mono">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-150 dark:border-slate-800 text-slate-400 font-semibold text-[10px] uppercase">
                  <th className="p-4 font-semibold">Transaction ID</th>
                  <th className="p-4 font-semibold">Parent Clearing ID</th>
                  <th className="p-4 font-semibold">Clearing Reference Number</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold text-center">State Outcome</th>
                  <th className="p-4 font-semibold text-right">Gateway Overhead Fee</th>
                  <th className="p-4 font-semibold text-right">Ledger Delta Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedTxns.map((t) => {
                  const isNegative = t.amount < 0 || t.type === TransactionType.REFUND;
                  const isSuccess = t.status === TransactionStatus.SUCCESS;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition text-[11px]">
                      <td className="p-4 font-bold text-slate-500">{t.id}</td>
                      <td className="p-4 font-bold text-purple-600 dark:text-purple-400">{t.paymentId}</td>
                      <td className="p-4 text-slate-400">{t.referenceNumber}</td>
                      <td className="p-4 font-sans">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] rounded font-mono font-bold uppercase ${
                          t.type === TransactionType.PAYMENT
                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
                            : "bg-purple-50 text-purple-800 dark:bg-purple-950/25 dark:text-purple-300"
                        }`}>
                          {t.type === TransactionType.PAYMENT ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-purple-600" />}
                          <span>{t.type}</span>
                        </span>
                      </td>
                      <td className="p-4 text-center font-sans">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-mono leading-none rounded uppercase font-semibold ${
                          isSuccess
                            ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                            : t.status === TransactionStatus.PENDING
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/10 dark:text-amber-300"
                            : "bg-red-150 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-400">${t.fee.toFixed(2)}</td>
                      <td className={`p-4 text-right font-bold text-sm ${isNegative ? "text-purple-600 dark:text-purple-400" : "text-slate-800 dark:text-slate-100"}`}>
                        {isNegative ? "-" : ""}${Math.abs(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 bg-slate-50/60 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-mono">
              <span>Showing transactions {txnPage * txnPerPage + 1} - {Math.min((txnPage + 1) * txnPerPage, filteredTxns.length)} of {filteredTxns.length}</span>
              <div className="flex gap-1.5 font-sans">
                <button
                  disabled={txnPage === 0}
                  onClick={() => setTxnPage(prev => prev - 1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <button
                  disabled={txnPage >= totalPages - 1}
                  onClick={() => setTxnPage(prev => prev + 1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 disabled:opacity-40 transition"
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


  // Render Submodule: Risk Shield center panel layout
  const renderFraud = () => {
    // Calculators
    const highRisk = fraudList.filter(f => f.riskScore >= 85).length;
    const blockedCount = fraudList.filter(f => f.status === FraudRiskStatus.BLOCKED).length;
    const flaggedCount = fraudList.filter(f => f.status === FraudRiskStatus.FLAGGED).length;

    const filteredFraud = fraudList.filter(f => {
      const matcher = f.customerName.toLowerCase().includes(fraudSearch.toLowerCase()) ||
        f.userEmail.toLowerCase().includes(fraudSearch.toLowerCase()) ||
        f.reason.toLowerCase().includes(fraudSearch.toLowerCase());
      
      const matchStatus = fraudStatusFilter === "ALL" || f.status === fraudStatusFilter;
      return matcher && matchStatus;
    });

    return (
      <div className="space-y-6">
        
        {/* Fraud scorecard overview grids layout */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 select-none">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Critical Blocked</span>
            <span className="text-xl font-mono font-bold text-red-500 mt-2">{blockedCount} Cases</span>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">High Risk anomalies</span>
            <span className="text-xl font-mono font-bold text-rose-500 mt-2">{highRisk} Flagged</span>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Awaiting Compliance review</span>
            <span className="text-xl font-mono font-bold text-amber-500 mt-2">{flaggedCount} Open</span>
          </div>
          <div className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Rule Sets active</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-250 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Full Shield Protection</span>
            </span>
          </div>
        </div>

        {/* Search header controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={fraudSearch}
              onChange={(e) => setFraudSearch(e.target.value)}
              placeholder="Search risk cases, reasons index..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
            />
          </div>

          <select
            value={fraudStatusFilter}
            onChange={(e) => setFraudStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs px-3 py-2 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="ALL">All Risk Outcomes</option>
            <option value={FraudRiskStatus.FLAGGED}>Outcome: Flagged</option>
            <option value={FraudRiskStatus.BLOCKED}>Outcome: Blocked</option>
            <option value={FraudRiskStatus.APPROVED}>Outcome: Approved Exception</option>
            <option value={FraudRiskStatus.REJECTED}>Outcome: Rejected/Banned</option>
          </select>
        </div>

        {/* Fraud anomalies ledger list layouts */}
        <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-150 dark:border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-4 font-semibold">Alert ID</th>
                  <th className="p-4 font-semibold">Anomalous customer</th>
                  <th className="p-4 font-semibold">Session fingerprint parameters</th>
                  <th className="p-4 font-semibold text-center">Score Assessment</th>
                  <th className="p-4 font-semibold">Risk Trigger rule</th>
                  <th className="p-4 font-semibold text-center">Shield state</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredFraud.map((caseItem) => {
                  const scoreClass = caseItem.riskScore > 85 ? "text-red-500 font-bold" : (caseItem.riskScore > 65 ? "text-amber-500 font-semibold" : "text-slate-400");
                  return (
                    <tr key={caseItem.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition text-[11px]">
                      <td className="p-4 font-mono font-bold text-slate-400">{caseItem.id}</td>
                      <td className="p-4">
                        <span className="block font-bold text-slate-800 dark:text-slate-200">{caseItem.customerName}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{caseItem.userEmail}</span>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-slate-400">
                        <span className="block">IP: {caseItem.ipAddress} ({caseItem.country})</span>
                        <span className="block text-[9px] mt-0.5 text-slate-500 italic max-w-[150px] truncate">{caseItem.device}</span>
                      </td>
                      <td className={`p-4 text-center font-mono text-xs ${scoreClass}`}>{caseItem.riskScore}/100</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-slate-400 max-w-[130px] truncate" title={caseItem.reason}>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{caseItem.reason}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[8.5px] font-mono leading-none rounded-full font-bold uppercase ${
                          caseItem.status === FraudRiskStatus.BLOCKED
                            ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                            : caseItem.status === "REJECTED"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300"
                            : caseItem.status === "APPROVED"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300"
                        }`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1 font-semibold leading-none">
                          <button
                            onClick={() => updateFraudStatus(caseItem.id, FraudRiskStatus.APPROVED)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-green-50 dark:hover:bg-green-950/20 text-emerald-500 transition cursor-pointer"
                            title="Override & Authorize release"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => updateFraudStatus(caseItem.id, FraudRiskStatus.BLOCKED)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-red-500 transition cursor-pointer"
                            title="Confirm Ban & Block Card"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

  return (
    <div className="space-y-6">
      
      {/* Visual slide-out payment detail timeline portal drawer */}
      {viewPayDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-850 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250">
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400 uppercase">handshake details</span>
                  <h4 className="text-sm font-bold text-purple-600 dark:text-purple-400 font-mono mt-0.5">{viewPayDetails.id}</h4>
                </div>
                <button
                  onClick={() => setViewPayDetails(null)}
                  className="p-1 text-slate-400 hover:text-slate-800"
                >
                  <RefreshCw className="w-5 h-5 transform rotate-45 animate-pulse" />
                </button>
              </div>

              {/* Inflow overview */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 text-center space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Settled Gross value</span>
                <span className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 block">
                  ${viewPayDetails.amount.toFixed(2)}
                </span>
                <span className="italic text-[10px] text-slate-400 font-mono">Currency base context: USD</span>
              </div>

              {/* Status information parameters listing */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Acquiring Customer Name</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-200">{viewPayDetails.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Secure validation E-Mail</span>
                  <span className="font-mono text-slate-400">{viewPayDetails.customerEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Method utilized</span>
                  <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{viewPayDetails.method.replace('_', ' ').toLowerCase()}</span>
                </div>
                {viewPayDetails.cardLast4 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Linked card indices</span>
                    <span className="font-mono text-slate-450">•••• •••• •••• {viewPayDetails.cardLast4}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Idempotence key handshake</span>
                  <span className="font-mono text-[10px] text-slate-450 truncate max-w-[150px]" title={viewPayDetails.idempotencyKey}>{viewPayDetails.idempotencyKey}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Assessed Firewall Risk score</span>
                  <span className="font-mono font-bold text-amber-500">{viewPayDetails.riskScore}/100</span>
                </div>
              </div>

              {/* Live Status timeline map */}
              <div className="space-y-3 pt-3">
                <span className="block font-mono text-[10px] uppercase font-bold text-slate-400">Payment clearing journal timeline</span>
                
                <div className="space-y-4 border-l border-slate-150 dark:border-slate-800 pl-4 relative font-sans text-xs">
                  {viewPayDetails.timeline.map((step: any, idx: number) => (
                    <div key={idx} className="relative last:pb-0 pb-1">
                      
                      {/* Timeline dot nodes visual indicator */}
                      <span className={`absolute -left-6.5 top-0.5 flex h-4 w-4 justify-center items-center rounded-full bg-white dark:bg-slate-950 border ${
                        step.status === PaymentStatus.COMPLETED
                          ? "border-green-500 text-green-500"
                          : step.status === PaymentStatus.FAILED
                          ? "border-red-500 text-red-500"
                          : step.status === PaymentStatus.REFUNDED
                          ? "border-purple-500 text-purple-500"
                          : "border-purple-400 text-purple-400"
                      }`}>
                        {step.status === PaymentStatus.COMPLETED && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {step.status === PaymentStatus.FAILED && <AlertTriangle className="w-2.5 h-2.5 animate-bounce" />}
                        {step.status === PaymentStatus.REFUNDED && <RefreshCw className="w-2.5 h-2.5" />}
                        {step.status !== PaymentStatus.COMPLETED && step.status !== PaymentStatus.FAILED && step.status !== PaymentStatus.REFUNDED && <Clock className="w-2.5 h-2.5" />}
                      </span>

                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-150 capitalize">{step.status.toLowerCase()} Step Handshake</span>
                        <span className="block font-mono text-[9.5px] text-slate-400 mt-0.5">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </span>
                        <p className="text-slate-500 dark:text-slate-405 mt-1 leading-normal">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Simulated direct actions overrides */}
            <div className="pt-6 border-t border-slate-150 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => setViewPayDetails(null)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-450 rounded-xl transition cursor-pointer"
              >
                Close ledger drawer
              </button>
              
              {viewPayDetails.status === PaymentStatus.COMPLETED && (
                <button
                  type="button"
                  onClick={() => handleRefundClick(viewPayDetails.id)}
                  className="flex-1 py-2 bg-purple-650 hover:bg-purple-750 text-white text-[11px] font-bold rounded-xl transition shadow flex justify-center items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
                  <span>Manual Refund</span>
                </button>
              )}

              {viewPayDetails.status === PaymentStatus.FAILED && (
                <button
                  type="button"
                  onClick={() => handleRetryClick(viewPayDetails.id)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition shadow flex justify-center items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Manually Retry</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {activeTab === "admin-payments" && renderPayments()}
      {activeTab === "admin-transactions" && renderTransactions()}
      {activeTab === "admin-fraud" && renderFraud()}
    </div>
  );
};
