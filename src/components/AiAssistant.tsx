/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from "react";
import {
  MessageSquareCode,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Send,
  Trash2,
  Cpu,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Brain,
  Layers,
  FileCheck,
  Lightbulb,
  Users,
  Target,
  Briefcase,
  AlertCircle,
  TrendingDown as SparkTrend,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { TargetIndustry, ChatMessage, Lead } from "../types";

interface AiAssistantProps {
  chatMessages: ChatMessage[];
  isSendingChat: boolean;
  chatInput: string;
  setChatInput: (val: string) => void;
  onSendMessage: (e?: React.FormEvent, customText?: string) => void;
  onResetHistory: () => void;
  userIndustry: TargetIndustry;
  userProfile: { name: string; email: string; company: string };
  isSupabaseConfigured: boolean;
  leads?: Lead[];
}

// Simple custom renderer to turn markdown-like structures into elegant rich HTML safely.
// This supports lists, bold headers, paragraphs, and monospace code segments contextually.
function renderMessageText(text: string) {
  if (!text) return "";

  // Split content by code blocks if any exist
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    // If it's a code block
    if (part.startsWith("```") && part.endsWith("```")) {
      const codeLines = part.slice(3, -3).trim().split("\n");
      const language = codeLines[0].match(/^[a-zA-Z0-9_-]+$/) ? codeLines[0] : "";
      const codeContent = language ? codeLines.slice(1).join("\n") : codeLines.join("\n");

      return (
        <div key={index} id={`code-block-${index}`} className="my-3 font-mono text-[11px] bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden text-neutral-300">
          {language && (
            <div className="bg-neutral-900 border-b border-neutral-800/80 px-4 py-1.5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-neutral-500">
              <span>{language}</span>
              <span className="text-[10px] font-normal lowercase">copyable blocks</span>
            </div>
          )}
          <pre className="p-4 overflow-x-auto select-text"><code>{codeContent}</code></pre>
        </div>
      );
    }

    // Process inline text, bold elements, lists, and linebreaks
    const lines = part.split("\n");
    return (
      <div key={index} className="space-y-2.5">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();

          // Heading representation ###
          if (trimmed.startsWith("###")) {
            return (
              <h4 key={lIdx} className="text-white font-bold text-xs font-sans tracking-wide mt-3 mb-1 uppercase text-indigo-400">
                {trimmed.replace(/^###\s*/, "")}
              </h4>
            );
          }
          if (trimmed.startsWith("##")) {
            return (
              <h3 key={lIdx} className="text-white font-extrabold text-sm font-sans tracking-tight mt-4 mb-2 text-indigo-300 border-b border-neutral-800/50 pb-1">
                {trimmed.replace(/^##\s*/, "")}
              </h3>
            );
          }
          if (trimmed.startsWith("#")) {
            return (
              <h2 key={lIdx} className="text-white font-black text-base font-sans tracking-tight mt-5 mb-3 text-white">
                {trimmed.replace(/^#\s*/, "")}
              </h2>
            );
          }

          // Bullet lists representation
          if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            const listContent = trimmed.replace(/^[-*]\s*/, "");
            // Resolve inline tags **bold** and `code`
            return (
              <ul key={lIdx} className="list-disc pl-4 text-xs text-neutral-300 font-sans my-1 space-y-1">
                <li>{resolveInlineStyles(listContent)}</li>
              </ul>
            );
          }

          // Numbered lists
          if (/^\d+\.\s/.test(trimmed)) {
            const listContent = trimmed.replace(/^\d+\.\s*/, "");
            const num = trimmed.match(/^(\d+)\./)?.[1] || "•";
            return (
              <div key={lIdx} className="flex gap-2.5 text-xs text-neutral-300 font-sans my-1.5 leading-relaxed pl-1">
                <span className="font-mono text-indigo-400 font-bold tracking-tight shrink-0">{num}.</span>
                <p className="flex-1">{resolveInlineStyles(listContent)}</p>
              </div>
            );
          }

          // Empty whitespace line
          if (trimmed === "") {
            return <div key={lIdx} className="h-2" />;
          }

          // Normal Paragraph paragraph
          return (
            <p key={lIdx} className="text-neutral-300 leading-relaxed font-sans text-xs">
              {resolveInlineStyles(trimmed)}
            </p>
          );
        })}
      </div>
    );
  });
}

// Inline styling solver for **bold text** and `monospace` tags
function resolveInlineStyles(text: string) {
  const words = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return words.map((chunk, index) => {
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      return (
        <strong key={index} className="text-white font-semibold">
          {chunk.slice(2, -2)}
        </strong>
      );
    }
    if (chunk.startsWith("`") && chunk.endsWith("`")) {
      return (
        <code key={index} className="font-mono text-[11px] bg-neutral-900 border border-neutral-800 text-indigo-300 px-1.5 py-0.5 rounded">
          {chunk.slice(1, -1)}
        </code>
      );
    }
    return chunk;
  });
}

export default function AiAssistant({
  chatMessages,
  isSendingChat,
  chatInput,
  setChatInput,
  onSendMessage,
  onResetHistory,
  userIndustry,
  userProfile,
  isSupabaseConfigured,
  leads
}: AiAssistantProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [mobileTab, setMobileTab] = React.useState<"chat" | "playbooks">("chat");

  const [selectedLeadId, setSelectedLeadId] = React.useState<string>("");
  const [isPanelExpanded, setIsPanelExpanded] = React.useState<boolean>(true);

  // Get leads of interest
  const relevantLeads = React.useMemo(() => {
    if (!leads || leads.length === 0) return [];
    // Prioritize leads matching the user's specialization or with valid industry fields
    const matching = leads.filter(l => l.industry?.trim() !== "");
    return matching.length > 0 ? matching : leads;
  }, [leads]);

  useEffect(() => {
    if (relevantLeads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(relevantLeads[0].id);
    }
  }, [relevantLeads, selectedLeadId]);

  const selectedLead = relevantLeads.find(l => l.id === selectedLeadId) || relevantLeads[0];

  const getLeadNicheIntelligence = (lead: Lead) => {
    const normInd = (lead.industry || "").toLowerCase();
    
    if (normInd.includes("commerce") || normInd.includes("retail") || normInd.includes("shop")) {
      return {
        nicheTitle: "E-Commerce Retail",
        bottlenecks: "Rising CAC on paid channels, creative ad fatigue, cart abandonment spikes on Shopify platforms.",
        hook: `Hey ${lead.name}, notice creative scale fatigue in your ${lead.company} campaigns? We designed high-converting UGC creator hooks that slash CAC by 35% without up-front retainer fees if we underdeliver. Open for a brief look?`,
        pricing: "$2,500/mo base flat + 5% of net profit growth.",
        objections: "Objection: Our gross margins are tight. Response: We tie fee expansion to verifiable Shopify revenue ticks."
      };
    }
    if (normInd.includes("health") || normInd.includes("wellness") || normInd.includes("fit")) {
      return {
        nicheTitle: "Health & Wellness Niche",
        bottlenecks: "Hyper-local member enrollment limits, standard membership churn, off-peak class emptiness.",
        hook: `Hi ${lead.name}, mapped an automated local reservation lead collection map for ${lead.company}. It activates idle database records within 90 seconds. Mind if I send a 2-minute Loom on how it works?`,
        pricing: "$3,000/mo flat fee with 15 guaranteed local leads.",
        objections: "Objection: Word-of-mouth is enough. Response: Consistent local booking engines remove seasonal enrollment anxiety."
      };
    }
    if (normInd.includes("saas") || normInd.includes("software") || normInd.includes("dev")) {
      return {
        nicheTitle: "SaaS & Software Platforms",
        bottlenecks: "Sign-up flow user drop-offs, slow proof-of-value demonstrations, complex onboarding interfaces.",
        hook: `Hi ${lead.name}, loved the ${lead.company} user interface. Notice there's no interactive walkthrough. We build standard sandbox guides boosting trial conversions by 22%. Mind if I send the preview wireframe?`,
        pricing: "$4,500/mo covering full UX conversion auditing.",
        objections: "Objection: Our engineers can build this. Response: True, but taking core product cycles off roadmap features delays major releases."
      };
    }
    if (normInd.includes("law") || normInd.includes("legal") || normInd.includes("injury")) {
      return {
        nicheTitle: "Legal & Professional Services",
        bottlenecks: "Exorbitant cost-per-click on Google Ads, non-optimized maps profiles, low lead callback times.",
        hook: `Dear ${lead.name}, audited regional injury traffic search rankings for ${lead.company}. Competitors are absorbing 350+ monthly organic clicks of local claims. Let me share our map audit report?`,
        pricing: "$3,500/mo for dedicated search maps engine setup.",
        objections: "Objection: We rely strictly on referrals. Response: Local SEO ensures your group selectively chooses high-margin cases."
      };
    }
    return {
      nicheTitle: lead.industry || "Target B2B Industry",
      bottlenecks: "Weak customer-facing hooks, lack of standardized pricing, fluctuating pipeline throughputs.",
      hook: `Hello ${lead.name || "[Name]"}, saw your profile at ${lead.company || "[Company]"}. Most ${lead.industry || "related fields"} struggle with consistent retainer growth. We designed a scale template specifically for this. Open to a brief 7-minute exchange?`,
      pricing: "$3,000/mo flat-rate retainer for outbound setup.",
      objections: "Objection: We don't have budget now. Response: Our outbound campaigns are designed to pay for themselves within 30 days."
    };
  };

  const nicheInfo = selectedLead ? getLeadNicheIntelligence(selectedLead) : null;

  const triggerCoachQuery = (type: "bottleneck" | "pitch" | "pricing" | "objections") => {
    if (!selectedLead || !nicheInfo) return;
    
    let queryPrompt = "";
    
    switch (type) {
      case "bottleneck":
        queryPrompt = `As my growth advisor, analyze the specific target niche of my lead ${selectedLead.name} from ${selectedLead.company} which operates in the "${selectedLead.industry}" space. 
Their specific bottleneck involves: ${nicheInfo.bottlenecks}. 
Provide an explicit strategy checklist covering how I can address this pain point using standardized retainer services in my ${userIndustry} specialty.`;
        break;
      case "pitch":
        queryPrompt = `Write an elite, custom B2B cold outbound pitch or email hook targeted at ${selectedLead.name} (${selectedLead.email || "CEO"}) at ${selectedLead.company}. 
The specialty is ${userIndustry} and they operate in "${selectedLead.industry}".
Integrate this exact customized approach: "${nicheInfo.hook}". Keep it short, conversational, and direct with a frictionless low-temp call-to-action.`;
        break;
      case "pricing":
        queryPrompt = `Help me structure a premium productized pricing model for ${selectedLead.company}. 
Their industry/niche is "${selectedLead.industry}".
Our baseline suggested pricing is: ${nicheInfo.pricing}. 
Please elaborate on specific client milestones, SOW boundaries, and upsell pathways I can pitch to secure a solid contract.`;
        break;
      case "objections":
        queryPrompt = `Prepare high-converting scripts to handle standard sales objections from ${selectedLead.name} at ${selectedLead.company} ("${selectedLead.industry}").
They typically object like this: "${nicheInfo.objections}".
Give me 3 alternate conversational responses that handle budget/trust friction and redirect back to standard value metrics.`;
        break;
    }
    
    // Auto submit to coach terminal
    onSendMessage(undefined, queryPrompt);
  };

  // Auto scroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isSendingChat]);

  // Copy helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Specialized playbooks tailored explicitly on active operating profile
  const playbooksByIndustry: Record<TargetIndustry, { title: string; desc: string; prompt: string; icon: any }[]> = {
    [TargetIndustry.MARKETING]: [
      {
        title: "Value Retention Matrix",
        desc: "Pitch and transition a client from $500 setups to $3k/mo packages.",
        prompt: "Analyze our marketing delivery setup and explain step-by-step how to transition a standard client from a one-time $500 campaign setup to a recurring $3,000/mo retainer using performance UGC loops.",
        icon: TrendingUp
      },
      {
        title: "Gross Margin Audit",
        desc: "Evaluate labor and delivery overhead to safeguard a 70% gross profitability.",
        prompt: "Draft an operational analysis checklist to audit our marketing agency labor. How do we ensure custom delivery fits inside a 70% target gross profit margin?",
        icon: FileCheck
      },
      {
        title: "Retention Checklist",
        desc: "Key metrics and retention processes to avoid retention slide.",
        prompt: "Provide a weekly retention audit sequence for marketing retainers to prevent client churn and expand lifetime contract value.",
        icon: Layers
      }
    ],
    [TargetIndustry.WEB_DESIGN]: [
      {
        title: "Flat-rate Productization",
        desc: "Standardize loose hourly redesign tasks into flat $6k proposals.",
        prompt: "Construct a comprehensive guide standardizing custom, unpredictable hourly WordPress redesign scopes into premium flat-rate flat-price Webflow migrations starting at $6,000 with clear tier deliverables.",
        icon: Layers
      },
      {
        title: "SEO Redesign Upsell",
        desc: "Pitch recurring search engine authority scopes immediately post-launch.",
        prompt: "Create a persuasive B2B email proposal draft to upsell a monthly $1,500 SEO / speed maintenance contract to a client for whom we just completed a primary web redesign project.",
        icon: Sparkles
      },
      {
        title: "Design System Handoff",
        desc: "Document modern client assets step-by-step to prevent endless revisions.",
        prompt: "How can I package and deliver Figma/Webflow assets with a standardized video checkoff list to completely prevent endless post-launch design feedback revisions?",
        icon: FileCheck
      }
    ],
    [TargetIndustry.RECRUITMENT]: [
      {
        title: "Contingent to Retained",
        desc: "Draft communication briefs persuading founders to commit retainer pricing.",
        prompt: "Draft a high-conversion message/script to pitch a retained executive search agreement to a fast-growing tech founder who only wants to work on standard contingent fee terms.",
        icon: Brain
      },
      {
        title: "No-placement Preview Offer",
        desc: "Structure pre-vetted developer shortlists to acquire pilot clients.",
        prompt: "Explain how to package and structure a 'risk-free talent preview shortlist' offering Senior React/Node engineers, using this as cold outreach leverage to attract premium high-ticket tech corporate client accounts.",
        icon: BookOpen
      },
      {
        title: "Retainer SOW Framework",
        desc: "Clauses and structure for retained exclusive recruitment.",
        prompt: "Outline the key scope modules and financial incentive structures for a retained executive search SOW that aligns recruiters and client milestones.",
        icon: FileCheck
      }
    ],
    [TargetIndustry.INSURANCE]: [
      {
        title: "Commercial Fleet Upsell",
        desc: "Cross-sell comprehensive commercial vehicle umbrella coverage scripts.",
        prompt: "Give me a persuasive agent script and email template designed to cross-sell comprehensive commercial vehicle or umbrella protection to our pre-existing commercial logistics clients.",
        icon: TrendingUp
      },
      {
        title: "Interactive Risk Audits",
        desc: "Lead acquisition workflow offering physical storefront audits.",
        prompt: "Detail an interactive property risk audit system we can leverage as a free value offer for local storefront and manufacturing clients to seamlessly cross-sell liability coverage.",
        icon: Brain
      },
      {
        title: "Premium Retention Rhythms",
        desc: "Policy renewal sequence to preserve multi-year commission lines.",
        prompt: "Provide a 45-day commercial policy renewal checkoff list and notification template that keeps customer loyalty high and avoids competing premium broker shopping.",
        icon: Layers
      }
    ],
    [TargetIndustry.MORTGAGE]: [
      {
        title: "Jumbo Lock Proposals",
        desc: "Pitch corporate software directors on high-yield rate-lock features.",
        prompt: "Draft a premium outreach presentation letter pitching corporate leaders and high-earning SaaS directors on standardizing customized Jumbo rate lock packages for their relocation programs.",
        icon: BookOpen
      },
      {
        title: "Realtor Partner Pitch",
        desc: "Structure co-branded pre-approval sequences with high-volume agents.",
        prompt: "Create an irresistible outbound email sequence pitching high-volume local Realtors on entering a highly integrated, automated joint-marketing co-branding system for fast pre-approvals.",
        icon: Sparkles
      },
      {
        title: "Origination Velocity Guide",
        desc: "Reduce application-to-close bottlenecks with interactive document collections.",
        prompt: "What is an elite operational process with templates to cut origination friction, getting client credit and assets documented in under 24 hours to secure fast loan locking?",
        icon: FileCheck
      }
    ]
  };

  const activePlaybooks = playbooksByIndustry[userIndustry] || playbooksByIndustry[TargetIndustry.MARKETING];

  return (
    <div id="ai-strategic-workspace" className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* Mobile-only Segmented Dual Tab Switcher */}
      <div id="ai-advisor-segmented-control" className="lg:hidden flex border border-white/10 rounded-xl bg-zinc-950/60 p-1 mb-4 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab("chat")}
          className={`flex-1 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-2 ${
            mobileTab === "chat"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquareCode className="w-4 h-4" />
          <span>Coach Terminal ({chatMessages.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("playbooks")}
          className={`flex-1 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-2 ${
            mobileTab === "playbooks"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Playbook Prompts</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-5 lg:gap-6">
        {/* 1. Left Strategic Control Rail */}
        <section className={`col-span-12 lg:col-span-4 bg-[#111113] border border-white/10 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto h-full ${
          mobileTab === "playbooks" ? "flex" : "hidden lg:flex"
        }`}>
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Acquisition Playbooks</h2>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Vertical-tailored strategy prompt catalysts</p>
              </div>
            </div>

            {/* Model Status Badge */}
            <div className="mb-6 p-3 bg-zinc-950/60 border border-neutral-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">Core Engine Channel</span>
                <span className="text-[10px] font-semibold text-indigo-400 font-mono">Gemini 3.5 Flash</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? "bg-teal-500 animate-pulse" : "bg-indigo-500"}`} />
                <p className="text-[10.5px] text-slate-300 font-sans leading-tight">
                  {isSupabaseConfigured 
                    ? "Production ready with enterprise API keys"
                    : "Sandbox Simulation Mode. Connected with fallback parameters."}
                </p>
              </div>
            </div>

            {/* Preset Playbook Catalog */}
            <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase block mb-3 pl-1">Catalysts For {userProfile.company || "Your Agency"}</span>
            <div className="space-y-3">
              {activePlaybooks.map((book, idx) => {
                const BookIcon = book.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setChatInput(book.prompt);
                      setMobileTab("chat"); // Auto focus back to the terminal view
                    }}
                    className="w-full text-left p-3.5 rounded-xl border border-white/5 bg-zinc-900/30 hover:bg-neutral-900/90 hover:border-indigo-500/40 transition-all cursor-pointer group flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-950 group-hover:text-indigo-400 transition-colors">
                      <BookIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors block truncate">{book.title}</span>
                        <ArrowRight className="w-3 h-3 text-neutral-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 font-sans leading-relaxed">{book.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tactical Note */}
          <div className="mt-6 pt-4 border-t border-white/5 bg-zinc-950/20 rounded-xl p-3">
            <div className="flex items-start gap-2.5 text-[10px] text-neutral-400 leading-normal font-sans">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p>
                Your current profile specializes in <b>{userIndustry}</b>. Our strategic models automatically ingest this active niche to provide tailored contract guidelines and tactical outbound templates.
              </p>
            </div>
          </div>

        </section>

        {/* 2. Interactive Strategic Chat Terminal Interface */}
        <section className={`col-span-12 lg:col-span-8 bg-[#111113] border border-white/10 rounded-2xl flex flex-col h-full overflow-hidden ${
          mobileTab === "chat" ? "flex" : "hidden lg:flex"
        }`}>
        {/* Terminal Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-zinc-950/20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">Strategic Coach Terminal</h2>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">Active session: {userProfile.name} • {userIndustry}</p>
            </div>
          </div>
          <button
            onClick={onResetHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-[10px] font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Reset History</span>
          </button>
        </div>

        {/* Niche & Lead Interactive Strategy Navigator */}
        <div className="border-b border-white/5 bg-[#141416]/95 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white font-sans">Target Lead Intelligence Hub</span>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20 px-1.5 py-0.5 rounded-full uppercase">Interactive</span>
            </div>
            
            {/* Quick selector of lead */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-400 font-sans">Select Lead:</span>
              {relevantLeads.length === 0 ? (
                <span className="text-[10px] text-slate-500 italic">No Leads Available</span>
              ) : (
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="bg-neutral-900 border border-white/10 rounded-lg text-[11px] p-1.5 px-2.5 text-white font-sans max-w-[200px] focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {relevantLeads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.company} ({l.name})
                    </option>
                  ))}
                </select>
              )}
              
              <button
                type="button"
                onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                className="p-1.5 px-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-[10px] flex items-center gap-1 transition-colors border border-white/10 cursor-pointer"
              >
                {isPanelExpanded ? (
                  <>
                    <span>Hide Facts</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Show facts</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {selectedLead && isPanelExpanded && nicheInfo && (
            <div className="bg-zinc-950/45 border border-white/5 rounded-xl p-3.5 space-y-3.5 font-sans transition-all">
              {/* Info summary row */}
              <div className="grid grid-cols-12 gap-3 pb-3 border-b border-white/5">
                <div id="p-lead-name" className="col-span-12 sm:col-span-4">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">Prospect Contact</span>
                  <p className="text-[11.5px] font-bold text-white mt-0.5">{selectedLead.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedLead.email || "No email"}</p>
                </div>
                <div id="p-lead-niche" className="col-span-12 sm:col-span-4">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">Lead Specialty Industry</span>
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-indigo-400 font-semibold bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
                    <Target className="w-3 h-3" />
                    {selectedLead.industry || "General Niche"}
                  </span>
                </div>
                <div id="p-lead-status" className="col-span-12 sm:col-span-4">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">Active CRM Stage</span>
                  <span className={`inline-block text-[10.5px] font-medium font-mono mt-1 ${
                    selectedLead.status === "Won" 
                      ? "text-teal-400" 
                      : selectedLead.status === "Proposal Sent" 
                      ? "text-amber-400" 
                      : "text-blue-400"
                  }`}>
                    ● {selectedLead.status}
                  </span>
                </div>
              </div>

              {/* Useful Information Section */}
              <div id="p-lead-intel" className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1 text-[11.5px] leading-relaxed">
                <div className="p-3 bg-neutral-900/30 rounded-lg border border-neutral-800/40">
                  <div className="flex items-center gap-1.5 text-neutral-400 font-semibold mb-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Niche Vulnerabilities & Bottlenecks</span>
                  </div>
                  <p className="text-neutral-300 font-sans text-[11px] leading-relaxed">{nicheInfo.bottlenecks}</p>
                </div>
                
                <div className="p-3 bg-neutral-900/30 rounded-lg border border-neutral-800/40">
                  <div className="flex items-center gap-1.5 text-neutral-400 font-semibold mb-1.5">
                    <SparkTrend className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recommended Retainer Target</span>
                  </div>
                  <p className="text-zinc-300 font-sans text-[11px] leading-relaxed">{nicheInfo.pricing}</p>
                </div>
              </div>

              {/* Action query triggers */}
              <div className="pt-2 border-t border-white/5">
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-2">Problem Solving Commands (Submits to Strategic Coach)</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => triggerCoachQuery("bottleneck")}
                    className="p-2.5 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group shadow-sm"
                  >
                    <HelpCircle className="w-4 h-4 text-indigo-400 group-hover:text-white shrink-0" />
                    <span>Solve Bottlenecks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerCoachQuery("pitch")}
                    className="p-2.5 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group shadow-sm"
                  >
                    <Send className="w-4 h-4 text-emerald-400 group-hover:text-white shrink-0" />
                    <span>Draft Outbound Hook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerCoachQuery("pricing")}
                    className="p-2.5 bg-amber-600/10 hover:bg-amber-600 border border-amber-500/20 hover:border-amber-500 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group shadow-sm"
                  >
                    <Briefcase className="w-4 h-4 text-amber-400 group-hover:text-white shrink-0" />
                    <span>Structure Proposal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerCoachQuery("objections")}
                    className="p-2.5 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-rose-400 group-hover:text-white shrink-0" />
                    <span>Handle Objections</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Feeds Area */}
        <div 
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800 bg-[#0b141a] relative"
          style={{
            backgroundImage: "radial-gradient(rgba(0, 92, 75, 0.08) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px"
          }}
        >
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 z-10 relative">
              <div className="w-12 h-12 bg-indigo-950/50 border border-indigo-900/30 text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquareCode className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-white">Advisory Pipeline Standby</h3>
              <p className="text-xs text-neutral-400 max-w-sm mt-1.5 leading-relaxed font-sans">
                Type your strategy question or select one of our premium acquisition playbooks on the left sidebar to calibrate model frameworks immediately.
              </p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div key={msg.id} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                  {/* WhatsApp style balloon */}
                  <div className={`p-3.5 px-4 rounded-xl max-w-[90%] sm:max-w-[80%] relative shadow-md group ${
                    isUser 
                      ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none" 
                      : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                  }`}>
                    {/* Render helper */}
                    <div className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {renderMessageText(msg.text)}
                    </div>

                    {/* Integrated WhatsApp info row */}
                    <div className="mt-2 flex items-center justify-end gap-1.5 text-[9px] text-[#8696a0] select-none font-mono float-right">
                      {/* Quiet Copy Trigger */}
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity bg-black/25 px-1.5 py-0.5 rounded cursor-pointer mr-1 text-[8.5px] font-sans font-medium"
                      >
                        {copiedId === msg.id ? "Copied!" : "Copy"}
                      </button>
                      
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      {isUser && (
                        <span className="text-[#53bdeb] text-[10px] font-bold select-none font-sans">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isSendingChat && (
            <div className="flex w-full justify-start">
              <div className="p-3 px-4 rounded-xl max-w-[85%] sm:max-w-[70%] bg-[#202c33] text-[#e9edef] rounded-tl-none shadow-md animate-pulse">
                <div className="flex items-center gap-2 py-1">
                  <div className="flex gap-1 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[10px] text-[#8696a0] font-sans font-semibold tracking-wider">Ria'S Scale AI is formulating strategy...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input submission footer block */}
        <form onSubmit={onSendMessage} className="p-4 border-t border-white/5 bg-zinc-950/30 flex gap-3 shrink-0 items-center">
          <input
            type="text"
            required
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`e.g. How to overcome the scaling bottleneck under ${userIndustry} with standard deliverables?`}
            className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/5 border border-white/10 rounded-xl text-xs p-3.5 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={isSendingChat || !chatInput.trim()}
            className="p-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </section>
      </div>

    </div>
  );
}
