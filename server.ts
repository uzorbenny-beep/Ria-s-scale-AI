/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARN: GEMINI_API_KEY environment variable is not set. Real AI requests will fall back to smart simulated responses.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// AI Assistant Chat Dynamic Local Strategy Synthesizer Fallback
function getSmartChatSimulation(promptText: string, industry: string): string {
  const normalized = promptText.toLowerCase();

  // If asking about Active Retainers Volume
  if (normalized.includes("retainer") || normalized.includes("active retainers volume") || normalized.includes("14,500") || normalized.includes("14500")) {
    return `### 📊 Understanding "Active Retainers Volume" ($14,500)

As a senior Agency Growth Advisor, I can walk you through this critical diagnostic section of your **Scale OS** dashboard:

#### 💡 Core Definition
**Active Retainers Volume** represents your agency's **Monthly Recurring Revenue (MRR)** generated strictly through recurring, contractual client agreements (retainers). 
* At **$14,500**, this is the predictable foundation of your Marketing Agency's monthly income. 
* Unlike one-off creative projects, this represents secure, repeat revenue that covers your fixed overheads and gives you the confidence to scale hire or reinvest.

#### 📈 The +18.4% Trend Line
This indicator signals a healthy compound growth rate over your previous performance cycle. Typically, this is achieved by:
1. **Closing New Contractual Agreements**: Signing new retainer clients on standardized flat-rate pricing.
2. **Expansion Revenue (Upselling)**: Moving existing clients into higher tier packages (e.g., adding short-form video content or paid ads onto a basic social media retainer).
3. **Churn Reduction**: High service delivery retention ensuring active customers don't drop off the roster.

#### 🎯 Strategic Action Tip for Marketing Agencies
*Currently specialized in: **Marketing Agency***
To push this metric past the **$20,000/mo** threshold, convert your services into high-ticket **productized retainers** (e.g., a standardized *$3,000/mo flat-rate* for 8 custom short-form video hooks per month instead of custom-quoted hourly creative work). This reduces scope-creep and locks in long-term predictable capital.`;
  }

  // General questions about the dashboard or scaling
  if (normalized.includes("dashboard") || normalized.includes("how to use") || normalized.includes("get started")) {
    return `### 🚀 Welcome to your Scale OS Dashboard!

Here is a quick strategic overview of how to leverage these modules for your **${industry}** specialty:

1. **Dashboard Overview**: Track your active pipeline status, specialization benchmarks, conversion rates, and instant tactical growth recommendations.
2. **AI Copilot (this screen)**: Tap into custom-tuned advisory plays on outbound outbound sales setups, packaging, and scale guidelines.
3. **Lead Finder & outreach manager**: Create cold outreach copies targeted at key prospects and keep track of CRM deals.
4. **Content Amplification (Content Tab)**: Spin up educational LinkedIn/X posts or specialized newsletters to establish authority in the ${industry} space.

**Your Action Plan:** Standardize your main service offering first, then generate a set of cold outbound email templates here in the outreach manager to fill your pipeline!`;
  }

  // Outreach pitching advice
  if (normalized.includes("outreach") || normalized.includes("pitch") || normalized.includes("lead") || normalized.includes("email")) {
    return `### ✉️ Elite B2B Outbound Formula for ${industry}

Outbound only fails when it's generic and lacks absolute relevance. Here is the exact blueprint we recommend for your vertical:

* **Values-First Positioning**: Never start with what you do. Start with a specific, observable bottleneck your prospects are experiencing.
* **standardized Hook**: Offer an ultra-low friction high-value asset for free (e.g., *"We mapped out a quick 3-step short-form video distribution strategy for [Company Name]. Can I drop the brief outline over here?"*).
* **Frictionless CTA**: Avoid asking for a 30-minute call. Ask a low-friction question: *"Would you be open to seeing the document?"* or *"Do mind if I send over a quick loom?"*

Use our **Outbound Campaign Generator** inside the outreach manager tab to instantly author copy optimized for these conversion loops.`;
  }

  // Default smart tactical agency response
  return `### ♟️ Scale OS Strategic Intelligence Playbook

Thank you for bringing your scaling goal to the table. As your **${industry} AI Coach**, let's tackle this from a premium systems perspective:

#### 1. Offer Packaging & "Productization"
To scale monthly recurring revenue past local limits, you must move away from generic quotes and hourly hourly billed proposals. 
* Standardize your focus into a flat-rate **Productized Service** (e.g., a *$3,500/mo* structured engagement with defined scopes).
* This eliminates custom proposal delays, protects your client delivery margins, and makes your billing highly predictable.

#### 2. Specialized Niche Targeting
Since you are oriented in the **${industry}** space, concentrate your focus on a tight sub-sector target client. This positions you as the ultimate specialist instead of a generic commodity agency.

#### 3. Lead Generation System
* **Inbound Authority**: Automatically draft educational social posts using our **Content Tab** to keep your profile warm.
* **Direct Outbound**: Generate multi-step cold sequences from our **outreach manager** targeting high-ticket buyers.

What specific objective can we map out next? We can design active outreach campaigns, standardize your pricing models, or draft a service proposal for a hot prospect.`;
}

// AI Assistant Chat endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, userProfile } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages parameter" });
    }

    const lastMsg = messages[messages.length - 1]?.text || "";
    const industryName = userProfile?.industry || "Marketing Agency";

    const client = getGeminiClient();
    if (!client) {
      // Return smart simulation when API key is missing
      const simulatedResponse = getSmartChatSimulation(lastMsg, industryName);
      return res.json({ text: simulatedResponse });
    }

    // Build chat context
    const systemInstruction = `You are the Agency Growth AI Coach and Advisor.
Your target users are professional agency owners:
- Marketing Agencies
- Web Design Agencies
- Recruiters
- Insurance Agents
- Mortgage Brokers

Your goal is to provide elite advisory services, helping them scale monthly recurring revenue (MRR), generate leads, streamline operations, or design better service offerings.
Current User Profile:
- Name: ${userProfile?.name || "Member"}
- Agency Company: ${userProfile?.company || "Growth Agency"}
- Vertical Specialty: ${industryName}

Keep answers punchy, tactical, structured with bullet points, and highly professional. Avoid generic AI fluff. Focus heavily on practical agency actions (pricing, niche selection, outbound sales formulas, and systems).`;

    // Process using ai.models.generateContent containing the chat state
    const promptContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    try {
      // Ensure we send valid parts structure
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text || "I was unable to formulate a response at this time." });
    } catch (apiError: any) {
      console.warn("Gemini Chat API call failed. Falling back to high-fidelity dynamic local simulation.", apiError);
      const simulatedResponse = getSmartChatSimulation(lastMsg, industryName);
      return res.json({ text: simulatedResponse });
    }
  } catch (error: any) {
    console.error("Gemini Chat API Outer Error:", error);
    res.status(500).json({ error: error.message || "Internal AI Server Error" });
  }
});

// Outreach Generator API endpoint
app.post("/api/ai/outreach", async (req, res) => {
  try {
    const { campaignType, industry, recipientName, companySize, customGoal } = req.body;
    
    const client = getGeminiClient();
    if (!client) {
      const simulatedText = `Subject: Quick question about ${industry || "operations"} structure at your agency

Hi ${recipientName || "[Name]"},

I noticed your team is scaling up efforts in the ${industry || "services"} space. Traditionally, teams face bottlenecks in direct outbound and content schedules.

We built a custom workflow engine specifically for agencies to solve this exact problem. Would you be open to a brief 7-minute exchange this Thursday at 2 PM to explore details?

Best regards,
[Name]`;
      return res.json({ text: simulatedText });
    }

    const typeLabels: Record<string, string> = {
      email: "Cold Engagement Email",
      linkedin: "High-Response LinkedIn Connection & Pitch Message",
      script: "Inbound/Outbound Phone Sales Script",
      followup: "Polite and conversion-driven Follow-up Sequence",
    };

    const prompt = `Develop a premium, custom-written, high-conversion outbound copy of type: "${typeLabels[campaignType] || campaignType}".
Target Vertical / Industry: ${industry || "Agency Consulting"}
Recipient Name: ${recipientName || "Prospective Client"}
Prospect Context/Details: Company size around ${companySize || "10-50"}, outreach objective: ${customGoal || "Book an exploratory call"}.

Provide:
1. If applicable, an engaging, clickable Subject Line (uniquely formatted).
2. The complete text of the copy ready for copy-pasting. Include professional placeholders like [Your Name], [Company], etc.
Ensure the tone is professional, hyper-targeted, values-first (not salesy or generic), and includes a strong, simple call-to-action (CTA). Avoid exclamation marks or spam keywords.`;

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite, high-ticket copywriter specializing in B2B outbound sales sequences for service professionals.",
          temperature: 0.8,
        },
      });

      res.json({ text: response.text || "Failed to generate outreach copy." });
    } catch (apiError: any) {
      console.warn("Gemini Outreach API call failed. Falling back to simulated copy.", apiError);
      const simulatedText = `Subject: Quick question about ${industry || "operations"} structure at your agency

Hi ${recipientName || "[Name]"},

I noticed your team is scaling up efforts in the ${industry || "services"} space. Traditionally, teams face bottlenecks in direct outbound and content schedules.

We built a custom workflow engine specifically for agencies to solve this exact problem. Would you be open to a brief 7-minute exchange this Thursday at 2 PM to explore details?

Best regards,
[Name]`;
      return res.json({ text: simulatedText });
    }
  } catch (error: any) {
    console.error("Gemini Outreach API Outer Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Social Content Generator API endpoint
app.post("/api/ai/content", async (req, res) => {
  try {
    const { type, industry, topic, tone } = req.body;

    const client = getGeminiClient();
    if (!client) {
      const simulatedText = `**The Scale Trap for ${industry} Professionals**

Most founders think getting more clients is the solution to their growth plateaus.
It's actually the fastest way to break your operations.

Here's why:
1. Custom deliverable creep kills gross margins.
2. Training juniors becomes a full-time bottleneck.
3. Your best talent spends all day in meetings instead of building.

The fix? Productize your main offering.
- Standard SOW
- Fixed timelines
- Transparent flat pricing

Agree? Let me know in the comments below. #AgencyScale #Growth`;
      return res.json({ text: simulatedText });
    }

    const typeLabels: Record<string, string> = {
      linkedin_post: "Highly engaging educational LinkedIn Post (with formatting, bullet points, and hashtags)",
      x_thread: "X (Twitter) Thread consisting of 4-5 numbered tweets, packed with density and value hooks",
      blog: "A comprehensive SEO-friendly Blog Article outline and core segments with catchy headings",
      newsletter: "A weekly Value-First Newsletter email targeting high-value subscribers",
      marketing_email: "An educational promo Marketing Email with an irresistible CTA",
    };

    const prompt = `Create a masterpiece content layout of type: "${typeLabels[type] || type}".
Specialized Industry Focus: ${industry || "B2B Agency"}
Topic or Primary Angle: ${topic || "scaling high-ticket client systems through systems automation"}
Aesthetic Tone: ${tone || "authoritative, insightful, modern SaaS leader"}

Formatting instructions:
- Ensure the content is structured and easy to digest.
- Incorporate white space, strong hooks, bullet points, and actionable take-aways.
- Do not state meta-narratives or explanations; output only the final copy.`;

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional Ghostwriter and Lead Generation content creator for service professionals, known for driving massive impressions and outbound inbound leads.",
          temperature: 0.7,
        },
      });

      res.json({ text: response.text || "Failed to generate social copy." });
    } catch (apiError: any) {
      console.warn("Gemini Content API call failed. Falling back to simulated social copy.", apiError);
      const simulatedText = `**The Scale Trap for ${industry} Professionals**

Most founders think getting more clients is the solution to their growth plateaus.
It's actually the fastest way to break your operations.

Here's why:
1. Custom deliverable creep kills gross margins.
2. Training juniors becomes a full-time bottleneck.
3. Your best talent spends all day in meetings instead of building.

The fix? Productize your main offering.
- Standard SOW
- Fixed timelines
- Transparent flat pricing

Agree? Let me know in the comments below. #AgencyScale #Growth`;
      return res.json({ text: simulatedText });
    }
  } catch (error: any) {
    console.error("Gemini Content API Outer Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Proposal Generator API endpoint
app.post("/api/ai/proposal", async (req, res) => {
  try {
    const { clientName, companyName, serviceTitle, scopeOfWork, estimatedCost } = req.body;

    const client = getGeminiClient();
    if (!client) {
      const simulatedText = `# SERVICE PROPOSAL & STATEMENT OF WORK (SOW)

**Prepared for:** ${clientName || "Client"} (${companyName || "Acme Partners"})
**Proposed by:** Agency Growth AI Suite
**Core Service:** ${serviceTitle || "Digital Acceleration Program"}

---

## 1. Executive Summary
This proposal outlines the strategic blueprint to deliver scalable systems, optimizing operational capacities and maximizing lead conversion velocity.

## 2. Definitive Scope of Work
${scopeOfWork || "System architecture blueprints, outbound campaign designs, content amplification rhythms, and dedicated CRM integration workflows."}

## 3. Milestones & Timeline
- **Phase 1: Discovery & Strategy Mapping** (Week 1-2)
- **Phase 2: Workflow Orchestration & Testing** (Week 3-4)
- **Phase 3: Launch, Support & Iterative Training** (Week 5)

## 4. Investment & Terms
Total Project Fee: **${estimatedCost || "$15,000 USD"}**
payment schedule: 50% upfront deposit / 50% upon final milestone sign-off.

---
*Authorized SOW Contract Version 1.0. Generated on Agency Growth AI platform.*`;
      return res.json({ text: simulatedText });
    }

    const prompt = `Write a high-end, highly persuasive, formal B2B Business Proposal & Scope of Work (SOW).
Client Owner Name: ${clientName || "Client Exec"}
Client Company Name: ${companyName || "Acme Corp"}
Service Title: ${serviceTitle || "Growth Engine Framework Implementation"}
Estimated Project Investment: ${estimatedCost || "to be defined in standard tier"}
Core Pillars of Scope of Work described by the user: "${scopeOfWork || "Design multi-channel outbound lead routines and deploy custom operational setups."}"

Structure the output exactly:
# SERVICE PROPOSAL & SOW
## 1. Executive Summary
## 2. Statement of Work (SOW) & Key Modules
## 3. Detailed Deliverables & Timeline
## 4. Financial Investment & Terms of Agreement
## 5. Next Steps & Sign-off

Make it incredibly professional, robust, ready to act as a legal contract structure, and write out each segment in detail with no abbreviations.`;

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite enterprise legal and sales engineer creating multi-million dollar SOWs and contracts for Fortune 500 service agencies.",
          temperature: 0.65,
        },
      });

      res.json({ text: response.text || "Failed to generate business proposal." });
    } catch (apiError: any) {
      console.warn("Gemini Proposal API call failed. Falling back to simulated proposal copy.", apiError);
      const simulatedText = `# SERVICE PROPOSAL & STATEMENT OF WORK (SOW)

**Prepared for:** ${clientName || "Client"} (${companyName || "Acme Partners"})
**Proposed by:** Agency Growth AI Suite
**Core Service:** ${serviceTitle || "Digital Acceleration Program"}

---

## 1. Executive Summary
This proposal outlines the strategic blueprint to deliver scalable systems, optimizing operational capacities and maximizing lead conversion velocity.

## 2. Definitive Scope of Work
${scopeOfWork || "System architecture blueprints, outbound campaign designs, content amplification rhythms, and dedicated CRM integration workflows."}

## 3. Milestones & Timeline
- **Phase 1: Discovery & Strategy Mapping** (Week 1-2)
- **Phase 2: Workflow Orchestration & Testing** (Week 3-4)
- **Phase 3: Launch, Support & Iterative Training** (Week 5)

## 4. Investment & Terms
Total Project Fee: **${estimatedCost || "$15,000 USD"}**
payment schedule: 50% upfront deposit / 50% upon final milestone sign-off.

---
*Authorized SOW Contract Version 1.0. Generated on Agency Growth AI platform.*`;
      return res.json({ text: simulatedText });
    }
  } catch (error: any) {
    console.error("Gemini Proposal API Outer Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Configure Vite or Static Asset delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Agency Growth AI] Server listening on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

startServer();
