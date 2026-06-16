/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  DEACTIVATED = "DEACTIVATED",
}

export enum PaymentStatus {
  CREATED = "CREATED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  UPI = "UPI",
  WALLET = "WALLET",
  NET_BANKING = "NET_BANKING",
  BANK_TRANSFER = "BANK_TRANSFER",
  CRYPTOCURRENCY = "CRYPTOCURRENCY",
}

export enum TransactionType {
  PAYMENT = "PAYMENT",
  REFUND = "REFUND",
  CHARGEBACK = "CHARGEBACK",
  PAYOUT = "PAYOUT",
}

export enum TransactionStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  PENDING = "PENDING",
}

export enum FraudRiskStatus {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  FLAGGED = "FLAGGED",
  BLOCKED = "BLOCKED",
  PENDING = "PENDING",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdDate: string;
  lastLogin: string;
  avatar?: string;
  company?: string;
  apiKey?: string;
}

export interface PaymentTimelineEntry {
  status: PaymentStatus;
  timestamp: string;
  description: string;
}

export interface Payment {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  errorReason?: string;
  cardLast4?: string;
  riskScore: number;
  webhookStatus: "DELIVERED" | "FAILED" | "PENDING";
  idempotencyKey?: string;
  timeline: PaymentTimelineEntry[];
}

export interface Transaction {
  id: string;
  paymentId: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  date: string;
  referenceNumber: string;
  fee: number;
  chargeback: boolean;
}

export interface FraudAlert {
  id: string;
  userEmail: string;
  customerName: string;
  transactionId: string;
  ipAddress: string;
  device: string;
  riskScore: number;
  status: FraudRiskStatus;
  reason: string;
  date: string;
  country: string;
}

export interface WebhookLog {
  id: string;
  endpoint: string;
  event: "payment.created" | "payment.processed" | "payment.failed" | "payment.refunded";
  status: "SUCCESS" | "FAILED";
  responseCode: number;
  retries: number;
  timestamp: string;
  payload: string;
  logs: string[];
}

export interface KafkaEvent {
  id: string;
  eventName: "PaymentCreatedEvent" | "PaymentProcessedEvent" | "FraudEvaluatedEvent";
  status: "PRODUCED" | "CONSUMED" | "FAILED";
  timestamp: string;
  topic: "payment-events" | "fraud-analysis" | "webhook-dispatch";
  consumer: "PaymentProcessorConsumer" | "FraudDetectionConsumer" | "WebhookDispatcherConsumer";
  payload: string;
}

export interface IdempotencyRecord {
  key: string;
  requestHash: string;
  status: "RESOLVED" | "LOCKED" | "EXPIRED";
  createdAt: string;
  endpoint: string;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
  device: string;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}
