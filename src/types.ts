/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum TargetIndustry {
  MARKETING = "Marketing Agency",
  WEB_DESIGN = "Web Design Agency",
  RECRUITMENT = "Recruiting Agency",
  INSURANCE = "Insurance Broking",
  MORTGAGE = "Mortgage Broking",
}

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  industry: TargetIndustry;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: "starter" | "professional" | "growth" | "enterprise";
  status: "active" | "canceled" | "incomplete" | "none";
  currentPeriodEnd: string;
  tierName: string;
  price: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  status: "New Lead" | "Contacted" | "Qualified" | "Proposal Sent" | "Won" | "Lost";
  notes: string;
  createdAt: string;
}

export interface OutreachCampaign {
  id: string;
  name: string;
  type: "email" | "linkedin" | "script" | "followup";
  industry: string;
  subject: string;
  generatedText: string;
  recipientName?: string;
  createdAt: string;
}

export interface GeneratedContent {
  id: string;
  title: string;
  type: "linkedin_post" | "x_thread" | "blog" | "newsletter" | "marketing_email";
  industry: string;
  prompt: string;
  output: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  clientName: string;
  companyName: string;
  serviceTitle: string;
  scopeOfWork: string;
  contractTerms: string;
  estimatedCost: string;
  generatedText: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  createdAt: string;
}

export interface AppSettings {
  id: string;
  theme: "dark" | "light";
  primaryColor: string;
  geminiModel: string;
  notificationsEnabled: boolean;
  apiKeyStatus: "connected" | "missing";
}

export interface AnalyticsSummary {
  leadsCreatedCount: number;
  contentGeneratedCount: number;
  proposalsGeneratedCount: number;
  conversionRate: number; // e.g. 15.4%
  monthlyRecurringRevenue: number;
  activeOpportunities: number;
}
