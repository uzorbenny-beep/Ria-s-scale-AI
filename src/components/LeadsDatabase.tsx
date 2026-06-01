/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Download,
  Upload,
  UserPlus,
  Building,
  Mail,
  Phone,
  Tag,
  Briefcase,
  Layers,
  ChevronDown,
  Info,
  X,
  Sparkles,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";
import { Lead, TargetIndustry } from "../types";

interface LeadsDatabaseProps {
  leads: Lead[];
  userIndustry: TargetIndustry;
  onAddLead: (lead: Omit<Lead, "id" | "createdAt">) => void;
  onUpdateLeadStatus: (id: string, status: Lead["status"]) => void;
  onDeleteLead: (id: string) => void;
}

export default function LeadsDatabase({
  leads,
  userIndustry,
  onAddLead,
  onUpdateLeadStatus,
  onDeleteLead
}: LeadsDatabaseProps) {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Lead Form State
  const [newCompany, setNewCompany] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newStatus, setNewStatus] = useState<Lead["status"]>("New Lead");
  const [newNotes, setNewNotes] = useState("");
  const [newLeadIndustry, setNewLeadIndustry] = useState<string>(userIndustry);

  // Filter leads based on term, status, and industry
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesIndustry = industryFilter === "all" || lead.industry === industryFilter;

    return matchesSearch && matchesStatus && matchesIndustry;
  });

  // Unique industries for filter dropdown
  const uniqueIndustries = Array.from(new Set(leads.map((l) => l.industry)));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCompany) return;

    onAddLead({
      name: newName,
      company: newCompany,
      industry: newLeadIndustry,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, ".")}@${newCompany.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      phone: newPhone || "+1 (555) 000-0000",
      status: newStatus,
      notes: newNotes
    });

    // Reset Form
    setNewName("");
    setNewCompany("");
    setNewEmail("");
    setNewPhone("");
    setNewStatus("New Lead");
    setNewNotes("");
    setIsAddOpen(false);
  };

  // Status Badge style generator
  const getStatusBadge = (status: Lead["status"]) => {
    const config = {
      "New Lead": { bg: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "New Lead" },
      "Contacted": { bg: "bg-purple-500/10 text-purple-400 border-purple-500/20", label: "Contacted" },
      "Qualified": { bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", label: "Qualified" },
      "Proposal Sent": { bg: "bg-teal-500/10 text-teal-400 border-teal-500/20", label: "Proposal Sent" },
      "Won": { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Won Contract" },
      "Lost": { bg: "bg-rose-500/10 text-rose-400 border-rose-500/20", label: "Closed Lost" }
    };

    const current = config[status] || { bg: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20", label: status };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-medium rounded-full border ${current.bg}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span>{current.label}</span>
      </span>
    );
  };

  // Convert current filtered list to standard CSV format
  const exportToCSV = () => {
    const csvRows = [
      ["Name", "Company", "Email", "Phone", "Segment/Industry", "Pipeline Status", "Notes", "Created At"]
    ];

    filteredLeads.forEach((lead) => {
      csvRows.push([
        lead.name,
        lead.company,
        lead.email,
        lead.phone,
        lead.industry,
        lead.status,
        lead.notes.replace(/,/g, ";"),
        lead.createdAt
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aga_prospects_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="leads-management-module" className="space-y-6">
      
      {/* 1. Header with dynamic counts & actions */}
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-indigo-950 text-indigo-400 font-mono font-bold tracking-widest px-2 py-0.5 rounded border border-indigo-900/30 uppercase">
              {userIndustry} Focus
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-time persistence</span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">SaaS Prospects Database Matrix</h2>
          <p className="text-xs text-slate-400 mt-1">Manage, filter, add or delete prospect target contacts tracking in active pipe.</p>
        </div>

        {/* Master KPIs inside header */}
        <div className="flex items-center gap-6 border-l border-white/5 pl-6 hidden lg:flex">
          <div className="text-center">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Filtered Contacts</span>
            <p className="text-xl font-bold text-white font-mono mt-0.5">{filteredLeads.length}</p>
          </div>
          <div className="text-center">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Won Retainers</span>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              {leads.filter((l) => l.status === "Won").length}
            </p>
          </div>
          <div className="text-center">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Total Database Size</span>
            <p className="text-xl font-bold text-indigo-400 font-mono mt-0.5">{leads.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 hover:bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Insert New Lead</span>
          </button>
        </div>
      </div>

      {/* 2. Advanced filtering panel */}
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-3.5 items-center">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search prospects by contact name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 transition-all font-sans"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex gap-2.5 w-full sm:w-auto shrink-0 select-none">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 bg-zinc-950 border border-white/10 text-xs py-2.5 pl-3.5 pr-8 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="all">⚡ All Statuses</option>
              <option value="New Lead">New Lead</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Won">Won Contract</option>
              <option value="Lost">Closed Lost</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative flex-1 sm:flex-initial">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full sm:w-48 bg-zinc-950 border border-white/10 text-xs py-2.5 pl-3.5 pr-8 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="all">📈 All Industry Verticals</option>
              <option value={userIndustry}>{userIndustry} (Focus)</option>
              {uniqueIndustries
                .filter((ind) => ind !== userIndustry)
                .map((ind, idx) => (
                  <option key={idx} value={ind}>
                    {ind}
                  </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. New Lead Dynamic Slider/Form Modal Overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-fade-in text-slate-200">
            {/* Modal Ambient flow */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between relative bg-zinc-950/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create New Lead Profile</h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">Database schema persistent profiles</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Company / Firm Name *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Apex Logistical Group"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Decision Maker / Exec *</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Sarah Jenkins (CEO)"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Contact Business Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="e.g. s.jenkins@apexcorp.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Client Direct Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="e.g. +1 (312) 412-9010"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Industry Segment</label>
                  <select
                    value={newLeadIndustry}
                    onChange={(e) => setNewLeadIndustry(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 p-2 text-xs text-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value={TargetIndustry.MARKETING}>{TargetIndustry.MARKETING}</option>
                    <option value={TargetIndustry.WEB_DESIGN}>{TargetIndustry.WEB_DESIGN}</option>
                    <option value={TargetIndustry.RECRUITMENT}>{TargetIndustry.RECRUITMENT}</option>
                    <option value={TargetIndustry.INSURANCE}>{TargetIndustry.INSURANCE}</option>
                    <option value={TargetIndustry.MORTGAGE}>{TargetIndustry.MORTGAGE}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Initial SOW Stage</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Lead["status"])}
                    className="w-full bg-zinc-950 border border-white/10 p-2 text-xs text-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Advisory notes & Scope particulars</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Contact is looking to restructure marketing spend. Transition from hourly retainer of custom setups into high-ticket UGC package starting Q3."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3.5 pt-4 border-t border-white/5 bg-zinc-950/20 px-6 py-4 mx-[-24px] mb-[-24px]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-lg text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg text-white uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/15"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Insert Candidate Group</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Leads database main listing grid table */}
      <div className="bg-[#111113] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-white/5">
            <thead className="bg-zinc-950/40">
              <tr className="text-slate-400">
                <th className="p-4 font-mono uppercase text-[10px] tracking-wider">Prospect Niche Name</th>
                <th className="p-4 font-mono uppercase text-[10px] tracking-wider">Business Company</th>
                <th className="p-4 font-mono uppercase text-[10px] tracking-wider">Corporate Email</th>
                <th className="p-4 font-mono uppercase text-[10px] tracking-wider">Direct Phone</th>
                <th className="p-4 font-mono uppercase text-[10px] tracking-wider">Industry vertical</th>
                <th className="p-4 font-mono uppercase text-[10px] tracking-wider">SOW Pipeline Badge</th>
                <th className="p-4 text-center font-mono uppercase text-[10px] tracking-wider">Operational controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                      <div className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-center text-slate-400">
                        <Info className="w-5 h-5" />
                      </div>
                      <h4 className="text-white font-bold text-xs tracking-tight">No Prospect Contacts Found</h4>
                      <p className="text-[11px] text-slate-400 leading-normal font-sans">
                        There are no contacts that match the search term or status filters. Feel free to clear parameters or insert a new custom coordinate.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-650/10 border border-indigo-550/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {lead.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{lead.name}</p>
                          <p className="text-[10px] text-slate-500 font-sans mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]" title={lead.notes}>
                            {lead.notes || "No extra operational profile text details."}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">{lead.company}</td>
                    <td className="p-4">
                      <a href={`mailto:${lead.email}`} className="text-indigo-400 hover:underline font-mono text-[11px]">
                        {lead.email}
                      </a>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">{lead.phone || "No direct phone"}</td>
                    <td className="p-4">
                      <span className="text-[10.5px] bg-zinc-900 text-slate-400 px-2 py-0.5 rounded border border-white/5 font-sans">
                        {lead.industry}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(lead.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="relative">
                          <select
                            value={lead.status}
                            onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as Lead["status"])}
                            className="bg-zinc-950 border border-white/10 text-[10px] text-slate-300 py-1 pl-2 pr-6 rounded-lg cursor-pointer focus:outline-none focus:border-indigo-500 appearance-none font-sans font-medium"
                          >
                            <option value="New Lead">Set New</option>
                            <option value="Contacted">Set Pitch</option>
                            <option value="Qualified">Set Qualify</option>
                            <option value="Proposal Sent">Set Sent</option>
                            <option value="Won">Set Won</option>
                            <option value="Lost">Set Lost</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1.5 w-3 h-3 text-slate-500 pointer-events-none" />
                        </div>
                        
                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          className="w-7 h-7 rounded-lg hover:bg-red-950/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete Prospect Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
