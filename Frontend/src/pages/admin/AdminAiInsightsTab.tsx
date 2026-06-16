/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  BrainCircuit,
  Send,
  Sparkles,
  Trash2,
  LineChart,
  ShieldCheck,
  AlertOctagon,
  FileText,
  User,
  ExternalLink,
  GitPullRequestDraft
} from "lucide-react";

export const AdminAiInsightsTab: React.FC = () => {
  const { chatHistory, sendChatMessage, clearChat, paymentsList, fraudList } = useApp();
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to chat bot message updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setInputVal("");
    setTyping(true);
    sendChatMessage(text);
    
    // De-activate typing visual offset helper on reply callback timeout trigger
    setTimeout(() => {
      setTyping(false);
    }, 850);
  };

  const prompts = [
    "Why did my payment fail?",
    "Show my recent transactions.",
    "Analyze my spending pattern.",
    "Explain transaction status."
  ];

  // AI Predictors & Analyser KPI reports
  const totalInflows = paymentsList.length;
  const flaggedRiskCases = fraudList.filter(f => f.status === "FLAGGED").length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full font-sans">
      
      {/* AI Analytical Insights summaries (Left Column modules) */}
      <div className="xl:col-span-1 space-y-6 flex flex-col">
        
        {/* Core AI performance report card */}
        <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <span className="block font-mono text-[10px] uppercase font-bold text-purple-500">Analytics Diagnostics</span>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Terminal Performance Evaluation</h3>
          <p className="text-xs text-slate-400 leading-normal">
            Gateway analytics parsed: compiled performance trends indicating operational anomalies.
          </p>

          <div className="space-y-3.5 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 flex gap-3 items-start">
              <span className="p-1 rounded bg-purple-100 dark:bg-purple-950 text-purple-600 mt-0.5"><LineChart className="w-4 h-4" /></span>
              <div>
                <span className="block font-bold text-slate-700 dark:text-slate-300">Revenue Volume forecast</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Estimated 18.2% inward surge next week, driven by Credit Card clearing networks.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 flex gap-3 items-start">
              <span className="p-1 rounded bg-red-100 dark:bg-rose-955/20 text-rose-500 mt-0.5"><AlertOctagon className="w-4 h-4 animate-bounce" /></span>
              <div>
                <span className="block font-bold text-slate-700 dark:text-slate-300">Active High Risk IPs Flagged</span>
                <p className="text-[10px] text-slate-400 mt-0.5">{flaggedRiskCases} anomalous device signatures detected on terminal gateways within past 4 hours.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 flex gap-3 items-start">
              <span className="p-1 rounded bg-green-150 dark:bg-emerald-950 text-emerald-500 mt-0.5"><ShieldCheck className="w-4 h-4" /></span>
              <div>
                <span className="block font-bold text-slate-700 dark:text-slate-300">Firewall Rules optimized</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Deduplication locks are fully operational, clearing 100% of double charge replay payloads successfully.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Predictive reporting card link */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="font-mono text-[9px] font-bold text-amber-500 uppercase">AI Generator Toolkit</span>
            <h4 className="text-sm font-semibold">Weekly Clearing Performance Report</h4>
            <p className="text-xs text-slate-400 leading-normal">
              Produce automated compliance briefs with a single click. Summarize gateway volumes, carding blocks, refund exceptions, audits, and operational latencies.
            </p>
          </div>
          
          <button
            onClick={() => handleSend("Analyze my spending pattern.")}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Inward Summary report</span>
          </button>
        </div>

      </div>

      {/* Main chat center console interface (Right Columns modules) */}
      <div className="xl:col-span-2 p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-[75vh]">
        
        {/* Chat box header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <BrainCircuit className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">Gateway Copilot Bot</span>
              <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Model Aliases: Deep Gemini LLM</span>
            </div>
          </div>
          
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg border border-slate-205 dark:border-slate-805 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-red-500 transition cursor-pointer"
            title="Wipe chat history logs"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Chat messages scrolling view container list layouts */}
        <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4 text-xs pr-1.5">
          {chatHistory.map((chat) => {
            const isAsst = chat.sender === "assistant";
            return (
              <div
                key={chat.id}
                className={`flex gap-3 max-w-[85%] ${isAsst ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* avatar column node */}
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ring-2 shrink-0 ${
                  isAsst 
                    ? "bg-purple-600 text-white ring-purple-500/10" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-250 ring-slate-150 dark:ring-slate-850"
                }`}>
                  {isAsst ? <BrainCircuit className="w-4.5 h-4.5" /> : <User className="w-4 h-4" />}
                </span>

                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl leading-normal break-words shadow-sm text-xs font-medium ${
                    isAsst 
                      ? "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-850 rounded-tl-none" 
                      : "bg-purple-600 text-white rounded-tr-none"
                  }`}>
                    {chat.text}
                  </div>
                  <span className="block text-[8px] font-mono text-slate-400 text-right uppercase px-1">
                    {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator state view */}
          {typing && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-purple-600 text-white ring-2 ring-purple-500/10 shrink-0">
                <BrainCircuit className="w-4.5 h-4.5 animate-spin" />
              </span>
              <div className="py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-400 border border-slate-100 dark:border-slate-850 rounded-tl-none font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                <span>AI evaluating records...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggestion prompt click pills footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 shrink-0">
          {prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[10.5px] font-medium bg-slate-50 hover:bg-purple-50 hover:text-purple-600 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-800 transition cursor-pointer select-none whitespace-nowrap"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Interactive message bar submit input */}
        <div className="flex items-center gap-2 mt-3 shrink-0">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(inputVal); }}
            placeholder="Type your transaction compliance query..."
            className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 focus:outline-none focus:border-purple-550 px-4 py-2.5 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-sans"
          />
          <button
            onClick={() => handleSend(inputVal)}
            disabled={!inputVal.trim() || typing}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 transition shadow-lg shadow-purple-500/10 cursor-pointer shrink-0"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
