/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  Notification
} from "../types";

// Seed helpers for programmatic variation
const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const companies = ["StripeX Corp", "NvidiaTech", "Apex Retail", "Nebula SaaS", "Quantum Logistics", "Velo Finance", "Zeta Gaming", "Titan Media", "Hyperion Web", "Nova Labs"];
const domains = ["gmail.com", "outlook.com", "yahoo.com", "merchant.io", "saasenterprise.com", "checkout.net"];
const countries = ["United States", "Germany", "United Kingdom", "Canada", "Singapore", "Japan", "Australia", "Brazil", "India", "France"];
const devices = ["MacBook Pro (Chrome)", "Windows PC (Firefox)", "iPhone 15 Pro (Safari)", "Google Pixel 8 (Chrome)", "iPad Pro (Safari)", "Linux Workstation (Brave)"];
const ipPrefixes = ["192.168.1.", "172.16.23.", "85.204.11.", "45.12.89.", "103.22.45.", "198.51.100."];

function getRandomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ------------------------------------------------------------------
// GENERATE 50+ USERS
// ------------------------------------------------------------------
export const users: User[] = [];

// Admin users
users.push({
  id: "USR-001",
  name: "Saketh Teegala",
  email: "sakethteegala@gmail.com",
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
  createdDate: "2026-01-01T09:00:00Z",
  lastLogin: "2026-06-06T12:00:00Z",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
  company: "Cloud Gateway Prime",
  apiKey: "gwp_live_51Msz8B9x9LpQzK2"
});

users.push({
  id: "USR-002",
  name: "Sarah Jenkins",
  email: "sarah.j@gateway.io",
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
  createdDate: "2026-01-10T10:30:00Z",
  lastLogin: "2026-06-06T11:45:00Z",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
  company: "Internal Operations",
  apiKey: "gwp_live_49Fkd773JdH9sL1"
});

// Seed other 48 users
for (let i = 3; i <= 52; i++) {
  const fName = getRandomItem(firstNames);
  const lName = getRandomItem(lastNames);
  const name = `${fName} ${lName}`;
  const company = getRandomItem(companies);
  const email = `${fName.toLowerCase()}.${lName.toLowerCase()}@${getRandomItem(domains)}`;
  const daysAgo = getRandomInt(5, 120);
  const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  const lastLoginDaysAgo = getRandomInt(0, Math.min(daysAgo, 5));
  const lastLogin = new Date(Date.now() - lastLoginDaysAgo * 24 * 60 * 60 * 1000).toISOString();

  users.push({
    id: `USR-${String(i).padStart(3, "0")}`,
    name,
    email,
    role: i === 12 || i === 25 ? UserRole.ADMIN : UserRole.USER, // Make a couple of other admins
    status: i % 15 === 0 ? UserStatus.DEACTIVATED : UserStatus.ACTIVE,
    createdDate,
    lastLogin,
    company: i === 12 || i === 25 ? "Cloud Gateway Admin" : company,
    apiKey: `gwp_live_${Math.random().toString(36).substring(2, 17)}`
  });
}

// ------------------------------------------------------------------
// GENERATE 200 PAYMENTS
// ------------------------------------------------------------------
export const payments: Payment[] = [];

// Determine standard methods
const methods = [
  PaymentMethod.CREDIT_CARD,
  PaymentMethod.CREDIT_CARD,
  PaymentMethod.DEBIT_CARD,
  PaymentMethod.UPI,
  PaymentMethod.UPI,
  PaymentMethod.WALLET,
  PaymentMethod.NET_BANKING,
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.CRYPTOCURRENCY
];

const errorReasons = [
  "Insufficient Funds",
  "Card Expired",
  "CVV Authentication Failed",
  "Incorrect OTP / Secure Verification Timeout",
  "Velocity Limit Exceeded",
  "Suspected Fraudulent Activity Blacklisted BIN",
  "Bank Gateway Host Down",
  "Transaction Rejected by Processor Rule Set"
];

for (let i = 1; i <= 200; i++) {
  const customerFirst = getRandomItem(firstNames);
  const customerLast = getRandomItem(lastNames);
  const customerName = `${customerFirst} ${customerLast}`;
  const customerEmail = `${customerFirst.toLowerCase()}.${customerLast.toLowerCase()}@${getRandomItem(domains)}`;
  
  const amount = parseFloat(getRandomRange(10.0, 5000.0).toFixed(2));
  const dateOffsetDays = getRandomInt(0, 30);
  const dateOffsetHours = getRandomInt(0, 23);
  const date = new Date(Date.now() - (dateOffsetDays * 24 + dateOffsetHours) * 60 * 1000 * 60).toISOString();
  
  const method = getRandomItem(methods);
  const riskScore = getRandomInt(5, 98);
  
  // Decide payment status
  let status: PaymentStatus = PaymentStatus.COMPLETED;
  if (i % 8 === 0) {
    status = PaymentStatus.FAILED;
  } else if (i % 15 === 0) {
    status = PaymentStatus.REFUNDED;
  } else if (i % 24 === 0) {
    status = PaymentStatus.PROCESSING;
  }

  const errorReason = status === PaymentStatus.FAILED ? getRandomItem(errorReasons) : undefined;
  const cardLast4 = [PaymentMethod.CREDIT_CARD, PaymentMethod.DEBIT_CARD].includes(method) 
    ? String(getRandomInt(1000, 9999)) 
    : undefined;

  const webLogsStatus = status === PaymentStatus.COMPLETED ? "DELIVERED" : (status === PaymentStatus.FAILED ? "FAILED" : "PENDING");

  // Create timeline
  const timeline = [
    { status: PaymentStatus.CREATED, timestamp: new Date(new Date(date).getTime() - 2500).toISOString(), description: "Payment intent initialized successfully by merchant API request." }
  ];

  if ((status as any) !== PaymentStatus.CREATED) {
    timeline.push({ status: PaymentStatus.PROCESSING, timestamp: new Date(new Date(date).getTime() - 1000).toISOString(), description: `Routing transaction through primary banking connector using ${method.replace('_', ' ')}.` });
  }

  if (status === PaymentStatus.FAILED) {
    timeline.push({ status: PaymentStatus.FAILED, timestamp: date, description: `Transaction aborted: ${errorReason}.` });
  } else if (status === PaymentStatus.COMPLETED) {
    timeline.push({ status: PaymentStatus.COMPLETED, timestamp: date, description: "Funds captured successfully. Transaction cleared by financial institution." });
  } else if (status === PaymentStatus.REFUNDED) {
    timeline.push({ status: PaymentStatus.COMPLETED, timestamp: new Date(new Date(date).getTime() - 4000).toISOString(), description: "Funds captured successfully." });
    timeline.push({ status: PaymentStatus.REFUNDED, timestamp: date, description: "Merchant initiated full refund. Settlement reversed successfully." });
  }

  payments.push({
    id: `PAY-${String(i).padStart(5, "0")}`,
    customerName,
    customerEmail,
    amount,
    currency: "USD",
    method,
    status,
    date,
    errorReason,
    cardLast4,
    riskScore,
    webhookStatus: webLogsStatus as any,
    idempotencyKey: `idempotency_key_${Math.random().toString(36).substring(2, 12)}`,
    timeline
  });
}

// Sort payments from newest to oldest
payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// ------------------------------------------------------------------
// GENERATE 500 TRANSACTIONS
// ------------------------------------------------------------------
export const transactions: Transaction[] = [];

// To generate 500 transactions, we couple them to the 200 payments (some have refund transactions, some failed, etc.)
// And generate a steady stream of extra standard transactions representing historic ledger postings
for (let j = 1; j <= 500; j++) {
  // If we map to existing payments first
  if (j <= payments.length) {
    const payment = payments[j - 1];
    
    // Core transaction
    let transStatus = TransactionStatus.SUCCESS;
    if (payment.status === PaymentStatus.FAILED) transStatus = TransactionStatus.FAILED;
    if (payment.status === PaymentStatus.PROCESSING) transStatus = TransactionStatus.PENDING;

    transactions.push({
      id: `TXN-${String(j).padStart(6, "0")}`,
      paymentId: payment.id,
      amount: payment.amount,
      status: transStatus,
      type: TransactionType.PAYMENT,
      date: payment.timeline[1] ? payment.timeline[1].timestamp : payment.date,
      referenceNumber: `REF${String(getRandomInt(10000000, 99999999))}`,
      fee: parseFloat((payment.amount * 0.029 + 0.30).toFixed(2)),
      chargeback: payment.riskScore > 85 && payment.status === PaymentStatus.COMPLETED && j % 13 === 0
    });

    // If payment was refunded, push another REFUND transaction
    if (payment.status === PaymentStatus.REFUNDED) {
      transactions.push({
        id: `TXN-${String(500 + j).padStart(6, "0")}`, // Unique id
        paymentId: payment.id,
        amount: -payment.amount,
        status: TransactionStatus.SUCCESS,
        type: TransactionType.REFUND,
        date: payment.date, // Refund date is payment.date (newest timeline entry)
        referenceNumber: `REFREF${String(getRandomInt(10000000, 99999999))}`,
        fee: -0.30, // Fee returned minus overhead
        chargeback: false
      });
    }
  } else {
    // Standalone historical transactions (so we comfortably hit exactly 500 total)
    const dateOffsetDays = getRandomInt(31, 90);
    const date = new Date(Date.now() - dateOffsetDays * 24 * 60 * 1000 * 60).toISOString();
    const amount = parseFloat(getRandomRange(10.0, 3000.0).toFixed(2));
    const isFeeRefund = getRandomInt(0, 100) > 95;
    
    transactions.push({
      id: `TXN-${String(j).padStart(6, "0")}`,
      paymentId: `PAY-${String(getRandomInt(1, 200)).padStart(5, "0")}`,
      amount: isFeeRefund ? -amount : amount,
      status: getRandomItem([TransactionStatus.SUCCESS, TransactionStatus.SUCCESS, TransactionStatus.SUCCESS, TransactionStatus.FAILED]),
      type: isFeeRefund ? TransactionType.REFUND : TransactionType.PAYMENT,
      date,
      referenceNumber: `REF${String(getRandomInt(10000000, 99999999))}`,
      fee: isFeeRefund ? -0.30 : parseFloat((amount * 0.027 + 0.30).toFixed(2)),
      chargeback: false
    });
  }
}

// Sort transactions newest to oldest
transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


// ------------------------------------------------------------------
// GENERATE 30+ FRAUD CASES
// ------------------------------------------------------------------
export const fraudAlerts: FraudAlert[] = [];

const fraudReasons = [
  "Mismatched Card BIN Country vs Customer IP Address Country",
  "Velocity Trigger: Placed 8 identical attempts within 45 seconds",
  "High Risk Proxy / Tor Node VPN usage detected",
  "Automated Carding attack suspected by AI Classifier",
  "Customer name listed on high-risk global sanctions list",
  "High Risk Device fingerprint matches known chargeback identity",
  "Suspicious transaction amount exceeded historical spend by 1200%"
];

for (let k = 1; k <= 30; k++) {
  const paymentIndex = getRandomInt(0, 199);
  const payment = payments[paymentIndex];
  
  let riskScore = getRandomInt(75, 99);
  let status = getRandomItem([FraudRiskStatus.FLAGGED, FraudRiskStatus.REJECTED, FraudRiskStatus.BLOCKED]);
  
  if (k % 4 === 0) {
    status = FraudRiskStatus.APPROVED; // Overridden/approved by admin
    riskScore = getRandomInt(60, 78);
  }

  const email = payment ? payment.customerEmail : `user.${k}@fraud.net`;
  const name = payment ? payment.customerName : "Unknown Customer";
  const pId = payment ? payment.id : `PAY-X${getRandomInt(1000, 9999)}`;
  const date = payment ? payment.date : new Date(Date.now() - k * 12 * 60 * 60 * 1000).toISOString();

  fraudAlerts.push({
    id: `FRD-${String(k).padStart(3, "0")}`,
    userEmail: email,
    customerName: name,
    transactionId: pId,
    ipAddress: getRandomItem(ipPrefixes) + getRandomInt(2, 254),
    device: getRandomItem(devices),
    riskScore,
    status,
    reason: getRandomItem(fraudReasons),
    date,
    country: getRandomItem(countries)
  });
}

// Sort fraud alerts by index or date (newest first)
fraudAlerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


// ------------------------------------------------------------------
// GENERATE 100 WEBHOOK LOGS
// ------------------------------------------------------------------
export const webhookLogs: WebhookLog[] = [];

const merchantEndpoints = [
  "https://api.stridex.com/webhooks/gateway",
  "https://saascloud.io/billing/callback",
  "https://checkout.nvidiatech.com/api/v2/webhooks",
  "https://apexretail.net/webhooks/payments",
  "https://quantum-logistics.com/hooks/receive-funds"
];

const webhookEvents = [
  "payment.created",
  "payment.processed",
  "payment.failed",
  "payment.refunded"
] as const;

for (let w = 1; w <= 100; w++) {
  const responseCode = w % 12 === 0 ? getRandomItem([400, 404, 500, 502, 504]) : 200;
  const status = responseCode === 200 ? "SUCCESS" : "FAILED";
  const retries = status === "SUCCESS" ? getRandomInt(0, 1) : 3;
  const timestamp = new Date(Date.now() - w * 4 * 60 * 60 * 1000).toISOString();
  const event = getRandomItem(webhookEvents);
  const endpoint = getRandomItem(merchantEndpoints);

  const mockPayload = JSON.stringify({
    event,
    timestamp,
    api_version: "2026-03-15",
    data: {
      id: `PAY-${String(getRandomInt(1, 200)).padStart(5, "0")}`,
      amount: parseFloat(getRandomRange(10, 2500).toFixed(2)),
      currency: "USD",
      customer_email: `customer${getRandomInt(1, 100)}@merchant.io`,
      status: event === "payment.failed" ? "failed" : "completed",
      idempotency_key: `idemp_${Math.random().toString(36).substring(2, 10)}`
    }
  }, null, 2);

  const logs = [
    `[${timestamp}] [INFO] Event '${event}' dispatched of size ${mockPayload.length} bytes.`,
    `[${timestamp}] [INFO] Connecting to remote endpoint Host: ${endpoint.split('/')[2]}`,
  ];

  if (status === "SUCCESS") {
    logs.push(`[${timestamp}] [SUCCESS] Received response with Status Code 200 OK. Dispatch cleared.`);
  } else {
    logs.push(`[${timestamp}] [WARNING] Remote endpoint failed. Response Code: ${responseCode}`);
    logs.push(`[${timestamp}] [RETRY] Rescheduling dispatch index. Retry count: ${retries}/3`);
    logs.push(`[${timestamp}] [FATAL] Retry exhausted. Webhook failure flag set for gateway investigation.`);
  }

  webhookLogs.push({
    id: `WHK-${String(w).padStart(4, "0")}`,
    endpoint,
    event,
    status,
    responseCode,
    retries,
    timestamp,
    payload: mockPayload,
    logs
  });
}

// Sort newest first
webhookLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


// ------------------------------------------------------------------
// GENERATE AUDIT LOGS
// ------------------------------------------------------------------
export const auditLogs: AuditLog[] = [];

const auditActions = [
  { action: "Merchant login successful", module: "AUTH" },
  { action: "API Security Keys rotated", module: "SECURITY" },
  { action: "Refund authorized for PAY-00104", module: "PAYMENT" },
  { action: "Blocked suspicious risk user domain", module: "FRAUD" },
  { action: "Configured webhook endpoint parameters", module: "WEBHOOK" },
  { action: "Database manual sync triggered via Admin UI", module: "SYSTEM" },
  { action: "Account details updated successfully", module: "USER_PROFILE" },
  { action: "Approved chargeback claim mediation", module: "CHARGEBACK" },
  { action: "Deactivated client user USR-041", module: "USER_MGMT" },
  { action: "Exported payment logs to multi-format CSV", module: "EXPORT" }
];

for (let a = 1; a <= 60; a++) {
  const chosen = getRandomItem(auditActions);
  const date = new Date(Date.now() - a * 6 * 60 * 60 * 1000).toISOString();
  const logUser = getRandomItem(users);

  auditLogs.push({
    id: `AUD-${String(a).padStart(4, "0")}`,
    userEmail: logUser ? logUser.email : "sakethteegala@gmail.com",
    action: chosen.action,
    module: chosen.module,
    timestamp: date,
    ipAddress: getRandomItem(ipPrefixes) + getRandomInt(2, 254),
    device: getRandomItem(devices)
  });
}

// ------------------------------------------------------------------
// KAFKA EVENTS STREAM (DYNAMIC & SEEDED)
// ------------------------------------------------------------------
export const kafkaEvents: KafkaEvent[] = [];

const kafkaProducerTopics = ["payment-events", "fraud-analysis", "webhook-dispatch"] as const;
const kafkaConsumers = ["PaymentProcessorConsumer", "FraudDetectionConsumer", "WebhookDispatcherConsumer"] as const;

for (let k = 1; k <= 40; k++) {
  const status = k % 15 === 0 ? "FAILED" : (k % 2 === 0 ? "CONSUMED" : "PRODUCED");
  const eventName = k % 3 === 0 ? "PaymentCreatedEvent" : (k % 3 === 1 ? "PaymentProcessedEvent" : "FraudEvaluatedEvent");
  const topic = getRandomItem(kafkaProducerTopics);
  const consumer = getRandomItem(kafkaConsumers);
  const timestamp = new Date(Date.now() - k * 30 * 60 * 1000).toISOString();

  kafkaEvents.push({
    id: `KFK-${String(k).padStart(4, "0")}`,
    eventName,
    status,
    timestamp,
    topic,
    consumer,
    payload: JSON.stringify({
      broker_cluster: "kafka-prod-gwp-01",
      offset: 142000 + k,
      partition: k % 4,
      version: "1.0",
      headers: {
        correlation_id: `corr_${Math.random().toString(36).substring(2, 10)}`,
        idempotency_token: `idemp_${Math.random().toString(36).substring(2, 10)}`
      },
      message_body: {
        payment_id: `PAY-${String(getRandomInt(1, 200)).padStart(5, "0")}`,
        timestamp_epoch: Date.now() - k * 1800000,
        amount_cents: getRandomInt(500, 250000)
      }
    }, null, 2)
  });
}


// ------------------------------------------------------------------
// IDEMPOTENCY RECORD POOL
// ------------------------------------------------------------------
export const idempotencyRecords: IdempotencyRecord[] = [];

for (let i = 1; i <= 35; i++) {
  const status = i % 12 === 0 ? "EXPIRED" : (i % 7 === 0 ? "LOCKED" : "RESOLVED");
  const createdAt = new Date(Date.now() - i * 14 * 60 * 60 * 1000).toISOString();
  
  idempotencyRecords.push({
    key: `idemp_k_gwp_${Math.random().toString(36).substring(2, 15)}`,
    requestHash: `sha256_${Math.random().toString(36).substring(2, 15)}`,
    status,
    createdAt,
    endpoint: getRandomItem(["/api/v1/payments", "/api/v1/refunds", "/api/v1/customers"])
  });
}


// ------------------------------------------------------------------
// RECENT DEFAULT GLOBAL NOTIFICATIONS
// ------------------------------------------------------------------
export const notificationsPool: Notification[] = [
  {
    id: "notif-1",
    type: "warning",
    title: "High Risk Transaction Detected",
    message: "Payment PAY-00045 was flagged. Risk Score is extremely high: 96/100.",
    timestamp: "2026-06-06T11:45:00Z",
    read: false
  },
  {
    id: "notif-2",
    type: "error",
    title: "Webhook delivery failure limit",
    message: "Endpoint https://apexretail.net/webhooks/payments rejected webhook dispatch with 502 Bad Gateway.",
    timestamp: "2026-06-06T10:12:00Z",
    read: false
  },
  {
    id: "notif-3",
    type: "success",
    title: "Gateway API Keys Rotated",
    message: "Production API Keys were successfully updated. Active developer webhooks synchronized.",
    timestamp: "2026-06-06T09:00:00Z",
    read: true
  },
  {
    id: "notif-4",
    type: "info",
    title: "AI Analysis Report Ready",
    message: "The AI platform processed May transaction performance. Insights card successfully cached.",
    timestamp: "2026-06-05T18:30:00Z",
    read: true
  }
];


// ------------------------------------------------------------------
// AI ASSISTANT CHAT MODEL RESPONSES (MOCK GENERATOR/REPLY)
// ------------------------------------------------------------------
export const mockAiReplies = [
  {
    trigger: "Why did my payment fail?",
    reply: "Based on payment controller audit checks, client payment fails are primarily caused by 'Insufficient Funds' (42%) or 'Incorrect OTP / Secure Verification Timeout' (31%). I analyzed your recent failed payment (PAY-00008), and the issuer code returned 'Insufficient Funds'. Suggest implementing immediate email notifications for customers to let them quickly retry with an alternate card method."
  },
  {
    trigger: "Show my recent transactions.",
    reply: "Here is your ledger summary for the past 24 hours: You completed 12 checkouts totaling **$1,420.50** with a 100% success rate. The primary payment methods used were UPI (45%) and Credit Credit Cards (35%). All webhooks for these orders were successfully targeted and delivered within an average of 420ms latency."
  },
  {
    trigger: "Analyze my spending pattern.",
    reply: "Analyzing your merchant store inflows: over the past 30 days, spending is heavily concentrated in the **$100 to $250 range** (70% of volume). Transaction velocities peak consistently on Thursdays between 14:00 and 18:00 UTC. The dominant channel is Credit Card billing. Chargebacks are incredibly low at **0.02%**, indicating strong consumer intent and checkout authenticity."
  },
  {
    trigger: "Explain transaction status.",
    reply: "A secure transaction transitions through three specific Kafka-backed lifecycle stages: \n\n1. `CREATED`: Initial payment API parameter handshake validated by Idempotency checks. \n2. `PROCESSING`: Primary banking router maps the payload details to issuer network adapters. \n3. `COMPLETED`/`FAILED`: Clearing completed, ledger logs locked, merchant target webhook dispatched."
  }
];
