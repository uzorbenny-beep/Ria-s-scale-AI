/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  LayoutDashboard,
  MessageSquareCode,
  Users,
  Send,
  Sparkles,
  FileSpreadsheet,
  BriefcaseBusiness,
  TrendingUp,
  CreditCard,
  Settings,
  LogOut,
  Building2,
  ShieldCheck,
  ChevronRight,
  X
} from "lucide-react";
import { TargetIndustry } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userIndustry: TargetIndustry;
  onChangeIndustry: (industry: TargetIndustry) => void;
  userProfile: { name: string; email: string; company: string };
  onLogout: () => void;
  subscriptionPlan: string;
  isOpen: boolean;
  onClose: () => void;
  coins?: number;
  maxCoins?: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  userIndustry,
  onChangeIndustry,
  userProfile,
  onLogout,
  subscriptionPlan,
  isOpen,
  onClose,
  coins,
  maxCoins
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "ai-assistant", label: "AI Advisor Chat", icon: MessageSquareCode },
    { id: "leads", label: "Leads Database", icon: Users },
    { id: "outreach", label: "Outreach Generator", icon: Send },
    { id: "content", label: "Content Builder", icon: Sparkles },
    { id: "proposals", label: "Proposal & SOW", icon: BriefcaseBusiness },
    { id: "crm", label: "CRM pipeline", icon: FileSpreadsheet },
    { id: "analytics", label: "Analytics Hub", icon: TrendingUp },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
    { id: "settings", label: "SaaS Settings", icon: Settings },
  ];

  return (
    <>
      {/* Background dark overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          onClick={onClose}
          id="sidebar-overlay"
          className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:translate-x-0 lg:static inset-y-0 left-0 w-72 bg-neutral-950 border-r border-neutral-900 flex flex-col h-screen text-neutral-300 select-none z-50 shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-sans font-bold text-white tracking-wider text-base uppercase">RIA'S SCALE</span>
              <p className="text-[10px] text-indigo-400 font-mono tracking-widest leading-none mt-0.5">THE SCALE OS</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded-full text-[10px] text-indigo-300 font-mono">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span>V1.4</span>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              id="sidebar-close-btn"
              className="lg:hidden w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Target Industry Dynamic Niche Selector */}
        <div className="p-5 border-b border-neutral-900">
          <label className="text-[10px] font-mono tracking-wider text-neutral-500 uppercase block mb-2">Target Operating Profile</label>
          <div className="relative">
            <select
              value={userIndustry}
              onChange={(e) => {
                onChangeIndustry(e.target.value as TargetIndustry);
                onClose();
              }}
              className="w-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-white px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none shadow-sm"
            >
              <option value={TargetIndustry.MARKETING}>💻 Marketing Agency Profile</option>
              <option value={TargetIndustry.WEB_DESIGN}>🎨 Web Design Agency Profile</option>
              <option value={TargetIndustry.RECRUITMENT}>👔 Recruiting Agency Profile</option>
              <option value={TargetIndustry.INSURANCE}>🛡️ Insurance Broking Profile</option>
              <option value={TargetIndustry.MORTGAGE}>🏠 Mortgage Broking Profile</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-500">
              <ChevronRight className="w-4 h-4 transform rotate-90" />
            </div>
          </div>
          <p className="text-[10px] text-neutral-500 mt-2 font-sans italic leading-tight">
            Current CRM lists, templates and advice filters are tailored to this specialization.
          </p>
        </div>

        {/* Main Navigation Menus */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1 scrollbar-thin scrollbar-thumb-neutral-800">
          <div className="text-[10px] tracking-widest text-neutral-600 font-mono uppercase px-3 mb-2 block">Enterprise Workspace</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-xs font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-neutral-500 group-hover:text-indigo-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dynamic Coins status indicator block */}
        <div className="px-5 py-3 border-t border-neutral-900 bg-neutral-950/40">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
            <span className="text-neutral-400 uppercase tracking-widest flex items-center gap-1 shrink-0">
              <span className="text-amber-400 text-xs">🪙</span> Credit Wallet
            </span>
            <span className="text-white font-bold shrink-0">{coins !== undefined ? coins.toLocaleString() : "10,000"} / {maxCoins !== undefined ? maxCoins.toLocaleString() : "10,000"} COIN</span>
          </div>
          <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-white/5 relative">
            <div 
              style={{ width: `${Math.min(100, Math.max(0, ((coins ?? 10000) / (maxCoins ?? 10000)) * 100))}%` }}
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${(coins ?? 10000) < 2000 ? "from-rose-500 to-amber-500" : "from-indigo-500 via-purple-500 to-pink-500"}`}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-[9px] text-neutral-500 font-sans italic">Charges credit per active query</span>
            <button
               onClick={() => {
                 setActiveTab("billing");
                 onClose();
               }}
               className="text-[9px] text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
            >
              Top-Up / Plans
            </button>
          </div>
        </div>

        {/* Footer Profile Control Card */}
        <div className="p-4 border-t border-neutral-900 bg-neutral-950/65 flex flex-col gap-3">
          <div className="bg-neutral-900/80 border border-neutral-800/80 p-3 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-900/60 border border-indigo-800/40 text-indigo-300 font-bold flex items-center justify-center text-sm">
              {userProfile.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate leading-tight">{userProfile.name}</p>
              <p className="text-[10px] text-neutral-400 truncate leading-tight mt-0.5">{userProfile.company}</p>
              <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-900 text-[8px] font-mono mt-1 leading-none uppercase">
                {subscriptionPlan}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 rounded-lg border border-neutral-900 hover:border-red-900/20 text-[11px] text-neutral-500 hover:text-red-400 font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:bg-red-950/10 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Workspace</span>
          </button>
        </div>
      </aside>
    </>
  );
}
