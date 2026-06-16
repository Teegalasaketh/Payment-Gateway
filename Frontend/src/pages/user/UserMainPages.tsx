/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { PaymentMethod, PaymentStatus, TransactionStatus, TransactionType } from "../../types";
import {
  RevenueTrendChart,
  PaymentMethodDistributionChart
} from "../../components/charts/CustomCharts";
import {
  CreditCard,
  History,
  Activity,
  Search,
  Plus,
  ArrowRight,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Coins,
  Settings,
  ShieldCheck,
  Building,
  KeyRound,
  RotateCw,
  RefreshCw,
  Globe,
  Wallet
} from "lucide-react";

export const UserMainPages: React.FC = () => {
  const {
    activeTab,
    paymentsList,
    transactionsList,
    currentUser,
    processNewPayment,
    addToastNotif,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab
  } = useApp();

  // Local state contexts for Virtual Payment Terminal Wizard
  const [payAmount, setPayAmount] = useState<string>("120.00");
  const [payCurrency, setPayCurrency] = useState("USD");
  const [payMethod, setPayMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT_CARD);
  
  // Card credentials
  const [cardHolder, setCardHolder] = useState(currentUser?.name || "John Doe");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4111");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");

  // Alternatives states
  const [upiId, setUpiId] = useState("john@upi");
  const [walletRef, setWalletRef] = useState("Paytm");
  const [bankRef, setBankRef] = useState("Chase Bank Corp");

  // Wizard process outcomes states
  const [wizardStep, setWizardStep] = useState<"FORM" | "PROCESSING" | "OUTCOME">("FORM");
  const [pResult, setPResult] = useState<any>(null);

  // Searches state
  const [txnSearch, setTxnSearch] = useState("");
  const [txnPage, setTxnPage] = useState(0);
  const txnPerPage = 10;

  // Selected details modal
  const [viewDetails, setViewDetails] = useState<any>(null);

  // Profile keys local
  const [currentSandKey, setCurrentSandKey] = useState("gwp_sandbox_" + Math.random().toString(36).substring(2, 16));
  const [currentLiveKey, setCurrentLiveKey] = useState("gwp_live_" + Math.random().toString(36).substring(2, 16));

  const handleRotateKey = (env: "sandbox" | "live") => {
    const k = "gwp_" + env + "_" + Math.random().toString(36).substring(2, 16);
    if (env === "sandbox") {
      setCurrentSandKey(k);
    } else {
      setCurrentLiveKey(k);
    }
    addToastNotif("success", "API security secrets generated", `Synchronized new developer token keys for environment: ${env}`);
  };


  // Action Submit payment
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    
    if (isNaN(amount) || amount <= 0) {
      addToastNotif("error", "Failed To Submit", "Please enter a valid billing amount checkout sum.");
      return;
    }

    setWizardStep("PROCESSING");
    
    try {
      const livePayResult = await processNewPayment({
        amount,
        currency: payCurrency,
        method: payMethod,
        cardHolder,
        cardNumber,
        expiryDate: cardExp,
        cvv: cardCvv,
        upiId,
        walletProvider: walletRef,
        bankName: bankRef
      });
      setPResult(livePayResult);
      setWizardStep("OUTCOME");
    } catch (err) {
      addToastNotif("error", "Handshake aborted", "The virtual gateway declined transaction processing.");
      setWizardStep("FORM");
    }
  };


  // Render Submodule: User Dashboard view
  const renderDashboard = () => {
    // Filter personal merchant scope emails
    const myPayments = paymentsList.filter(p => p.customerEmail.toLowerCase() === currentUser?.email.toLowerCase());
    const complete = myPayments.filter(p => p.status === PaymentStatus.COMPLETED);
    const failed = myPayments.filter(p => p.status === PaymentStatus.FAILED);
    const pending = myPayments.filter(p => p.status === PaymentStatus.PROCESSING);

    const totalBillsSettle = complete.reduce((s, p) => s + p.amount, 0);

    const cards = [
      { id: "myp-1", label: "My Capture Total Inflows", val: `$${totalBillsSettle.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: "Successfully captured into merchant ledger", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/20" },
      { id: "myp-2", label: "All checkouts initiated", val: String(myPayments.length), sub: "Within standard sandbox limits", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
      { id: "myp-3", label: "Failed/Declined checkouts", val: String(failed.length), sub: "Due to fund shortfalls or limits", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20" },
      { id: "myp-4", label: "Processing handshake collections", val: String(pending.length), sub: "Awaiting clearing clearing", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/10" }
    ];

    return (
      <div className="space-y-6">
        
        {/* KPI Score card deck */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
          {cards.map((cr) => (
            <div key={cr.id} className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase leading-none">{cr.label}</span>
              <div className={`text-xl font-bold tracking-tight font-mono mt-2 ${cr.color}`}>{cr.val}</div>
              <p className="text-[10px] text-slate-400 mt-2.5">{cr.sub}</p>
            </div>
          ))}
        </div>

        {/* Dynamic charts displays */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RevenueTrendChart payments={myPayments} />
          <PaymentMethodDistributionChart payments={myPayments} />
        </div>

        {/* AI Recommendations warning overlay list layouts */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[9px] font-bold text-amber-500 uppercase">AI Recommendation Module</span>
            <h4 className="text-sm font-semibold">Integrate Apogee Clearing API libraries smoothly</h4>
            <p className="text-xs text-slate-400 pr-4 leading-normal">
              Analyzing current merchant store setup: Recommend using our **Idempotence Headers Handshake (idempotency_key)** inside checkout intents to completely secure checkouts from duplicate operations.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("user-pay")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer shrink-0 transition"
          >
            Open Sandbox Terminal
          </button>
        </div>

      </div>
    );
  };


  // Render Submodule: Virtual Payout terminal simulation wizard
  const renderTerminal = () => {
    return (
      <div className="max-w-xl mx-auto p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-150 dark:border-slate-800 shadow-sm">
        
        {/* Step 1: Input forms schema */}
        {wizardStep === "FORM" && (
          <form onSubmit={handlePaymentSubmit} className="space-y-5">
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-purple-500 uppercase">Interactive simulation checkout</span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Merchant sandbox Terminal</h3>
              <p className="text-xs text-slate-405 leading-normal">
                Trigger simulated transactions to assess gateway clearing outcome timelines, webhook alerts, and Kafka broker streams.
              </p>
            </div>

            {/* Currency check & Value */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-500 block">Payout Value (Checkout amount)</label>
                <input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 p-2 text-xs rounded-xl font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-xs font-semibold text-slate-500 block">Currency base</label>
                <select
                  value={payCurrency}
                  onChange={(e) => setPayCurrency(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 p-2 text-xs rounded-xl text-slate-705 focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Method switcher cards tabs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 block">Gateway Processor Channel</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-medium text-slate-650 dark:text-slate-350 select-none">
                <button
                  type="button"
                  onClick={() => setPayMethod(PaymentMethod.CREDIT_CARD)}
                  className={`p-2.5 border rounded-xl flex flex-col justify-center items-center gap-1.5 transition ${
                    payMethod === PaymentMethod.CREDIT_CARD
                      ? "bg-purple-600/10 border-purple-600 font-semibold text-purple-600 dark:text-purple-400"
                      : "border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-950"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px]">Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod(PaymentMethod.UPI)}
                  className={`p-2.5 border rounded-xl flex flex-col justify-center items-center gap-1.5 transition ${
                    payMethod === PaymentMethod.UPI
                      ? "bg-purple-600/10 border-purple-600 font-semibold text-purple-600 dark:text-purple-400"
                      : "border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-950"
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span className="text-[10px]">UPI Wallet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod(PaymentMethod.BANK_TRANSFER)}
                  className={`p-2.5 border rounded-xl flex flex-col justify-center items-center gap-1.5 transition ${
                    payMethod === PaymentMethod.BANK_TRANSFER
                      ? "bg-purple-600/10 border-purple-600 font-semibold text-purple-600 dark:text-purple-400"
                      : "border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-950"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span className="text-[10px]">Bank Wire</span>
                </button>
              </div>
            </div>

            {/* Sub fields depends on switch */}
            {payMethod === PaymentMethod.CREDIT_CARD && (
              <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">Security Cardholder name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 p-2 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 text-left block">Primary credit indices number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 p-2 rounded-xl text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Expiration date index (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      placeholder="12/28"
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 p-2 rounded-xl text-slate-800 dark:text-slate-200 text-center font-mono focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">CVV Security Pin</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 p-2 rounded-xl text-slate-800 dark:text-slate-200 text-center font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {payMethod === PaymentMethod.UPI && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <label className="text-[11px] font-semibold text-slate-500 block">Unified Wallet VPA address</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 p-2 rounded-xl text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                />
              </div>
            )}

            {payMethod === PaymentMethod.BANK_TRANSFER && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-sans">
                <label className="text-[11px] font-semibold text-slate-500 block">Selected wire banking partner</label>
                <input
                  type="text"
                  value={bankRef}
                  onChange={(e) => setBankRef(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 p-2 rounded-xl text-slate-800 dark:text-slate-200 font-sans focus:outline-none"
                />
              </div>
            )}

            {/* Simulator inputs helper text notifications boxes */}
            <div className="p-3.5 rounded-xl bg-slate-100/60 dark:bg-slate-950/20 border border-slate-200/40 dark:border-slate-800 text-[10.5px] text-slate-405 leading-normal space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-slate-500 block">Simulator outcomes helper parameters</span>
              <p>
                - Input value <span className="font-mono font-semibold text-rose-500">404</span> to trigger simulated bank gateway system host down failures.
              </p>
              <p>
                - Input value <span className="font-mono font-semibold text-red-500">911</span> to trigger critical suspicious risk score blocks.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-purple-550/15 cursor-pointer block text-center"
            >
              Authorize secure sandbox payment
            </button>
          </form>
        )}

        {/* Step 2: Processing visual loader overlay */}
        {wizardStep === "PROCESSING" && (
          <div className="py-12 flex flex-col justify-center items-center text-center space-y-4 font-sans text-xs">
            <RefreshCw className="w-10 h-10 text-purple-600 dark:text-purple-450 animate-spin" />
            <div>
              <span className="block font-bold text-slate-850 dark:text-slate-200 text-sm">TLS Handshake transit in progress...</span>
              <span className="block text-slate-400 font-mono text-[10px] mt-1">Acquiring terminal checking carding and risk matrix rules...</span>
            </div>
          </div>
        )}

        {/* Step 3: Wizard outcomes visual screens layouts */}
        {wizardStep === "OUTCOME" && pResult && (
          <div className="py-4 text-center space-y-6 font-sans text-xs">
            
            {/* Visual indicators */}
            <div className="flex flex-col items-center">
              {pResult.status === PaymentStatus.COMPLETED ? (
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 border-4 border-green-50">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-rose-950/20 text-red-500 border-4 border-rose-50">
                  <AlertTriangle className="w-7 h-7 animate-bounce" />
                </div>
              )}

              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-3">
                {pResult.status === PaymentStatus.COMPLETED ? "Transaction captured successfully" : "Clearance handshaked declined"}
              </h2>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider">Gateway clearing Code Ref: {pResult.id}</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/25 border border-slate-100 dark:border-slate-850 rounded-xl max-w-sm mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-450">Capture gross cost</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">${pResult.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Processor Channel</span>
                <span className="capitalize font-semibold text-slate-700 dark:text-slate-350">{pResult.method.replace('_', ' ').toLowerCase()}</span>
              </div>
              {pResult.errorReason && (
                <div className="flex justify-between">
                  <span className="text-slate-450">Decline reason</span>
                  <span className="font-semibold text-rose-500 font-mono text-[10.5px] max-w-[170px] truncate" title={pResult.errorReason}>{pResult.errorReason}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-450">Risk assessment score</span>
                <span className="font-mono font-bold text-amber-500">{pResult.riskScore}/100</span>
              </div>
            </div>

            <div className="flex gap-2 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => setWizardStep("FORM")}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 rounded-xl transition cursor-pointer"
              >
                Abort & Return
              </button>
              <button
                type="button"
                onClick={() => {
                  setWizardStep("FORM");
                  setPayAmount("120.00");
                  // Go to ledger tab to see it!
                  setActiveTab("user-transactions");
                }}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-xl shadow transition cursor-pointer"
              >
                Inspect Ledger Inflows
              </button>
            </div>
            
          </div>
        )}

      </div>
    );
  };


  // Render Submodule: Personal Store Activity archives
  const renderTransactionsHistory = () => {
    // Filter by customer matching (current session logged merchant)
    const myPayments = paymentsList.filter(p => p.customerEmail.toLowerCase() === currentUser?.email.toLowerCase());
    
    const filteredMyPayments = myPayments.filter(p =>
      p.id.toLowerCase().includes(txnSearch.toLowerCase()) ||
      p.method.toLowerCase().includes(txnSearch.toLowerCase())
    );

    const totalPages = Math.ceil(filteredMyPayments.length / txnPerPage);
    const paginatedPayments = filteredMyPayments.slice(txnPage * txnPerPage, (txnPage + 1) * txnPerPage);

    return (
      <div className="space-y-6 animate-fade-in font-sans">
        
        {/* Simple searching toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={txnSearch}
              onChange={(e) => { setTxnSearch(e.target.value); setTxnPage(0); }}
              placeholder="Search reference, indices method..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none font-sans"
            />
          </div>
          <span className="text-[11px] text-slate-450 font-mono font-bold leading-none">
            Total Captured elements: {myPayments.length} transactions
          </span>
        </div>

        {/* List table outcomes */}
        <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-150 dark:border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-4 font-semibold">Payment ID</th>
                  <th className="p-4 font-semibold">Clearing Method</th>
                  <th className="p-4 font-semibold text-center">Firewall Risk Score</th>
                  <th className="p-4 font-semibold text-center">Clearing Status</th>
                  <th className="p-4 font-semibold text-right">Captured net Amount</th>
                  <th className="p-4 font-semibold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {paginatedPayments.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition text-[11px]">
                      <td className="p-4 font-mono font-bold text-purple-600 dark:text-purple-400">{p.id}</td>
                      <td className="p-4 capitalize text-slate-650 dark:text-slate-405 font-medium">
                        {p.method.replace('_', ' ').toLowerCase()}
                      </td>
                      <td className="p-4 text-center font-mono font-semibold text-slate-650 dark:text-slate-405">
                        {p.riskScore}/100
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[8.5px] font-mono leading-none rounded uppercase font-bold ${
                          p.status === PaymentStatus.COMPLETED
                            ? "bg-green-150 text-green-750 dark:bg-green-950/30 dark:text-green-300"
                            : p.status === PaymentStatus.FAILED
                            ? "bg-red-154 text-red-750 dark:bg-red-950/30 dark:text-red-300"
                            : "bg-purple-150 text-purple-750 dark:bg-purple-950/20 dark:text-purple-300"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-800 dark:text-slate-150">
                        ${p.amount.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setViewDetails(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-500 font-bold tracking-wide transition cursor-pointer"
                        >
                          Invoice Details
                        </button>
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


  // Render Submodule: Developer Profile setting configurations
  const renderProfile = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 shadow-sm space-y-4 text-xs font-sans">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-purple-500" />
              <span>Primary Merchant Account Info</span>
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                <span className="text-slate-450">Representative Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser?.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                <span className="text-slate-450">Secure E-Mail Credentials</span>
                <span className="font-mono text-slate-400">{currentUser?.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                <span className="text-slate-450">Registered Corporate Entity</span>
                <span className="font-bold text-purple-500">{currentUser?.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">PCI Compliance Status</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4.5 h-4.5" />
                  <span>Verified PCI-DSS L4</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 shadow-sm space-y-4 text-xs font-sans">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <KeyRound className="w-4.5 h-4.5 text-purple-500" />
              <span>Developer API Secrets console</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="font-semibold text-slate-500">Simulated Sandbox Environment Key secret</span>
                  <button
                    onClick={() => handleRotateKey("sandbox")}
                    className="text-purple-500 hover:text-purple-600 font-semibold"
                  >
                    Rotate Secret
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={currentSandKey}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 text-xs rounded-xl text-slate-500 font-mono"
                />
              </div>

              <div className="space-y-1.5 pt-1.5">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="font-semibold text-slate-500">Production Gateway secret token key</span>
                  <button
                    onClick={() => handleRotateKey("live")}
                    className="text-purple-500 hover:text-purple-600 font-semibold"
                  >
                    Rotate Secret
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={currentLiveKey}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 text-xs rounded-xl text-slate-550 font-mono"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };


  // Render Submodule: Alerts Inbox
  const renderNotifications = () => {
    return (
      <div className="max-w-2xl mx-auto space-y-6 font-sans text-xs">
        <div className="flex justify-between items-center bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-sm font-bold text-slate-850 dark:text-slate-200 block">Operational alerts inbox</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Security warnings and core clearing notifications channel</span>
          </div>
          <button
            onClick={() => markAllNotificationsRead()}
            className="px-3.5 py-2 bg-slate-100 border hover:bg-slate-200 dark:bg-slate-950 text-slate-500 hover:text-slate-800 dark:hover:text-white border-slate-250 dark:border-slate-800 text-[10px] rounded-xl font-bold font-mono uppercase transition cursor-pointer"
          >
            Clear Notifications
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden shadow-sm">
          {notifications.map((notif) => {
            const isUnread = !notif.read;
            return (
              <div
                key={notif.id}
                className={`p-5 flex gap-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-900/10 ${
                  isUnread ? "bg-purple-50/10 dark:bg-purple-950/10 font-medium" : ""
                }`}
              >
                <div className="mt-0.5">
                  <Bell className={`w-4 h-4 ${isUnread ? "text-purple-500 animate-bounce" : "text-slate-400"}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate leading-snug">{notif.title}</span>
                    <span className="font-mono text-[9.5px] text-slate-400">
                      {new Date(notif.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    {notif.message}
                  </p>
                  {isUnread && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="mt-2 text-[10px] font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400"
                    >
                      Acknowledge Bulletin
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Standalone Detail overlays invoice popups */}
      {viewDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-155 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-xs leading-normal font-sans text-slate-700 dark:text-slate-350 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-slate-405">acquiring audit code</span>
                <h4 className="text-sm font-bold text-purple-600 font-mono leading-none mt-0.5">{viewDetails.id}</h4>
              </div>
              <button
                onClick={() => setViewDetails(null)}
                className="text-slate-400 hover:text-slate-800 font-mono text-sm leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-450">Clearance status</span>
                <span className={`inline-block px-1.5 py-0.5 text-[8.5px] font-mono leading-none rounded uppercase font-bold bg-green-100 text-green-700`}>{viewDetails.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Total Gross cost</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">${viewDetails.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Handshake date</span>
                <span className="font-mono text-slate-500">{new Date(viewDetails.date).toUTCString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Idempotency Token Key</span>
                <span className="font-mono text-[9px] max-w-[150px] truncate block" title={viewDetails.idempotencyKey}>{viewDetails.idempotencyKey}</span>
              </div>
            </div>

            <button
              onClick={() => {
                addToastNotif("success", "Invoice Print Prepared", "Serialized ledger envelope sent to local print spooler.");
                setViewDetails(null);
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl transition shadow text-xs mt-4 block text-center"
            >
              Print invoice logs
            </button>
          </div>
        </div>
      )}

      {activeTab === "user-dashboard" && renderDashboard()}
      {activeTab === "user-pay" && renderTerminal()}
      {activeTab === "user-transactions" && renderTransactionsHistory()}
      {activeTab === "user-profile" && renderProfile()}
      {activeTab === "user-notifications" && renderNotifications()}
    </div>
  );
};
