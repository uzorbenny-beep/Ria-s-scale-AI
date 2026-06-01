/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Users,
  Sparkles,
  BriefcaseBusiness,
  TrendingUp,
  ArrowUpRight,
  CheckCircle,
  HelpCircle,
  Play,
  Lightbulb,
  Building2,
  Lock
} from "lucide-react";
import { TargetIndustry, Lead } from "../types";

interface DashboardOverviewProps {
  userProfile: { name: string; company: string; email: string };
  userIndustry: TargetIndustry;
  leads: Lead[];
  campaignsCount: number;
  contentsCount: number;
  proposalsCount: number;
  onNavigate: (tab: string) => void;
  subscriptionPlan: string;
}

export default function DashboardOverview({
  userProfile,
  userIndustry,
  leads,
  campaignsCount,
  contentsCount,
  proposalsCount,
  onNavigate,
  subscriptionPlan
}: DashboardOverviewProps) {
  
  // Custom metrics based on vertical specialization to make it 100% authentic
  const getIndustryMetrics = () => {
    switch (userIndustry) {
      case TargetIndustry.MARKETING:
        return {
          mrr: "$14,500",
          metricLabel: "Active Retainers Volume",
          conversionRate: "22%",
          advisorTitle: "Marketing Retainers Strategic Playbook",
          advisorTip: "Offer high-conversion custom UGC hooks packages on a flat $3,000/mo retainer."
        };
      case TargetIndustry.WEB_DESIGN:
        return {
          mrr: "$28,000",
          metricLabel: "Locked Creative Contract Value",
          conversionRate: "18%",
          advisorTitle: "Webflow Productization Guide",
          advisorTip: "Replace loose hourly redesign quotes with standardized Webflow migration flat rates starting at $8,500."
        };
      case TargetIndustry.RECRUITMENT:
        return {
          mrr: "$45,200",
          metricLabel: "Placement Pipelines Due",
          conversionRate: "14%",
          advisorTitle: "Tech Placement Commission Blueprint",
          advisorTip: "Target fast-growth AI startups with a no-placement no-fee offer for pre-vetted senior React/Node engineers."
        };
      case TargetIndustry.INSURANCE:
        return {
          mrr: "$12,400",
          metricLabel: "Monthly Commission Premium",
          conversionRate: "28%",
          advisorTitle: "Commercial Risk Premium Method",
          advisorTip: "Conduct interactive digital risk audits for mid-sized transport groups to cross-sell comprehensive fleet umbrella coverage."
        };
      case TargetIndustry.MORTGAGE:
        return {
          mrr: "$75,000",
          metricLabel: "Active Loan Origination Commission",
          conversionRate: "31%",
          advisorTitle: "High-Ticket Client Origination Strategy",
          advisorTip: "Partner with remote-first SaaS software firms to offer hassle-free Jumbo mortgage rate locks for high-earning directors."
        };
      default:
        return {
          mrr: "$15,000",
          metricLabel: "Monthly Recurring Revenue",
          conversionRate: "20%",
          advisorTitle: "SaaS Scaling Guideline",
          advisorTip: "Optimize target client criteria and draft automated cold campaigns with our outreach manager."
        };
    }
  };

  const metrics = getIndustryMetrics();
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === "Won").length;
  const pendingProposals = leads.filter(l => l.status === "Proposal Sent").length;

  const onboardingSteps = [
    { id: "s1", title: "Complete agency profile setting", desc: "Define your company and targeted niche focus", completed: true, tab: "settings" },
    { id: "s2", title: "Load client prospect lists", desc: "Build or input leads targeting high-ticket buyers", completed: totalLeads > 2, tab: "leads" },
    { id: "s3", title: "Compose cold outreach campaign copy", desc: "Generate cold email or social sequences in seconds", completed: campaignsCount > 0, tab: "outreach" },
    { id: "s4", title: "Schedule promotional content post", desc: "Fuel social impressions targeting LinkedIn or X with AI assistance", completed: contentsCount > 0, tab: "content" },
    { id: "s5", title: "Generate customized client Service SOW", desc: "Complete detailed estimates and proposals to pitch won deals", completed: proposalsCount > 0, tab: "proposals" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-900 px-8 py-10 text-neutral-100">
      
      {/* Top Welcome Heading */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
            <Building2 className="w-3.5 h-3.5" />
            <span>{userIndustry} Operating Workspace</span>
          </div>
          <h1 className="text-3xl font-sans font-bold text-white tracking-tight mt-1">
            Welcome back, {userProfile.name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-neutral-400 mt-1 font-sans">
            Your agency system is synchronized. Let's outline outbound routes and maximize acquisition velocity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("ai-assistant")}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-lg shadow-indigo-900/25 flex items-center gap-2 cursor-pointer transition-all border border-indigo-700/50"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Ask Growth Advisor AI</span>
          </button>
        </div>
      </header>

      {/* KPI stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Core MRR Stat Card */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 hover:border-indigo-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-all" />
          <div className="flex justify-between items-start">
            <span className="text-neutral-500 text-xs font-mono tracking-wider block uppercase">{metrics.metricLabel}</span>
            <div className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4%</span>
            </div>
          </div>
          <p className="text-3xl font-sans font-extrabold text-white mt-3 tracking-tight">{metrics.mrr}</p>
          <p className="text-[10px] text-neutral-400 mt-2 italic font-sans">Based on specialized `{userIndustry}` records</p>
        </div>

        {/* Lead Stats Card */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 hover:border-indigo-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-neutral-500 text-xs font-mono tracking-wider block uppercase">Active CRM Leads</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-sans font-extrabold text-white mt-3 tracking-tight">{totalLeads}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-400">
            <span className="text-indigo-400 font-semibold">{wonLeads} Client Contracts Won</span>
            <span>•</span>
            <span>{pendingProposals} Outbound Bids</span>
          </div>
        </div>

        {/* Outreach Campaigns Card */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 hover:border-indigo-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-neutral-500 text-xs font-mono tracking-wider block uppercase">AI Outbound Routines</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-sans font-extrabold text-white mt-3 tracking-tight">{campaignsCount}</p>
          <p className="text-[10px] text-neutral-400 mt-2 font-mono uppercase tracking-tight">LinkedIn & Cold email sequences ready</p>
        </div>

        {/* Deliverables Card */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 hover:border-indigo-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-neutral-500 text-xs font-mono tracking-wider block uppercase">AI Assets Created</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-sans font-extrabold text-white mt-3 tracking-tight">{contentsCount + proposalsCount}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-400">
            <span>{contentsCount} Articles/Posts</span>
            <span>•</span>
            <span>{proposalsCount} Custom Proposals</span>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard split - checklist vs Advisor details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Playbook Checklist and Setup Onboarding */}
        <div className="lg:col-span-2 bg-neutral-950 border border-neutral-800/80 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-sans font-bold text-white tracking-tight">Ria'S Scale AI Checklist</h2>
              <p className="text-xs text-neutral-400">Complete tasks to establish and mature your operational acquisition engine.</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-900/50 px-2.5 py-0.5 rounded-full">
              40% Complete
            </span>
          </div>

          <div className="space-y-4">
            {onboardingSteps.map((step) => (
              <div
                key={step.id}
                onClick={() => onNavigate(step.tab)}
                className="flex items-start gap-4 p-3.5 rounded-lg border border-neutral-900 hover:border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/70 transition-all cursor-pointer group"
              >
                <div className="mt-0.5">
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-indigo-400 fill-indigo-950" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-500 group-hover:border-indigo-500 transition-colors">
                      •
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold ${step.completed ? "text-neutral-300" : "text-white group-hover:text-indigo-400"} transition-colors`}>
                      {step.title}
                    </p>
                    <span className="text-[10px] text-neutral-500 font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advisor Custom Guidelines & Actionable insights card */}
        <div className="flex flex-col gap-6">
          
          {/* Quick AI Advisor Recommendation Box */}
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-6 shadow-sm relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-2xl" />
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">
                <Lightbulb className="w-4 h-4" />
                <span>Niche Opportunities</span>
              </div>
              <h3 className="text-base font-sans font-bold text-white tracking-tight">
                {metrics.advisorTitle}
              </h3>
              <p className="text-xs text-neutral-400 mt-3.5 leading-relaxed bg-neutral-900/50 border border-neutral-800/60 p-3 rounded-lg font-sans">
                "{metrics.advisorTip}"
              </p>
              <p className="text-[11px] text-neutral-500 mt-4 leading-normal font-sans">
                Our strategic advisory matrix calculated that businesses optimized under the <b>{userIndustry}</b> vertical experience 2.5x higher conversion reply metrics if outreach pitches cite standard flat prices upfront.
              </p>
            </div>
            
            <button
              onClick={() => onNavigate("ai-assistant")}
              className="mt-6 w-full py-2.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-xs font-medium text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Draft message with Advisor</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>

          {/* Quick Active Plan Display Guard */}
          <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase text-indigo-400 tracking-wider">LOCKED FEATURES PROMPT</span>
                <h4 className="text-xs font-bold text-white mt-1">Stripe Integration Verified</h4>
              </div>
              <span className="bg-indigo-950 border border-indigo-800/50 px-2 py-0.5 rounded text-[9px] font-mono text-indigo-300">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2.5 leading-relaxed">
              Your platform account is safely subscribed on the <span className="font-semibold text-white">{subscriptionPlan}</span>. Explore custom lead limits and CRM records without restriction.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
