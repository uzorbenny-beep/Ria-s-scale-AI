/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead, OutreachCampaign, GeneratedContent, Proposal, ChatMessage, AppSettings, TargetIndustry } from "../types";

// Generates persistent mock data for the 5 target profile sectors
export const DEFAULT_LEADS: Record<TargetIndustry, Lead[]> = {
  [TargetIndustry.MARKETING]: [
    {
      id: "m1",
      name: "Marcus Aurelius",
      company: "Roman Growth Co",
      industry: "E-Commerce Retail",
      email: "marcus@romanretail.com",
      phone: "+1 (555) 123-4567",
      status: "Won",
      notes: "Closed $5k retainer campaign. High priority onboarding.",
      createdAt: "2026-05-12T08:00:00Z"
    },
    {
      id: "m2",
      name: "Sarah Jenkins",
      company: "Apex Fitness Labs",
      industry: "Health & Wellness",
      email: "sarah@apexlabs.com",
      phone: "+1 (555) 987-6543",
      status: "Qualified",
      notes: "Interested in TikTok Ads and UGC content strategy. Budget looks solid ($3.5k/mo).",
      createdAt: "2026-05-24T14:30:00Z"
    },
    {
      id: "m3",
      name: "David Chen",
      company: "Scribe Software",
      industry: "SaaS Dev",
      email: "david@scribesoft.io",
      phone: "+1 (555) 456-7890",
      status: "Proposal Sent",
      notes: "Sent comprehensive lead acquisition flow proposal. Awaiting CEO signature.",
      createdAt: "2026-05-28T10:15:00Z"
    },
    {
      id: "m4",
      name: "Jessica Taylor",
      company: "Zest Beverage Group",
      industry: "Food & Beverage",
      email: "j.taylor@zestdrink.com",
      phone: "+1 (555) 321-0987",
      status: "Contacted",
      notes: "Sent cold customized email pitch. Scheduled an intro call for next Tuesday.",
      createdAt: "2026-05-30T11:00:00Z"
    },
    {
      id: "m5",
      name: "Robert Miller",
      company: "Miller Law Corp",
      industry: "Legal Services",
      email: "robert@millerlawyers.com",
      phone: "+1 (555) 654-3210",
      status: "New Lead",
      notes: "Inbound inquiry from lead form. Looking to capture regional injury traffic.",
      createdAt: "2026-06-01T07:22:00Z"
    }
  ],
  [TargetIndustry.WEB_DESIGN]: [
    {
      id: "w1",
      name: "Alice Vance",
      company: "Vance Architecture",
      industry: "Creative Services",
      email: "alice@vancearch.com",
      phone: "+1 (555) 711-4422",
      status: "Won",
      notes: "Full Webflow redesign and branding package ($12k total). Project kickoff completed.",
      createdAt: "2026-05-10T09:15:00Z"
    },
    {
      id: "w2",
      name: "John Kowalski",
      company: "Metro Real Estate",
      industry: "Real Estate",
      email: "j.kowalski@metropads.com",
      phone: "+1 (555) 992-0011",
      status: "Proposal Sent",
      notes: "Proposal submitted for interactive custom listing portal ($18,500 budget).",
      createdAt: "2026-05-25T16:40:00Z"
    },
    {
      id: "w3",
      name: "Elena Rostova",
      company: "Prime Dental Clinic",
      industry: "Healthcare",
      email: "elena@primedentalsmile.com",
      phone: "+1 (555) 881-2299",
      status: "Qualified",
      notes: "Needs local SEO optimization, appointment scheduling setup, and clean UI.",
      createdAt: "2026-05-29T12:00:00Z"
    }
  ],
  [TargetIndustry.RECRUITMENT]: [
    {
      id: "r1",
      name: "Cynthia Cross",
      company: "Quantum Tech Systems",
      industry: "SaaS Dev",
      email: "cynthia@quantumtech.io",
      phone: "+1 (555) 441-2821",
      status: "Won",
      notes: "Retainer signed for hiring 3 Senior Rust Developers. 20% placement fee.",
      createdAt: "2026-05-08T08:30:00Z"
    },
    {
      id: "r2",
      name: "Jonathan Bradley",
      company: "Stellar Logistics",
      industry: "Supply Chain",
      email: "jonathan@stellarlogistics.com",
      phone: "+1 (555) 773-1122",
      status: "Contacted",
      notes: "Pitched VP level staffing support. Outlining candidate profile requirements.",
      createdAt: "2026-05-27T10:50:00Z"
    }
  ],
  [TargetIndustry.INSURANCE]: [
    {
      id: "i1",
      name: "Linda Harrison",
      company: "Harrison Logistics LLC",
      industry: "Transportation",
      email: "linda@harrisonfreight.com",
      phone: "+1 (555) 833-2911",
      status: "Won",
      notes: "Commercial fleet umbrella coverage negotiated ($45k annual premium setup).",
      createdAt: "2026-05-05T14:20:00Z"
    },
    {
      id: "i2",
      name: "Benjamin Scott",
      company: "Scott Property Group",
      industry: "Property Management",
      email: "ben@scottmanaged.com",
      phone: "+1 (555) 303-9112",
      status: "Proposal Sent",
      notes: "Prepared custom casualty risk portfolio bid for 12 multi-family complexes.",
      createdAt: "2026-05-29T15:30:00Z"
    }
  ],
  [TargetIndustry.MORTGAGE]: [
    {
      id: "mg1",
      name: "Thomas Sterling",
      company: "Sterling Home Buyers",
      industry: "Residential Buying",
      email: "thomas@sterlingbuilders.co",
      phone: "+1 (555) 234-9001",
      status: "Won",
      notes: "Assisted first-time buyer couple with jumbo-loan pre-approval ($850k value). Secured 5.8% rate locking.",
      createdAt: "2026-05-15T11:45:00Z"
    },
    {
      id: "mg2",
      name: "Angela De Luca",
      company: "De Luca Properties",
      industry: "Real Estate Dev",
      email: "angela@delucapads.com",
      phone: "+1 (555) 877-6221",
      status: "Qualified",
      notes: "Structuring pre-approval for multiple townhouse construction refinancings.",
      createdAt: "2026-05-28T09:10:00Z"
    }
  ],
};

export const DEFAULT_CAMPAIGNS: OutreachCampaign[] = [
  {
    id: "c1",
    name: "Standard B2B Cold Outreach",
    type: "email",
    industry: TargetIndustry.MARKETING,
    subject: "Quick feedback on Roman Growth Co content architecture",
    generatedText: "Hi Marcus,\n\nI was reviewing Roman Growth Co and love your approach to E-Commerce Retail products. However, noticed a 30% speed gap on checkout page loads when mapping user pathways.\n\nWe recently helped Apex run a page optimization audit that boosted checkouts by 14% with targeted retargeting setups. Would you be open to an interactive review next Tuesday around 10am?\n\nBest,\n[Your Name]",
    recipientName: "Marcus Aurelius",
    createdAt: "2026-05-15T09:00:00Z"
  },
  {
    id: "c2",
    name: "LinkedIn Value Pitch Sequence",
    type: "linkedin",
    industry: TargetIndustry.WEB_DESIGN,
    subject: "LinkedIn Connection",
    generatedText: "Hi Elena, noticed your dental clinic has amazing localized reviews here in Seattle! Wondering if you've considered setting up an interactive appointment booking flow directly on the site. It reduced friction by 40% for our medical UI designs which translates to 5+ new booking registrations a week. No pitch, just wanted to check if you'd like a quick video walkthrough? Let me know!",
    recipientName: "Elena Rostova",
    createdAt: "2026-05-29T13:30:00Z"
  }
];

export const DEFAULT_CONTENT: GeneratedContent[] = [
  {
    id: "ct1",
    title: "Overcoming Agency Burnout Threads",
    type: "linkedin_post",
    industry: TargetIndustry.MARKETING,
    prompt: "How to stop selling hours and transition to productized services",
    output: "Stop trading hours for dollars.\n\nHere is how we helped 3 agency clients transition to a 100% productized subscription schedule:\n\n1. Standardize Scope (Strict boundaries)\n2. Setup Flat Rates\n3. Pre-paid retainer billing\n\nResult: Scalable throughput with 60% gross client margins. Full blueprint details incoming. #SaasSavesTime",
    createdAt: "2026-05-18T10:00:00Z"
  },
  {
    id: "ct2",
    title: "Webflow vs Custom React for Local Businesses",
    type: "blog",
    industry: TargetIndustry.WEB_DESIGN,
    prompt: "A comparison guide for brick-and-mortar marketing managers",
    output: "# The Local Decider: Webflow or Custom React?\n\nSelecting your tech stack shouldn't be confusing. Here's a breakdown:\n- **Webflow**: Best for rapid changes, fast layouts, and marketing teams needing independence.\n- **Custom Code (React)**: Required for private customer profiles, proprietary booking algorithms, and massive databases. \n\nChoose Webflow unless you are building a custom product hub.",
    createdAt: "2026-05-26T15:20:00Z"
  }
];

export const DEFAULT_PROPOSALS: Proposal[] = [
  {
    id: "p1",
    clientName: "David Chen",
    companyName: "Scribe Software",
    serviceTitle: "Full-Funnel Outbound Lead Acquisition Program",
    scopeOfWork: "1. Outbound cold-sequence campaign setups\n2. AI list enrichment and filters\n3. Bi-weekly optimization and response monitoring",
    contractTerms: "12-week minimum duration, upfront initial monthly payments",
    estimatedCost: "$4,500/month",
    generatedText: "# STRATEGIC BLUEPRINT PROPOSAL & SOW\n\n**Prepared for Scribe Software**\n**Scope of services:** Multi-channel cold sequence and copywriting automation. Establishing system routines for pipeline development with target performance goals.",
    createdAt: "2026-05-28T10:30:00Z"
  }
];

export const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: "chat-1",
    role: "model",
    text: "Welcome to **Ria'S Scale AI Workspace**. I am your primary strategic advisor, trained specifically across premium service-oriented systems. How can we accelerate your client acquisition pipeline or optimize service structures today?",
    createdAt: "2026-06-01T08:00:00Z"
  }
];

export function getInitialCRMRecords(leads: Lead[]) {
  const records: Record<string, Lead[]> = {
    "New Lead": [],
    "Contacted": [],
    "Qualified": [],
    "Proposal Sent": [],
    "Won": [],
    "Lost": [],
  };
  leads.forEach((l) => {
    if (records[l.status]) {
      records[l.status].push(l);
    }
  });
  return records;
}

// Global hydration manager storing everything safely in standard localStorage
export class LocalStorageDB {
  static getProfile() {
    const raw = localStorage.getItem("aga_profile");
    if (!raw) {
      const defaultProf = {
        name: "Alex Rivera",
        company: "Vanguard Tech Consults",
        industry: TargetIndustry.MARKETING,
        email: "alex@vanguardconsult.com",
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("aga_profile", JSON.stringify(defaultProf));
      return defaultProf;
    }
    return JSON.parse(raw);
  }

  static saveProfile(profile: any) {
    localStorage.setItem("aga_profile", JSON.stringify(profile));
    // Trigger reset or updates based on industry transition
  }

  static getLeads(industry: TargetIndustry): Lead[] {
    const raw = localStorage.getItem(`aga_leads_${industry}`);
    if (!raw) {
      const defaultCollection = DEFAULT_LEADS[industry] || [];
      localStorage.setItem(`aga_leads_${industry}`, JSON.stringify(defaultCollection));
      return defaultCollection;
    }
    return JSON.parse(raw);
  }

  static saveLeads(industry: TargetIndustry, leads: Lead[]) {
    localStorage.setItem(`aga_leads_${industry}`, JSON.stringify(leads));
  }

  static getCampaigns(): OutreachCampaign[] {
    const raw = localStorage.getItem("aga_campaigns");
    if (!raw) {
      localStorage.setItem("aga_campaigns", JSON.stringify(DEFAULT_CAMPAIGNS));
      return DEFAULT_CAMPAIGNS;
    }
    return JSON.parse(raw);
  }

  static saveCampaigns(campaigns: OutreachCampaign[]) {
    localStorage.setItem("aga_campaigns", JSON.stringify(campaigns));
  }

  static getContent(): GeneratedContent[] {
    const raw = localStorage.getItem("aga_content");
    if (!raw) {
      localStorage.setItem("aga_content", JSON.stringify(DEFAULT_CONTENT));
      return DEFAULT_CONTENT;
    }
    return JSON.parse(raw);
  }

  static saveContent(content: GeneratedContent[]) {
    localStorage.setItem("aga_content", JSON.stringify(content));
  }

  static getProposals(): Proposal[] {
    const raw = localStorage.getItem("aga_proposals");
    if (!raw) {
      localStorage.setItem("aga_proposals", JSON.stringify(DEFAULT_PROPOSALS));
      return DEFAULT_PROPOSALS;
    }
    return JSON.parse(raw);
  }

  static saveProposals(proposals: Proposal[]) {
    localStorage.setItem("aga_proposals", JSON.stringify(proposals));
  }

  static getChatMessages(): ChatMessage[] {
    const raw = localStorage.getItem("aga_chat");
    if (!raw) {
      localStorage.setItem("aga_chat", JSON.stringify(DEFAULT_MESSAGES));
      return DEFAULT_MESSAGES;
    }
    return JSON.parse(raw);
  }

  static saveChatMessages(messages: ChatMessage[]) {
    localStorage.setItem("aga_chat", JSON.stringify(messages));
  }

  static getSubscription() {
    const raw = localStorage.getItem("aga_subscription");
    if (!raw) {
      const defaultSub = {
        id: "sub_1M2bB987C",
        userId: "user_vanguard",
        planId: "professional",
        status: "active",
        currentPeriodEnd: "2026-07-01T00:00:00Z",
        tierName: "Professional Plan",
        price: "$49/mo",
        coins: 10000,
        maxCoins: 10000
      };
      localStorage.setItem("aga_subscription", JSON.stringify(defaultSub));
      return defaultSub;
    }
    return JSON.parse(raw);
  }

  static saveSubscription(sub: any) {
    localStorage.setItem("aga_subscription", JSON.stringify(sub));
  }

  static getSettings(): AppSettings {
    const raw = localStorage.getItem("aga_settings");
    if (!raw) {
      const defaultSettings: AppSettings = {
        id: "set_config",
        theme: "dark",
        primaryColor: "indigo",
        geminiModel: "gemini-3.5-flash",
        notificationsEnabled: true,
        apiKeyStatus: "connected"
      };
      localStorage.setItem("aga_settings", JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    return JSON.parse(raw);
  }

  static saveSettings(settings: AppSettings) {
    localStorage.setItem("aga_settings", JSON.stringify(settings));
  }
}
