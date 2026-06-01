/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Briefcase,
  ChevronRight,
  Building,
  Mail,
  MoreVertical,
  Activity,
  Award,
  AlertCircle
} from "lucide-react";
import { Lead, TargetIndustry } from "../types";

interface CrmBoardProps {
  leads: Lead[];
  userIndustry: TargetIndustry;
  onUpdateLeadStatus: (id: string, status: Lead["status"]) => void;
}

const STAGES: Lead["status"][] = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost"
];

export default function CrmBoard({ leads, userIndustry, onUpdateLeadStatus }: CrmBoardProps) {
  const [boardIndustryFilter, setBoardIndustryFilter] = useState<string>("all");

  // Filter leads according to selected industry
  const filteredLeads = leads.filter((lead) => {
    return boardIndustryFilter === "all" || lead.industry === boardIndustryFilter;
  });

  const getStageHeaderStyle = (stage: Lead["status"]) => {
    switch (stage) {
      case "New Lead":
        return "border-t-2 border-t-blue-500 text-blue-400 bg-blue-550/5";
      case "Contacted":
        return "border-t-2 border-t-purple-500 text-purple-400 bg-purple-550/5";
      case "Qualified":
        return "border-t-2 border-t-indigo-500 text-indigo-400 bg-indigo-550/5";
      case "Proposal Sent":
        return "border-t-2 border-t-teal-500 text-teal-400 bg-teal-555/5";
      case "Won":
        return "border-t-2 border-t-emerald-500 text-emerald-400 bg-emerald-555/5";
      case "Lost":
        return "border-t-2 border-t-rose-500 text-rose-400 bg-rose-555/5";
      default:
        return "border-t-2 border-t-neutral-500 text-neutral-400";
    }
  };

  const getStageMetricSymbol = (stage: Lead["status"]) => {
    switch (stage) {
      case "New Lead":
        return "✨";
      case "Contacted":
        return "💬";
      case "Qualified":
        return "🔍";
      case "Proposal Sent":
        return "📄";
      case "Won":
        return "🎉";
      case "Lost":
        return "⚠️";
    }
  };

  // Move lead to the next logical stage
  const handleMoveForward = (lead: Lead) => {
    const currentIdx = STAGES.indexOf(lead.status);
    if (currentIdx < STAGES.length - 1) {
      onUpdateLeadStatus(lead.id, STAGES[currentIdx + 1]);
    }
  };

  // Move lead to the previous logical stage
  const handleMoveBackward = (lead: Lead) => {
    const currentIdx = STAGES.indexOf(lead.status);
    if (currentIdx > 0) {
      onUpdateLeadStatus(lead.id, STAGES[currentIdx - 1]);
    }
  };

  const uniqueIndustries = Array.from(new Set(leads.map((l) => l.industry)));

  return (
    <div id="crm-kanban-root" className="space-y-6">
      
      {/* 1. Control & KPI Header */}
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-indigo-950 text-indigo-400 font-mono font-bold tracking-widest px-2 py-0.5 rounded border border-indigo-900/30 uppercase">
              Sales Pipeline
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-400">
              <Activity className="w-3.5 h-3.5" />
              <span>Interactive Kanban tracking system</span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">SOW Lifecycle Kanban Board</h2>
          <p className="text-xs text-slate-400 mt-1">
            Drag-less lifecycle card progression tracking. Expand business accounts down the acquisition pipeline.
          </p>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 select-none">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 hidden lg:inline">Filter Pipeline:</span>
          <select
            value={boardIndustryFilter}
            onChange={(e) => setBoardIndustryFilter(e.target.value)}
            className="w-full md:w-56 bg-zinc-950 border border-white/10 text-xs py-2 px-3.5 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer font-sans"
          >
            <option value="all">📁 All Industries ({leads.length})</option>
            <option value={userIndustry}>{userIndustry} (Focus)</option>
            {uniqueIndustries
              .filter((ind) => ind !== userIndustry)
              .map((ind, idx) => (
                <option key={idx} value={ind}>
                  {ind}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* 2. Top Summary Distribution row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {STAGES.map((stage) => {
          const count = filteredLeads.filter((l) => l.status === stage).length;
          const percentage = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
          return (
            <div key={stage} className="bg-[#111113] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">{stage}</span>
                <p className="text-lg font-black text-white font-mono mt-0.5">{count}</p>
              </div>
              <div className="mt-2.5">
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      stage === "Won" ? "bg-emerald-500" :
                      stage === "Lost" ? "bg-rose-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1 block">{percentage}% of database</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. The Interactive Kanban columns layout scrollable list */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4 max-h-[70vh]">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.status === stage);

          return (
            <div 
              key={stage} 
              className="bg-[#111113]/40 border border-white/10 rounded-2xl flex flex-col min-w-[210px] shrink-0"
            >
              {/* Kanban Column Title Header */}
              <div className={`p-4 rounded-t-2xl border-b border-light border-white/5 flex items-center justify-between shadow ${getStageHeaderStyle(stage)}`}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs shrink-0">{getStageMetricSymbol(stage)}</span>
                  <span className="text-xs font-bold tracking-tight uppercase font-sans truncate">{stage}</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-slate-400 rounded-full px-2 py-0.5">
                  {stageLeads.length}
                </span>
              </div>

              {/* Kanban Lead Cards list container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                {stageLeads.length === 0 ? (
                  <div className="h-28 border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-center p-3">
                    <p className="text-[10px] text-zinc-500 italic">No candidates</p>
                  </div>
                ) : (
                  stageLeads.map((item) => {
                    return (
                      <div 
                        key={item.id} 
                        className="bg-[#111113] border border-white/5 hover:border-indigo-500/40 p-4 rounded-xl shadow relative group hover:-translate-y-0.5 transition-all outline-none"
                      >
                        {/* Industry focus label */}
                        <span className="text-[8px] bg-zinc-950 text-slate-500 border border-white/5 px-1.5 py-0.5 rounded uppercase font-mono tracking-wider block w-max max-w-full truncate mb-2">
                          {item.industry.split(" ")[0]}
                        </span>

                        <h4 className="text-xs font-bold text-white tracking-wide group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-1 font-sans">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span className="truncate">{item.company}</span>
                        </div>

                        {item.notes && (
                          <p className="text-[9.5px] text-zinc-500 leading-normal font-sans border-t border-white/5 mt-3 pt-2 line-clamp-2 italic" title={item.notes}>
                            "{item.notes}"
                          </p>
                        )}

                        {/* Interactive movement control links inside card hover */}
                        <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Go back */}
                          {stage !== "New Lead" ? (
                            <button
                              onClick={() => handleMoveBackward(item)}
                              className="text-[9px] text-slate-400 hover:text-white cursor-pointer px-1.5 py-0.5 hover:bg-white/5 rounded transition-colors"
                              title="Demote status"
                            >
                              ← Back
                            </button>
                          ) : (
                            <span />
                          )}

                          {/* Go next */}
                          {stage !== "Lost" && stage !== "Won" ? (
                            <button
                              onClick={() => handleMoveForward(item)}
                              className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer px-1.5 py-0.5 hover:bg-indigo-950/40 border border-indigo-950 rounded transition-all"
                              title="Promote status"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </section>

    </div>
  );
}
