/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  UserRole,
  UserStatus,
  Payment,
  PaymentStatus,
  PaymentMethod,
  Transaction,
  TransactionStatus,
  TransactionType,
  FraudAlert,
  FraudRiskStatus,
  WebhookLog,
  KafkaEvent,
  IdempotencyRecord,
  AuditLog,
  Notification,
  ChatMessage
} from "../types";

// We will import directly from "../mock/data" instead to be precise.
import * as mockData from "../mock/data";

interface AppContextType {
  // Session State
  currentUser: User | null;
  authRole: UserRole;
  isAuthenticated: boolean;
  rememberMe: boolean;
  
  // App Collections
  usersList: User[];
  paymentsList: Payment[];
  transactionsList: Transaction[];
  fraudList: FraudAlert[];
  webhookList: WebhookLog[];
  auditList: AuditLog[];
  idempotencyList: IdempotencyRecord[];
  kafkaList: KafkaEvent[];
  notifications: Notification[];
  theme: "light" | "dark";
  
  // Auth Operations
  login: (email: string, role: UserRole, remember: boolean) => Promise<boolean>;
  loginWithGoogle: (email: string, name: string, onboardingRole?: UserRole) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, role: UserRole, company: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
  
  // Administrative Operations
  updateUserStatus: (userId: string, status: UserStatus) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  deleteUser: (userId: string) => void;
  addUser: (name: string, email: string, role: UserRole, status: UserStatus, company: string) => void;
  refundPayment: (paymentId: string) => Promise<boolean>;
  retryFailedPayment: (paymentId: string) => Promise<boolean>;
  
  // Fraud Ops
  updateFraudStatus: (alertId: string, status: FraudRiskStatus) => void;
  
  // Webhook Ops
  triggerWebhookRetry: (webhookId: string) => Promise<boolean>;
  
  // User Operations
  processNewPayment: (paymentData: {
    amount: number;
    currency: string;
    method: PaymentMethod;
    cardHolder?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    upiId?: string;
    walletProvider?: string;
    bankName?: string;
    cryptoAddress?: string;
  }) => Promise<Payment>;

  // Chat Ops
  chatHistory: ChatMessage[];
  sendChatMessage: (text: string) => void;
  clearChat: () => void;
  
  // System State
  toggleTheme: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  addToastNotif: (type: "success" | "error" | "warning" | "info", title: string, message: string) => void;
  activeTab: string; // Dynamic path/view routing helper
  setActiveTab: (tab: string) => void;
  selectedPayment: Payment | null;
  setSelectedPayment: (payment: Payment | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("gwp_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("gwp_authenticated") === "true";
  });

  const [authRole, setAuthRole] = useState<UserRole>(() => {
    const savedUser = localStorage.getItem("gwp_user");
    return savedUser ? JSON.parse(savedUser).role : UserRole.ADMIN;
  });

  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Collections (In-Memory mutable DB)
  const [usersList, setUsersList] = useState<User[]>(() => mockData.users);
  const [paymentsList, setPaymentsList] = useState<Payment[]>(() => mockData.payments);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>(() => mockData.transactions);
  const [fraudList, setFraudList] = useState<FraudAlert[]>(() => mockData.fraudAlerts);
  const [webhookList, setWebhookList] = useState<WebhookLog[]>(() => mockData.webhookLogs);
  const [auditList, setAuditList] = useState<AuditLog[]>(() => mockData.auditLogs);
  const [idempotencyList, setIdempotencyList] = useState<IdempotencyRecord[]>(() => mockData.idempotencyRecords);
  const [kafkaList, setKafkaList] = useState<KafkaEvent[]>(() => mockData.kafkaEvents);
  const [notifications, setNotifications] = useState<Notification[]>(() => mockData.notificationsPool);
  
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("gwp_theme");
    return (savedTheme as any) || "dark";
  });

  // Client side tab/view routing
  const [activeTab, setActiveTabInner] = useState<string>(() => {
    const defaultView = isAuthenticated ? (authRole === UserRole.ADMIN ? "admin-dashboard" : "user-dashboard") : "login";
    return defaultView;
  });

  const setActiveTab = (tab: string) => {
    setActiveTabInner(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Simple Chatbot History
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "ai-init",
      sender: "assistant",
      text: "Hello! I am the Enterprise Gateway AI Assistant. I can help analyze terminal revenues, evaluate payment failure trends, track potential network fraud risks, or retrieve recent transactional metrics. What can I check for you today?",
      timestamp: new Date().toISOString()
    }
  ]);

  // Handle Root Theme Injections
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("gwp_theme", theme);
  }, [theme]);

  // Sync authentication changes
  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const addToastNotif = (type: "success" | "error" | "warning" | "info", title: string, message: string) => {
    const newNotif: Notification = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToastNotif("info", "Inbox Cleared", "All platform alerts marked as read.");
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Simulated Kafka Injections
  const triggerKafkaLog = (eventName: "PaymentCreatedEvent" | "PaymentProcessedEvent" | "FraudEvaluatedEvent", status: "PRODUCED" | "CONSUMED" | "FAILED", topic: any, consumer: any, payloadObj: any) => {
    const newEvent: KafkaEvent = {
      id: `KFK-${String(kafkaList.length + 1).padStart(4, "0")}`,
      eventName,
      status,
      timestamp: new Date().toISOString(),
      topic,
      consumer,
      payload: JSON.stringify(payloadObj, null, 2)
    };
    setKafkaList(prev => [newEvent, ...prev]);
  };

  // Audit Helper
  const triggerAuditLog = (userEmail: string, action: string, module: string) => {
    const newAudit: AuditLog = {
      id: `AUD-${String(auditList.length + 1).padStart(4, "0")}`,
      userEmail,
      action,
      module,
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.101",
      device: "MacBook Pro (Admin Console UI)"
    };
    setAuditList(prev => [newAudit, ...prev]);
  };

  // ------------------------------------------------------------------
  // AUTH OPERATORS
  // ------------------------------------------------------------------
  const login = async (email: string, role: UserRole, remember: boolean) => {
    // Artificial payload delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Attempt lookup or fallback creation
    let targetUser = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    let roleToUse = role;

    if (!targetUser) {
      if (email.toLowerCase() === "sakethteegala@gmail.com") {
        roleToUse = UserRole.ADMIN;
      }
      targetUser = {
        id: `USR-${String(usersList.length + 1).padStart(3, "0")}`,
        name: email.split("@")[0].toUpperCase(),
        email,
        role: roleToUse,
        status: UserStatus.ACTIVE,
        createdDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        company: roleToUse === UserRole.ADMIN ? "Global Gateway Admin" : "SaaS Merchant Integration Ltd.",
        apiKey: "gwp_live_sandbox" + Math.random().toString(36).substring(2, 12)
      };
      setUsersList(prev => [...prev, targetUser!]);
    } else {
      roleToUse = targetUser.role;
      targetUser = { ...targetUser, lastLogin: new Date().toISOString() };
      setUsersList(prev => prev.map(u => u.id === targetUser!.id ? targetUser! : u));
    }

    setRememberMe(remember);
    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    setAuthRole(roleToUse);

    if (remember) {
      localStorage.setItem("gwp_user", JSON.stringify(targetUser));
      localStorage.setItem("gwp_authenticated", "true");
    }

    triggerAuditLog(email, "Authentication Successful via Web OTP", "AUTH");
    addToastNotif("success", "Authorised Access Granted", `Welcome back, ${targetUser.name}! Initialised session as ${roleToUse === UserRole.ADMIN ? 'Administrator' : 'Merchant'}.`);
    
    // Redirect dashboard tab right away
    setActiveTab(roleToUse === UserRole.ADMIN ? "admin-dashboard" : "user-dashboard");
    return true;
  };

  const loginWithGoogle = async (email: string, name: string, onboardingRole?: UserRole) => {
    // Artificial payload delay mimicking OAuth handshake
    await new Promise(resolve => setTimeout(resolve, 900));

    let targetUser = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    let isNewUser = false;
    let roleToUse = onboardingRole || UserRole.USER;

    if (email.toLowerCase() === "sakethteegala@gmail.com") {
      roleToUse = UserRole.ADMIN;
    }

    if (!targetUser) {
      isNewUser = true;
      targetUser = {
        id: `USR-${String(usersList.length + 1).padStart(3, "0")}`,
        name: name || email.split("@")[0].toUpperCase(),
        email: email.trim(),
        role: roleToUse,
        status: UserStatus.ACTIVE,
        createdDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        company: roleToUse === UserRole.ADMIN ? "Global Gateway Admin" : "SaaS Merchant Integration Ltd.",
        apiKey: "gwp_live_google_" + Math.random().toString(36).substring(2, 12),
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
      };
      setUsersList(prev => [...prev, targetUser!]);
    } else {
      roleToUse = targetUser.role;
      targetUser = { ...targetUser, lastLogin: new Date().toISOString() };
      setUsersList(prev => prev.map(u => u.id === targetUser!.id ? targetUser! : u));
    }

    setRememberMe(true);
    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    setAuthRole(roleToUse);

    localStorage.setItem("gwp_user", JSON.stringify(targetUser));
    localStorage.setItem("gwp_authenticated", "true");

    if (isNewUser) {
      triggerAuditLog(email, "Google Safe Onboarding via OAuth completed", "AUTH");
      addToastNotif("success", "Welcome to Gateway Prime", `Account successfully created via Google. Initialised session as ${roleToUse === UserRole.ADMIN ? 'Administrator' : 'Merchant'}.`);
    } else {
      triggerAuditLog(email, "Authentication Successful via Google OAuth", "AUTH");
      addToastNotif("success", "Authorised Access Granted", `Welcome back, ${targetUser.name}! Initialised Google OAuth session.`);
    }

    // Redirect dashboard tab right away
    setActiveTab(roleToUse === UserRole.ADMIN ? "admin-dashboard" : "user-dashboard");
    return true;
  };

  const logout = () => {
    triggerAuditLog(currentUser?.email || "unknown", "Session closed gracefully", "AUTH");
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("gwp_user");
    localStorage.removeItem("gwp_authenticated");
    addToastNotif("info", "Session Cleared", "Secure exit completed. Credentials cleared.");
    setActiveTab("login");
  };

  const register = async (name: string, email: string, role: UserRole, company: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `USR-${String(usersList.length + 1).padStart(3, "0")}`,
      name,
      email,
      role,
      status: UserStatus.ACTIVE,
      createdDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      company: company || "Consolidated Retailers",
      apiKey: "gwp_live_" + Math.random().toString(36).substring(2, 16)
    };

    setUsersList(prev => [newUser, ...prev]);
    triggerAuditLog(email, `Initial onboarding user registration for ${company}`, "AUTH");
    addToastNotif("success", "Registration Complete", "Account configured. Enter verification code sent to your registered channel.");
    
    // Route to OTP verify
    setActiveTab("otp");
    return true;
  };

  const verifyOtp = async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (code.length === 6) {
      return true;
    }
    return false;
  };

  const requestPasswordReset = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    addToastNotif("success", "Encryption Reset Handshake", `Dispatched multi-factor recovery hash payload to ${email}. Check inbox.`);
    return true;
  };

  const resetPassword = async (password: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    addToastNotif("success", "Password Re-keyed", "Primary hash changed. Redirecting to access panel.");
    setActiveTab("login");
    return true;
  };


  // ------------------------------------------------------------------
  // ADMIN CONTROL ACTIONS
  // ------------------------------------------------------------------
  const updateUserStatus = (userId: string, status: UserStatus) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    const target = usersList.find(u => u.id === userId);
    triggerAuditLog(currentUser?.email || "admin", `Modified user ${userId} state indicator: ${status}`, "USER_MGMT");
    addToastNotif("info", "Status Synchronised", `Merchant status was adjusted to ${status}.`);
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    addToastNotif("success", "Role Revoked/Assigned", `Modified permissions context.`);
  };

  const deleteUser = (userId: string) => {
    const target = usersList.find(u => u.id === userId);
    setUsersList(prev => prev.filter(u => u.id !== userId));
    triggerAuditLog(currentUser?.email || "admin", `Purged user login access mapping for ${target?.email}`, "USER_MGMT");
    addToastNotif("error", "Access Terminated", `Entity ${target?.name} deleted from active ledger indices.`);
  };

  const addUser = (name: string, email: string, role: UserRole, status: UserStatus, company: string) => {
    const newUser: User = {
      id: `USR-${String(usersList.length + 1).padStart(3, "0")}`,
      name,
      email,
      role,
      status,
      createdDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      company,
      apiKey: "gwp_live_" + Math.random().toString(36).substring(2, 16)
    };
    setUsersList(prev => [newUser, ...prev]);
    addToastNotif("success", "Merchant Provisioned", `Configured credentials for ${name}.`);
  };

  const refundPayment = async (paymentId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const targetPayment = paymentsList.find(p => p.id === paymentId);
    if (!targetPayment) return false;

    // Set status to Refunded
    setPaymentsList(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: PaymentStatus.REFUNDED,
          timeline: [
            ...p.timeline,
            {
              status: PaymentStatus.REFUNDED,
              timestamp: new Date().toISOString(),
              description: "Admin authorized refund. Core ledger settlements reversed."
            }
          ]
        };
      }
      return p;
    }));

    // Inject matching refund transaction
    const refundTxn: Transaction = {
      id: `TXN-${String(transactionsList.length + 1).padStart(6, "0")}`,
      paymentId,
      amount: -targetPayment.amount,
      status: TransactionStatus.SUCCESS,
      type: TransactionType.REFUND,
      date: new Date().toISOString(),
      referenceNumber: `REFREF${String(getRandomInt(10000000, 99999999))}`,
      fee: -0.30,
      chargeback: false
    };

    setTransactionsList(prev => [refundTxn, ...prev]);
    
    // Kafka & Webhook simulation
    triggerKafkaLog("PaymentProcessedEvent", "PRODUCED", "payment-events", "PaymentProcessorConsumer", {
      payment_id: paymentId,
      status: "refunded",
      refund_amount_cents: targetPayment.amount * 100
    });

    const webHookKey = `WHK-${String(webhookList.length + 1).padStart(4, "0")}`;
    const timestamp = new Date().toISOString();
    const mockPayload = JSON.stringify({
      event: "payment.refunded",
      timestamp,
      data: { id: paymentId, amount: targetPayment.amount, status: "refunded" }
    }, null, 2);

    const newWebhook: WebhookLog = {
      id: webHookKey,
      endpoint: "https://api.stridex.com/webhooks/gateway",
      event: "payment.refunded",
      status: "SUCCESS",
      responseCode: 200,
      retries: 0,
      timestamp,
      payload: mockPayload,
      logs: [`[${timestamp}] [SUCCESS] Refund confirmation dispatched. Received 200 OK Response.`]
    };
    setWebhookList(prev => [newWebhook, ...prev]);

    triggerAuditLog(currentUser?.email || "admin", `Authorized reversal for transaction reference ${paymentId}`, "PAYMENT");
    addToastNotif("success", "Settlement Reversed", `Submited credit mandate. Refunded $${targetPayment.amount} cleanly.`);
    
    return true;
  };

  const retryFailedPayment = async (paymentId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const targetPayment = paymentsList.find(p => p.id === paymentId);
    if (!targetPayment || targetPayment.status !== PaymentStatus.FAILED) return false;

    // Retry changes state to COMPLETED (highly satisfying simulation!)
    setPaymentsList(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: PaymentStatus.COMPLETED,
          errorReason: undefined,
          timeline: [
            ...p.timeline,
            {
              status: PaymentStatus.COMPLETED,
              timestamp: new Date().toISOString(),
              description: "Admin manually re-queued payment. Card cleared by secondary transaction gateway."
            }
          ]
        };
      }
      return p;
    }));

    // Re-adjust transaction state
    setTransactionsList(prev => prev.map(t => {
      if (t.paymentId === paymentId) {
        return {
          ...t,
          status: TransactionStatus.SUCCESS
        };
      }
      return t;
    }));

    triggerKafkaLog("PaymentProcessedEvent", "CONSUMED", "payment-events", "PaymentProcessorConsumer", {
      payment_id: paymentId,
      status: "retry_settled",
      clearing_path: "standby_processor"
    });

    triggerAuditLog(currentUser?.email || "admin", `Manual billing retry override on failed reference ID: ${paymentId}`, "PAYMENT");
    addToastNotif("success", "Retry Overridden Successfully", "Secondary processor captured total transaction cost. Cleared.");
    
    return true;
  };


  // ------------------------------------------------------------------
  // FRAUD DETECTION ACTIONS
  // ------------------------------------------------------------------
  const updateFraudStatus = (alertId: string, status: FraudRiskStatus) => {
    setFraudList(prev => prev.map(f => f.id === alertId ? { ...f, status } : f));
    const targetAlert = fraudList.find(f => f.id === alertId);
    
    if (status === FraudRiskStatus.APPROVED) {
      addToastNotif("success", "Risk Exception Approved", `Flag removed from ${targetAlert?.customerName}'s checkout intent.`);
    } else if (status === FraudRiskStatus.REJECTED || status === FraudRiskStatus.BLOCKED) {
      addToastNotif("error", "Source Card Blacklisted", "Device and customer metadata recorded on permanent lock logs.");
    }
    
    triggerAuditLog(currentUser?.email || "fraud-analyst", `Fraud action '${status}' committed on Alert case ${alertId}`, "FRAUD");
  };


  // ------------------------------------------------------------------
  // WEBHOOK CONTROL
  // ------------------------------------------------------------------
  const triggerWebhookRetry = async (webhookId: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    let outcome: "SUCCESS" | "FAILED" = "SUCCESS";
    let response = 200;

    // Simulate 15% random failure on retry endpoint to keeps simulator fun
    if (Math.random() < 0.15) {
      outcome = "FAILED";
      response = 503;
    }

    setWebhookList(prev => prev.map(w => {
      if (w.id === webhookId) {
        const timestampNow = new Date().toISOString();
        return {
          ...w,
          status: outcome,
          responseCode: response,
          retries: w.retries + 1,
          logs: [
            ...w.logs,
            `[${timestampNow}] [MANUAL RETRY] Re-attempt triggered via administrative control panel.`,
            outcome === "SUCCESS"
              ? `[${timestampNow}] [SUCCESS] Delivery succeeded. Remote host responded 200 OK.`
              : `[${timestampNow}] [FATAL] Attempt returned 503 Service Unavailable. Buffer locked.`
          ]
        };
      }
      return w;
    }));

    if (outcome === "SUCCESS") {
      addToastNotif("success", "Webhook Cleared", `Dispatched event successfully to endpoint. (200 OK)`);
      return true;
    } else {
      addToastNotif("error", "Dispatch Failed", `Destination did not acknowledge delivery. (503 Service Error)`);
      return false;
    }
  };


  // ------------------------------------------------------------------
  // LIVE PAYMENT SUBMISSION
  // ------------------------------------------------------------------
  const processNewPayment = async (paymentData: {
    amount: number;
    currency: string;
    method: PaymentMethod;
    cardHolder?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    upiId?: string;
    walletProvider?: string;
    bankName?: string;
    cryptoAddress?: string;
  }) => {
    // Artificial latency simulation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Dynamic processing variables
    const paymentId = `PAY-${String(paymentsList.length + 1).padStart(5, "0")}`;
    const txnId = `TXN-${String(transactionsList.length + 1).padStart(6, "0")}`;
    const timeNow = new Date().toISOString();

    // Idempotency payload simulation
    const key = `idemp_k_gwp_${Math.random().toString(36).substring(2, 10)}`;
    const hash = `sha256_${Math.random().toString(36).substring(2, 14)}`;

    // Build timeline
    const timeline = [
      { status: PaymentStatus.CREATED, timestamp: new Date(Date.now() - 1500).toISOString(), description: "API request authorized using idempotency schema. Key accepted." },
      { status: PaymentStatus.PROCESSING, timestamp: new Date(Date.now() - 500).toISOString(), description: `Encrypting payload components. Contacting gateway under process routing token.` }
    ];

    // Determine status outcome
    let status: PaymentStatus = PaymentStatus.COMPLETED;
    let errorReason: string | undefined = undefined;
    let riskScore = getRandomInt(10, 45); // Standard safe risk score

    // Interactive failure outcomes based on user amount inputs (for interesting demo cases!)
    if (paymentData.amount === 404) {
      status = PaymentStatus.FAILED;
      errorReason = "Bank Gateway Host Down";
      riskScore = getRandomInt(15, 30);
    } else if (paymentData.amount === 911) {
      status = PaymentStatus.FAILED;
      errorReason = "Suspected Fraudulent Activity Blacklisted BIN";
      riskScore = 97; // Let's trigger a high risk alert!
    } else if (paymentData.amount > 5000) {
      // Large sums trigger medium risk
      riskScore = getRandomInt(65, 88); 
    }

    if (status === PaymentStatus.COMPLETED) {
      timeline.push({ status: PaymentStatus.COMPLETED, timestamp: timeNow, description: "Card settlement validated. Funds securely recorded on terminal ledger." });
    } else {
      timeline.push({ status: PaymentStatus.FAILED, timestamp: timeNow, description: `Gateway Rejected: ${errorReason}.` });
    }

    // Build the dynamic payment entity
    const newPayment: Payment = {
      id: paymentId,
      customerName: paymentData.cardHolder || currentUser?.name || "Global Checkout Client",
      customerEmail: currentUser?.email || "api-integration@clearing.merchant",
      amount: parseFloat(paymentData.amount.toFixed(2)),
      currency: paymentData.currency || "USD",
      method: paymentData.method,
      status,
      date: timeNow,
      errorReason,
      cardLast4: paymentData.cardNumber ? paymentData.cardNumber.slice(-4) : "4111",
      riskScore,
      webhookStatus: status === PaymentStatus.COMPLETED ? "DELIVERED" : "FAILED",
      idempotencyKey: key,
      timeline
    };

    // Insert live payment
    setPaymentsList(prev => [newPayment, ...prev]);

    // Insert matching ledger transaction
    const newTxn: Transaction = {
      id: txnId,
      paymentId,
      amount: paymentData.amount,
      status: status === PaymentStatus.COMPLETED ? TransactionStatus.SUCCESS : ((status as any) === PaymentStatus.PROCESSING ? TransactionStatus.PENDING : TransactionStatus.FAILED),
      type: TransactionType.PAYMENT,
      date: timeNow,
      referenceNumber: `REF${String(getRandomInt(10000000, 99999999))}`,
      fee: parseFloat((paymentData.amount * 0.029 + 0.30).toFixed(2)),
      chargeback: false
    };
    setTransactionsList(prev => [newTxn, ...prev]);

    // Insert Idempotency Register record
    const newIdemp: IdempotencyRecord = {
      key,
      requestHash: hash,
      status: "RESOLVED",
      createdAt: timeNow,
      endpoint: "/api/v1/payments"
    };
    setIdempotencyList(prev => [newIdemp, ...prev]);

    // Produce real-time Kafka topics
    triggerKafkaLog("PaymentCreatedEvent", "PRODUCED", "payment-events", "PaymentProcessorConsumer", {
      payment_id: paymentId,
      amount_cents: paymentData.amount * 100,
      client_identity: newPayment.customerEmail
    });

    setTimeout(() => {
      triggerKafkaLog("PaymentProcessedEvent", "CONSUMED", "payment-events", "PaymentProcessorConsumer", {
        payment_id: paymentId,
        clearing_status: status,
        assigned_risk: riskScore
      });
    }, 400);

    // If fraudulent or high score, trigger fraud center insertion
    if (riskScore > 60) {
      const fraudAlertId = `FRD-${String(fraudList.length + 1).padStart(3, "0")}`;
      const newFraud: FraudAlert = {
        id: fraudAlertId,
        userEmail: newPayment.customerEmail,
        customerName: newPayment.customerName,
        transactionId: paymentId,
        ipAddress: "159.20.91.43",
        device: "Tor Browser on Linux Desktop",
        riskScore,
        status: riskScore > 90 ? FraudRiskStatus.BLOCKED : FraudRiskStatus.FLAGGED,
        reason: riskScore > 90 ? "High Risk Proxy / IP Blocked list Match" : "Out-of-pattern Transaction Velocity Range check fail",
        date: timeNow,
        country: "Singapore"
      };

      setFraudList(prev => [newFraud, ...prev]);
      addToastNotif("warning", "Security Shield Alert", `Caution! Session risk classifier gave anomalous score ${riskScore} which automatically triggered merchant fraud queue analysis.`);
      
      triggerKafkaLog("FraudEvaluatedEvent", "PRODUCED", "fraud-analysis", "FraudDetectionConsumer", {
        reference_transaction_id: paymentId,
        assessed_score: riskScore,
        firewall_trigger: "proxy_match_rule"
      });
    }

    // Dispatches matching Merchant Webhook
    const webhookEventName = status === PaymentStatus.COMPLETED ? "payment.processed" : "payment.failed";
    const webHookKey = `WHK-${String(webhookList.length + 1).padStart(4, "0")}`;
    const mockPayload = JSON.stringify({
      event: webhookEventName,
      timestamp: timeNow,
      data: {
        id: paymentId,
        amount: newPayment.amount,
        status,
        error_code: errorReason
      }
    }, null, 2);

    const newWebhook: WebhookLog = {
      id: webHookKey,
      endpoint: "https://api.stridex.com/webhooks/gateway",
      event: webhookEventName as any,
      status: status === PaymentStatus.COMPLETED ? "SUCCESS" : "FAILED",
      responseCode: status === PaymentStatus.COMPLETED ? 200 : 500,
      retries: status === PaymentStatus.COMPLETED ? 0 : 3,
      timestamp: timeNow,
      payload: mockPayload,
      logs: [
        `[${timeNow}] [INFO] Event '${webhookEventName}' compiled of size ${mockPayload.length} bytes.`,
        `[${timeNow}] [INFO] Handshaking TLS with remote host destination endpoint.`,
        status === PaymentStatus.COMPLETED
          ? `[${timeNow}] [SUCCESS] Event delivered. Receiver returned '200 OK'. Dispatch cleared.`
          : `[${timeNow}] [WARNING] Remote endpoint failed. Response Code: 500 Internal Server Error.`
      ]
    };
    setWebhookList(prev => [newWebhook, ...prev]);

    // Push standard global app account notification
    const accountNotif: Notification = {
      id: `live-notif-${Date.now()}`,
      type: status === PaymentStatus.COMPLETED ? "success" : "error",
      title: status === PaymentStatus.COMPLETED ? "Inflow Captured" : "Inflow Declined",
      message: status === PaymentStatus.COMPLETED 
        ? `Transaction payment for $${newPayment.amount} completed successfully.` 
        : `Transaction payment of $${newPayment.amount} was declined with reason: ${errorReason}.`,
      timestamp: timeNow,
      read: false
    };
    setNotifications(prev => [accountNotif, ...prev]);

    return newPayment;
  };

  // ------------------------------------------------------------------
  // AI CHATBOT SYSTEM
  // ------------------------------------------------------------------
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat-usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMsg]);

    // Fast responding simulation
    setTimeout(() => {
      // Match triggers in case insensitive modes
      const matched = mockData.mockAiReplies.find(r => text.toLowerCase().includes(r.trigger.toLowerCase()));
      let replyText = matched ? matched.reply : "";

      if (!replyText) {
        // Dynamic reporting assistant text!
        if (text.toLowerCase().includes("revenue")) {
          const totRev = paymentsList
            .filter(p => p.status === PaymentStatus.COMPLETED)
            .reduce((s, p) => s + p.amount, 0);
          replyText = `Analyzing Gateway terminal balances: Curated aggregate revenue shows **$${totRev.toLocaleString(undefined, { minimumFractionDigits: 2 })}** across ${paymentsList.length} total payments. Your primary volume centers on Friday, utilizing credit card adapters (48%). All clearing networks report zero active backlog bottlenecks.`;
        } else if (text.toLowerCase().includes("fraud")) {
          const activeFraudCount = fraudList.filter(f => f.status === FraudRiskStatus.FLAGGED).length;
          replyText = `Risk Shield diagnostics reports: There are currently **${activeFraudCount} open risk cases** requiring administrative dispatch review. Mismatched Card BIN (31%) and High Density Velocity Spikes (29%) compose the leading trigger markers. Recommended actions: activate automated KYC rules for items exceeding $2,500.`;
        } else {
          replyText = `I have completed an indexing scan on the underlying platform repository metrics. Your system is currently processing ${paymentsList.length} API payments with ${webhookList.filter(w=>w.status==="SUCCESS").length} successful merchant webhooks. If you'd like a custom detailed analysis, please prompt 'Why did my payment fail?', 'Show my recent transactions.', 'Analyze my spending pattern.', or 'Explain transaction status'.`;
        }
      }

      const assistantMsg: ChatMessage = {
        id: `chat-asst-${Date.now()}`,
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, assistantMsg]);
    }, 900);
  };

  const clearChat = () => {
    setChatHistory([
      {
        id: "ai-init",
        sender: "assistant",
        text: "Hello! I am the Enterprise Gateway AI Assistant. I can help analyze terminal revenues, evaluate payment failure trends, track potential network fraud risks, or retrieve recent transactional metrics. What can I check for you today?",
        timestamp: new Date().toISOString()
      }
    ]);
  };


  // Helper randomizer
  function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return (
    <AppContext.Provider value={{
      currentUser,
      authRole,
      isAuthenticated,
      rememberMe,
      usersList,
      paymentsList,
      transactionsList,
      fraudList,
      webhookList,
      auditList,
      idempotencyList,
      kafkaList,
      notifications,
      theme,
      
      login,
      loginWithGoogle,
      logout,
      register,
      verifyOtp,
      requestPasswordReset,
      resetPassword,
      
      updateUserStatus,
      updateUserRole,
      deleteUser,
      addUser,
      refundPayment,
      retryFailedPayment,
      
      updateFraudStatus,
      triggerWebhookRetry,
      processNewPayment,
      
      chatHistory,
      sendChatMessage,
      clearChat,
      
      toggleTheme,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      addToastNotif,
      activeTab,
      setActiveTab,
      selectedPayment,
      setSelectedPayment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
