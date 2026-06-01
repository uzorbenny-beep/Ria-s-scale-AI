/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Users,
  BriefcaseBusiness,
  FileSpreadsheet,
  TrendingUp,
  CreditCard,
  Settings as SettingsIcon,
  ChevronRight,
  LayoutDashboard,
  MessageSquareCode,
  Plus,
  Search,
  Filter,
  Trash,
  Mail,
  Phone,
  Calendar,
  Download,
  Building,
  CheckCircle,
  ShieldCheck,
  ArrowUpRight,
  HelpCircle,
  FileText,
  UserPlus,
  LogIn,
  Compass,
  Landmark,
  DollarSign,
  Globe2,
  RefreshCw,
  Edit2,
  Menu,
  X
} from "lucide-react";
import { TargetIndustry, Lead, OutreachCampaign, GeneratedContent, Proposal, ChatMessage, AppSettings } from "./types";
import { LocalStorageDB, getInitialCRMRecords } from "./utils/mockDatabase";
import Sidebar from "./components/Sidebar";
import DashboardOverview from "./components/DashboardOverview";
import AiAssistant from "./components/AiAssistant";
import LeadsDatabase from "./components/LeadsDatabase";
import CrmBoard from "./components/CrmBoard";
import { supabase, isSupabaseConfigured, sendMagicLink, verifyOTPToken, logoutUser } from "./lib/supabaseClient";

export default function App() {
  // Session / Authentication state
  const [session, setSession] = useState<{ email: string; name: string; company: string; loggedIn: boolean; isSupabaseUser?: boolean } | null>(() => {
    const raw = localStorage.getItem("aga_session");
    return raw ? JSON.parse(raw) : null;
  });

  // Listen to live Supabase credentials and synchronize status
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Fetch session once on mount
      supabase.auth.getSession().then(({ data: { session: sbSession } }) => {
        if (sbSession?.user) {
          const userEmail = sbSession.user.email || "";
          const meta = sbSession.user.user_metadata || {};
          const syncedSession = {
            email: userEmail,
            name: meta.full_name || userEmail.split("@")[0],
            company: meta.company || "Enterprise Consulting Group",
            loggedIn: true,
            isSupabaseUser: true
          };
          localStorage.setItem("aga_session", JSON.stringify(syncedSession));
          setSession(syncedSession);
        }
      });

      // Maintain auth broadcast channels
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sbSession) => {
        if (sbSession?.user) {
          const userEmail = sbSession.user.email || "";
          const meta = sbSession.user.user_metadata || {};
          const syncedSession = {
            email: userEmail,
            name: meta.full_name || userEmail.split("@")[0],
            company: meta.company || "Enterprise Consulting Group",
            loggedIn: true,
            isSupabaseUser: true
          };
          localStorage.setItem("aga_session", JSON.stringify(syncedSession));
          setSession(syncedSession);
        } else if (event === "SIGNED_OUT") {
          const raw = localStorage.getItem("aga_session");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.isSupabaseUser) {
              localStorage.removeItem("aga_session");
              setSession(null);
            }
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Magic Link temporary simulation state
  const [authEmail, setAuthEmail] = useState("");
  const [authName, setAuthName] = useState("");
  const [authCompany, setAuthCompany] = useState("");
  const [authIndustry, setAuthIndustry] = useState<TargetIndustry>(TargetIndustry.MARKETING);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicCodeInput, setMagicCodeInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Public Web Navigation Tabs: 'home' | 'features' | 'pricing' | 'about' | 'contact' | 'blog'
  const [publicTab, setPublicTab] = useState<"home" | "features" | "pricing" | "about" | "contact" | "blog">("home");

  // Private App Navigation state: 'dashboard' | 'ai-assistant' | 'leads' | 'outreach' | 'content' | 'proposals' | 'crm' | 'analytics' | 'billing' | 'settings'
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [publicMobileMenuOpen, setPublicMobileMenuOpen] = useState(false);

  // Global Active Operating Profile Industry
  const [userIndustry, setUserIndustry] = useState<TargetIndustry>(() => {
    const prof = LocalStorageDB.getProfile();
    return prof.industry || TargetIndustry.MARKETING;
  });

  // Data Collections state (tailored to active dynamic specialize industry)
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([]);
  const [contentList, setContentList] = useState<GeneratedContent[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [lockoutError, setLockoutError] = useState<string | null>(() => localStorage.getItem("aga_lockout_reason"));

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    // Remove if already set to avoid overlapping times
    setTimeout(() => {
      setToast(curr => curr?.message === message ? null : curr);
    }, 4500);
  };

  const handleVipAccessBypass = (emailToUse: string = "uzorbenny51@gmail.com") => {
    const mockSession = {
      email: emailToUse,
      name: "VIP Developer Admin",
      company: "Supercharged Systems",
      loggedIn: true,
      isSupabaseUser: false
    };
    localStorage.setItem("aga_session", JSON.stringify(mockSession));
    
    const vipSub = {
      id: "sub_vip_" + Date.now(),
      userId: "user_vanguard",
      planId: "enterprise",
      status: "active",
      currentPeriodEnd: "2036-12-31T00:00:00Z",
      tierName: "VIP Unlimited Creator",
      price: "$0/mo (Admin Mode)",
      coins: 99999999,
      maxCoins: 99999999
    };
    LocalStorageDB.saveSubscription(vipSub);
    setSubscription(vipSub);

    const profile = {
      name: "VIP Developer Admin",
      email: emailToUse,
      company: "Supercharged Systems",
      industry: TargetIndustry.MARKETING,
      createdAt: new Date().toISOString()
    };
    LocalStorageDB.saveProfile(profile);
    setUserIndustry(TargetIndustry.MARKETING);
    
    localStorage.removeItem("aga_lockout_reason");
    setLockoutError(null);
    setSession(mockSession);
    setActiveTab("dashboard");
    showToast("Supreme VIP Creator Access Activated. Bypassed coin limits successfully!", "success");
  };

  const handleLockoutRedirect = (actionName: string) => {
    if (session?.email === "uzorbenny51@gmail.com" || subscription?.tierName === "VIP Unlimited Creator") {
      showToast(`VIP account bypassed lockout trigger for: "${actionName}"`, "success");
      return;
    }
    localStorage.removeItem("aga_session");
    localStorage.setItem("aga_lockout_reason", `Your account coin credit has run out after performing action: "${actionName}". To maintain access to your workspace diagnostics, please top up and select a credit plan below.`);
    setLockoutError(`Your account coin credit has run out after performing action: "${actionName}". To maintain access to your workspace diagnostics, please top up and select a credit plan below.`);
    setSession(null);
    setMagicLinkSent(false);
    setAuthEmail("");
    setPublicTab("pricing");
  };

  const chargeCoins = (costCount: number, actionName: string): boolean => {
    const isVipUser = session?.email === "uzorbenny51@gmail.com" || subscription?.tierName === "VIP Unlimited Creator";
    if (isVipUser) {
      showToast(`[VIP Admin Bypassed] Action "${actionName}" completed with zero charge.`, "success");
      return true;
    }

    const activeSub = LocalStorageDB.getSubscription();
    const currentCoins = activeSub ? (activeSub.coins ?? 10000) : 10000;
    const nextCoins = currentCoins - costCount;

    if (nextCoins <= 0) {
      const updatedSub = {
        ...(activeSub || {}),
        coins: 0,
        maxCoins: activeSub?.maxCoins ?? 10000,
        planId: activeSub?.planId ?? "professional",
        tierName: activeSub?.tierName ?? "Professional Plan",
        price: activeSub?.price ?? "$49/mo"
      };
      LocalStorageDB.saveSubscription(updatedSub);
      setSubscription(updatedSub);
      handleLockoutRedirect(actionName);
      return false;
    } else {
      const updatedSub = {
        ...(activeSub || {}),
        coins: nextCoins,
        maxCoins: activeSub?.maxCoins ?? 10000,
        planId: activeSub?.planId ?? "professional",
        tierName: activeSub?.tierName ?? "Professional Plan",
        price: activeSub?.price ?? "$49/mo"
      };
      LocalStorageDB.saveSubscription(updatedSub);
      setSubscription(updatedSub);
      showToast(`Consumed ${costCount.toLocaleString()} coin credits for: "${actionName}". ${nextCoins.toLocaleString()} remaining.`, "info");
      return true;
    }
  };

  // Instantly decline workspace entry and log out if coin credit completes
  useEffect(() => {
    if (session && subscription) {
      const liveCoins = subscription.coins ?? 10000;
      const isVipUser = session.email === "uzorbenny51@gmail.com" || subscription.tierName === "VIP Unlimited Creator";
      if (liveCoins <= 0 && !isVipUser) {
        handleLockoutRedirect("Exhausted remaining coin credits.");
      }
    }
  }, [subscription, session]);

  // Active form state managers
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadCompany, setNewLeadCompany] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadIndustry, setNewLeadIndustry] = useState("");
  const [newLeadNotes, setNewLeadNotes] = useState("");
  const [newLeadStatus, setNewLeadStatus] = useState<Lead["status"]>("New Lead");
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  // Chat interactive input
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Outreach form input
  const [outreachType, setOutreachType] = useState<"email" | "linkedin" | "script" | "followup">("email");
  const [outreachRecipient, setOutreachRecipient] = useState("");
  const [outreachCompanySize, setOutreachCompanySize] = useState("10-50 employees");
  const [outreachCustomGoal, setOutreachCustomGoal] = useState("");
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
  const [latestGeneratedCampaign, setLatestGeneratedCampaign] = useState<string>("");
  const [campaignSubject, setCampaignSubject] = useState("");

  // Content form input
  const [contentType, setContentType] = useState<"linkedin_post" | "x_thread" | "blog" | "newsletter" | "marketing_email">("linkedin_post");
  const [contentTopic, setContentTopic] = useState("");
  const [contentTone, setContentTone] = useState("authoritative & insightful with data-driven hooks");
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [latestGeneratedContent, setLatestGeneratedContent] = useState<string>("");

  // Proposal form input
  const [propClientName, setPropClientName] = useState("");
  const [propCompanyName, setPropCompanyName] = useState("");
  const [propServiceTitle, setPropServiceTitle] = useState("");
  const [propScope, setPropScope] = useState("");
  const [propCost, setPropCost] = useState("");
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [latestGeneratedProposal, setLatestGeneratedProposal] = useState<Proposal | null>(null);

  // Contact form submission test simulation
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Enterprise customizable models configuration
  const [entCustomCoins, setEntCustomCoins] = useState(150000);
  const [entCustomPrice, setEntCustomPrice] = useState(250);

  // Sync state data on dynamic target industry swaps
  useEffect(() => {
    if (session) {
      // Hydrate specifically based on specialized target profile industry selected
      const loadedLeads = LocalStorageDB.getLeads(userIndustry);
      setLeads(loadedLeads);
      
      const loadedCampaigns = LocalStorageDB.getCampaigns();
      setCampaigns(loadedCampaigns.filter(c => c.industry === userIndustry || !c.industry));

      const loadedContent = LocalStorageDB.getContent();
      setContentList(loadedContent.filter(c => c.industry === userIndustry || !c.industry));

      const loadedProposals = LocalStorageDB.getProposals();
      setProposals(loadedProposals);

      setChatMessages(LocalStorageDB.getChatMessages());
      setSubscription(LocalStorageDB.getSubscription());
      setAppSettings(LocalStorageDB.getSettings());
    }
  }, [userIndustry, session]);

  // Scroll to bottom of advisory chat helper
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Handle Dynamic Profile Industry Changes from Sidebar selector
  const handleChangeIndustry = (newInd: TargetIndustry) => {
    setUserIndustry(newInd);
    const prof = LocalStorageDB.getProfile();
    prof.industry = newInd;
    LocalStorageDB.saveProfile(prof);
  };

  // Magic Link OTP Initiator
  const handleRequestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!authEmail) {
      setErrorMsg("Please provide a valid business email address.");
      return;
    }

    setIsVerifying(true);
    try {
      await sendMagicLink(authEmail);
      setMagicLinkSent(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to trigger magic link / OTP check.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Verifying sent magic token / OTP
  const handleVerifyMagicCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg("");

    try {
      const { session: sbSession, isMock } = await verifyOTPToken(authEmail, magicCodeInput);
      
      const sessionEmail = sbSession?.user?.email || authEmail;
      const sessionName = authName || sbSession?.user?.user_metadata?.full_name || "Lead Partner";
      const sessionCompany = authCompany || sbSession?.user?.user_metadata?.company || "Enterprise Consulting Group";

      // If live Supabase, sync metadata parameters securely
      if (!isMock && isSupabaseConfigured && supabase) {
        await supabase.auth.updateUser({
          data: { full_name: sessionName, company: sessionCompany }
        });
      }

      const activeSession = {
        email: sessionEmail,
        name: sessionName,
        company: sessionCompany,
        loggedIn: true,
        isSupabaseUser: !isMock
      };
      
      localStorage.setItem("aga_session", JSON.stringify(activeSession));

      // Save global profile coordinates
      const profile = {
        name: activeSession.name,
        email: activeSession.email,
        company: activeSession.company,
        industry: authIndustry,
        createdAt: new Date().toISOString()
      };
      LocalStorageDB.saveProfile(profile);
      setUserIndustry(authIndustry);

      setSession(activeSession);
      setIsVerifying(false);
      setActiveTab("dashboard");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Invalid validation token. Please double check.");
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout Err:", err);
    }
    localStorage.removeItem("aga_session");
    setSession(null);
    setMagicLinkSent(false);
    setAuthEmail("");
    setAuthName("");
    setAuthCompany("");
    setPublicTab("home");
  };

  // Fast Pass Demo Account Access Hook
  const handleFastPassDemo = () => {
    const mockSession = {
      email: "partner@vanguardconsult.com",
      name: "Alex Rivera",
      company: "Vanguard Tech Consults",
      loggedIn: true,
      isSupabaseUser: false
    };
    localStorage.setItem("aga_session", JSON.stringify(mockSession));
    
    const profile = {
      name: "Alex Rivera",
      email: "partner@vanguardconsult.com",
      company: "Vanguard Tech Consults",
      industry: TargetIndustry.MARKETING,
      createdAt: new Date().toISOString()
    };
    LocalStorageDB.saveProfile(profile);
    setUserIndustry(TargetIndustry.MARKETING);
    setSession(mockSession);
    setActiveTab("dashboard");
  };

  // CRM Pipeline State Updates (e.g. Move lead stage)
  const handleUpdateLeadStatus = (leadId: string, status: Lead["status"]) => {
    const targetLeads = LocalStorageDB.getLeads(userIndustry);
    const updated = targetLeads.map((l) => {
      if (l.id === leadId) {
        return { ...l, status };
      }
      return l;
    });
    LocalStorageDB.saveLeads(userIndustry, updated);
    setLeads(updated);
  };

  // Add new lead form processor
  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadCompany) return;

    if (!chargeCoins(100, "Add Prospect Lead")) return;

    const newLeadRecord: Lead = {
      id: "lead_" + Date.now(),
      name: newLeadName,
      company: newLeadCompany,
      industry: newLeadIndustry || userIndustry,
      email: newLeadEmail || `${newLeadName.toLowerCase().replace(/\s+/g, "")}@example.com`,
      phone: newLeadPhone || "+1 (555) 700-1100",
      status: newLeadStatus,
      notes: newLeadNotes || "Added via platform Leads workspace.",
      createdAt: new Date().toISOString()
    };

    const currentCollection = LocalStorageDB.getLeads(userIndustry);
    const updatedCollection = [newLeadRecord, ...currentCollection];
    LocalStorageDB.saveLeads(userIndustry, updatedCollection);
    setLeads(updatedCollection);

    // Reset inputs
    setNewLeadName("");
    setNewLeadCompany("");
    setNewLeadEmail("");
    setNewLeadPhone("");
    setNewLeadIndustry("");
    setNewLeadNotes("");
    setNewLeadStatus("New Lead");
    setIsAddLeadOpen(false);
  };

  // Delete lead from current dynamic specialize list
  const handleDeleteLead = (id: string) => {
    const fresh = leads.filter((l) => l.id !== id);
    LocalStorageDB.saveLeads(userIndustry, fresh);
    setLeads(fresh);
  };

  // Chat message submission API flow
  const handleSendChatMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSubmit = (customText !== undefined ? customText : chatInput).trim();
    if (!textToSubmit) return;

    if (!chargeCoins(350, "AI Advisor Chat Consultation")) return;

    const userMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      role: "user",
      text: textToSubmit,
      createdAt: new Date().toISOString()
    };

    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    LocalStorageDB.saveChatMessages(updatedHistory);
    if (customText === undefined) {
      setChatInput("");
    }
    setIsSendingChat(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory,
          userProfile: {
            name: session?.name,
            company: session?.company,
            industry: userIndustry
          }
        })
      });

      if (!response.ok) {
        throw new Error("Advisory route response error");
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: "ai_" + Date.now(),
        role: "model",
        text: data.text,
        createdAt: new Date().toISOString()
      };

      const finalHistory = [...updatedHistory, aiMsg];
      setChatMessages(finalHistory);
      LocalStorageDB.saveChatMessages(finalHistory);
    } catch (err) {
      console.error(err);
      const errResponse: ChatMessage = {
        id: "ai_err_" + Date.now(),
        role: "model",
        text: "The AI strategic endpoint is currently warming up or sleeping. Please verify that your local development server is fully running and that your GEMINI_API_KEY is configured in Settings > Secrets if you are offline.",
        createdAt: new Date().toISOString()
      };
      const finalHistory = [...updatedHistory, errResponse];
      setChatMessages(finalHistory);
      LocalStorageDB.saveChatMessages(finalHistory);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Handle outreach generation API flow
  const handleGenerateOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeCoins(400, "AI Outbound Campaign Template Generation")) return;
    setIsGeneratingCampaign(true);

    try {
      const response = await fetch("/api/ai/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignType: outreachType,
          industry: userIndustry,
          recipientName: outreachRecipient || "Prospect Director",
          companySize: outreachCompanySize,
          customGoal: outreachCustomGoal || "To book an introductory video call"
        })
      });

      if (!response.ok) throw new Error("Error fetching outreach copy");
      const data = await response.json();

      setLatestGeneratedCampaign(data.text);
      if (outreachType === "email") {
        setCampaignSubject(`Strategic scaling question for ${outreachRecipient || "your team"}`);
      } else {
        setCampaignSubject("LinkedIn Message");
      }
    } catch (err) {
      console.error(err);
      setLatestGeneratedCampaign("Failed to connect to the outbound AI engine in real-time. Please review server.ts logs.");
    } finally {
      setIsGeneratingCampaign(false);
    }
  };

  // Save generated campaign as official outbound campaign
  const handleSaveOutreachCampaign = () => {
    if (!latestGeneratedCampaign) return;

    const newCampaign: OutreachCampaign = {
      id: "camp_" + Date.now(),
      name: `Outbound Campaign targeting ${outreachRecipient || "Partner"}`,
      type: outreachType,
      industry: userIndustry,
      subject: campaignSubject || "Quick Question",
      generatedText: latestGeneratedCampaign,
      recipientName: outreachRecipient || "SaaS Exec",
      createdAt: new Date().toISOString()
    };

    const currentList = LocalStorageDB.getCampaigns();
    const updated = [newCampaign, ...currentList];
    LocalStorageDB.saveCampaigns(updated);
    
    // Refresh local lists
    setCampaigns(updated.filter(c => c.industry === userIndustry || !c.industry));
    showToast("Outbound campaign template cataloged under Leads workspace!", "success");
  };

  // Social Content API Fetcher
  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentTopic) return;
    if (!chargeCoins(300, "AI Social Copywriting Asset Generation")) return;
    setIsGeneratingContent(true);

    try {
      const response = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          industry: userIndustry,
          topic: contentTopic,
          tone: contentTone
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setLatestGeneratedContent(data.text);
    } catch (err) {
      setLatestGeneratedContent("Error generating social assets. Verify server connection.");
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // Catalog social post
  const handleSaveSocialAsset = () => {
    if (!latestGeneratedContent) return;

    const newItem: GeneratedContent = {
      id: "cont_" + Date.now(),
      title: contentTopic.slice(0, 32) + "...",
      type: contentType,
      industry: userIndustry,
      prompt: contentTopic,
      output: latestGeneratedContent,
      createdAt: new Date().toISOString()
    };

    const cur = LocalStorageDB.getContent();
    const upd = [newItem, ...cur];
    LocalStorageDB.saveContent(upd);
    setContentList(upd.filter(c => c.industry === userIndustry || !c.industry));
    showToast("AI copywriting asset successfully cataloged!", "success");
  };

  // Proposal Generation API Flow
  const handleGenerateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propClientName || !propCompanyName) return;
    if (!chargeCoins(600, "AI Custom Service Proposal Draft")) return;
    setIsGeneratingProposal(true);

    try {
      const response = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: propClientName,
          companyName: propCompanyName,
          serviceTitle: propServiceTitle || "Comprehensive Scale Consulting Matrix",
          scopeOfWork: propScope || "Audit, weekly coaching calls, customized systems deploy templates and metrics reporting dashboard.",
          estimatedCost: propCost || "$8,500/month retainer"
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();

      const newProp: Proposal = {
        id: "prop_" + Date.now(),
        clientName: propClientName,
        companyName: propCompanyName,
        serviceTitle: propServiceTitle,
        scopeOfWork: propScope,
        contractTerms: "Client receives 30 days written notice on cancellation. 50% upfront retainer fee.",
        estimatedCost: propCost,
        generatedText: data.text,
        createdAt: new Date().toISOString()
      };

      setLatestGeneratedProposal(newProp);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  // Add proposal to listings
  const handleSaveProposalToList = () => {
    if (!latestGeneratedProposal) return;
    const cur = LocalStorageDB.getProposals();
    const upd = [latestGeneratedProposal, ...cur];
    LocalStorageDB.saveProposals(upd);
    setProposals(upd);
    showToast("Corporate proposal successfully drafted and locked into CRM database!", "success");
  };

  // Stripe payments selection mockup handler with Coin Credits implementation
  const handleSelectStripePlan = (planId: "starter" | "professional" | "growth" | "enterprise", costLabel: string, customCoins?: number) => {
    let coins = 10000;
    let maxCoins = 10000;
    let tierName = "Professional Plan";
    if (planId === "starter") {
      coins = 3000;
      maxCoins = 3000;
      tierName = "Starter Plan";
    } else if (planId === "professional") {
      coins = 10000;
      maxCoins = 10000;
      tierName = "Professional Plan";
    } else if (planId === "growth") {
      coins = 30000;
      maxCoins = 30000;
      tierName = "Growth Pack";
    } else if (planId === "enterprise") {
      coins = customCoins || 100000;
      maxCoins = customCoins || 100000;
      tierName = "Enterprise Suite";
    }

    const currentSub = {
      id: "sub_new_" + Date.now(),
      userId: "user_vanguard",
      planId: planId,
      status: "active",
      currentPeriodEnd: "2026-08-01T00:00:00Z",
      tierName: tierName,
      price: costLabel,
      coins: coins,
      maxCoins: maxCoins
    };
    LocalStorageDB.saveSubscription(currentSub);
    setSubscription(currentSub);
    
    // Clear any previous lockout status
    localStorage.removeItem("aga_lockout_reason");
    if (lockoutError) {
      setLockoutError(null);
    }
    
    showToast(`Success: Stripe payment portal processed subscription upgrade to ${tierName} (${coins.toLocaleString()} Coin Credits added)!`, "success");
  };

  // Settings upgrade
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appSettings) return;
    LocalStorageDB.saveSettings(appSettings);
    showToast("Application setting configurations saved successfully!", "success");
  };

  const getFilteredLeads = () => {
    return leads.filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.company.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.email.toLowerCase().includes(leadSearch.toLowerCase());
      
      const matchStatus = leadStatusFilter === "all" || l.status === leadStatusFilter;
      return matchSearch && matchStatus;
    });
  };

  // If not logged in, render the beautiful, modern Public marketing space
  if (!session) {
    return (
      <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans selection:bg-indigo-600 selection:text-white flex flex-col">
        
        {lockoutError && (
          <div className="bg-gradient-to-r from-red-950 via-rose-950 to-red-950 border-b border-rose-800 shadow-xl py-4 px-6 z-50 relative">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-900 border border-red-750 flex items-center justify-center text-red-100 shrink-0 select-none text-base">
                  ⚠️
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono text-red-200 uppercase tracking-wider leading-none">Access Declined • Coin Credit Exhausted</h4>
                  <p className="text-xs text-red-300 font-medium leading-normal mt-1">{lockoutError}</p>
                </div>
              </div>
              <div className="flex gap-2.5 shrink-0">
                <button
                  onClick={() => handleVipAccessBypass("uzorbenny51@gmail.com")}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1"
                >
                  👑 Admin Unlock
                </button>
                <button 
                  onClick={() => {
                    setPublicTab("pricing");
                    const plansEl = document.getElementById("public-plans-anchor");
                    if (plansEl) {
                      plansEl.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.scrollTo({ top: 350, behavior: "smooth" });
                    }
                  }}
                  className="px-4 py-2 bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-xs font-bold text-slate-300 rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Choose Subscription Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Public Navbar */}
        <header className="border-b border-white/5 bg-[#0d0d0f]/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex flex-col justify-center transition-all duration-300">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30 shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white text-base">Ria'S Scale AI</span>
                <p className="text-[9px] text-indigo-400 font-mono tracking-widest leading-none mt-0.5">THE SCALE OS</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-semibold text-slate-400">
              <button onClick={() => setPublicTab("home")} className={`hover:text-white cursor-pointer ${publicTab === "home" ? "text-indigo-400 font-bold" : ""}`}>Home</button>
              <button onClick={() => setPublicTab("features")} className={`hover:text-white cursor-pointer ${publicTab === "features" ? "text-indigo-400 font-bold" : ""}`}>Features</button>
              <button onClick={() => setPublicTab("pricing")} className={`hover:text-white cursor-pointer ${publicTab === "pricing" ? "text-indigo-400 font-bold" : ""}`}>Pricing & Credits</button>
              <button onClick={() => setPublicTab("about")} className={`hover:text-white cursor-pointer ${publicTab === "about" ? "text-indigo-400 font-bold" : ""}`}>Core Philosophy</button>
              <span className="text-white/10">|</span>
              <button onClick={() => setPublicTab("blog")} className={`hover:text-white cursor-pointer ${publicTab === "blog" ? "text-indigo-400 font-bold" : ""}`}>Niche Guides</button>
              <button onClick={() => setPublicTab("contact")} className={`hover:text-white cursor-pointer ${publicTab === "contact" ? "text-indigo-400 font-bold" : ""}`}>Contact Sales</button>
            </nav>

            {/* Quick-links for MD screens but hidden on small screens */}
            <nav className="hidden md:flex lg:hidden items-center gap-5 text-xs font-semibold text-slate-400">
              <button onClick={() => setPublicTab("home")} className={`hover:text-white cursor-pointer ${publicTab === "home" ? "text-indigo-400 font-bold" : ""}`}>Home</button>
              <button onClick={() => setPublicTab("features")} className={`hover:text-white cursor-pointer ${publicTab === "features" ? "text-indigo-400 font-bold" : ""}`}>Features</button>
              <button onClick={() => setPublicTab("pricing")} className={`hover:text-white cursor-pointer ${publicTab === "pricing" ? "text-indigo-400 font-bold" : ""}`}>Pricing</button>
              <button onClick={() => setPublicTab("blog")} className={`hover:text-white cursor-pointer ${publicTab === "blog" ? "text-indigo-400 font-bold" : ""}`}>Guides</button>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleFastPassDemo}
                className="px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-[11px] font-semibold text-indigo-300 border border-indigo-500/20 shadow-md transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Fast Demo Play</span>
              </button>
              
              <button
                onClick={() => {
                  setMagicLinkSent(false);
                  setPublicTab("home");
                  // Open visual screen focus
                  const loginEl = document.getElementById("login-box-target");
                  if (loginEl) loginEl.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg text-white shadow-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setPublicMobileMenuOpen(!publicMobileMenuOpen)}
                className="p-2 rounded-lg bg-neutral-900 border border-white/5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {publicMobileMenuOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown with dynamic elegant animation wrapper */}
          {publicMobileMenuOpen && (
            <div className="md:hidden mt-3.5 pt-3.5 border-t border-white/5 flex flex-col gap-3.5 animate-fade-in">
              <div className="flex flex-col gap-1.5 bg-[#09090b]/80 p-2 rounded-xl border border-white/5 animate-fade-in">
                <button
                  onClick={() => {
                    setPublicTab("home");
                    setPublicMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-left text-xs font-semibold rounded-lg transition-colors ${
                    publicTab === "home" ? "bg-indigo-600/15 text-indigo-400" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  📍 Home Screen Overview
                </button>
                <button
                  onClick={() => {
                    setPublicTab("features");
                    setPublicMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-left text-xs font-semibold rounded-lg transition-colors ${
                    publicTab === "features" ? "bg-indigo-600/15 text-indigo-400" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  🚀 Platform Features
                </button>
                <button
                  onClick={() => {
                    setPublicTab("pricing");
                    setPublicMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-left text-xs font-semibold rounded-lg transition-colors ${
                    publicTab === "pricing" ? "bg-indigo-600/15 text-indigo-400" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  💎 Coins & Subscription Plans
                </button>
                <button
                  onClick={() => {
                    setPublicTab("about");
                    setPublicMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-left text-xs font-semibold rounded-lg transition-colors ${
                    publicTab === "about" ? "bg-indigo-600/15 text-indigo-400" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  🧘 Core Scale Philosophy
                </button>
                <button
                  onClick={() => {
                    setPublicTab("blog");
                    setPublicMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-left text-xs font-semibold rounded-lg transition-colors ${
                    publicTab === "blog" ? "bg-indigo-600/15 text-indigo-400" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  📖 Niche Guides
                </button>
                <button
                  onClick={() => {
                    setPublicTab("contact");
                    setPublicMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-left text-xs font-semibold rounded-lg transition-colors ${
                    publicTab === "contact" ? "bg-indigo-600/15 text-indigo-400" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  📞 Contact Enterprise Support
                </button>
              </div>

              {/* Action buttons stack in mobile */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-white/5">
                <button
                  onClick={() => {
                    setPublicMobileMenuOpen(false);
                    handleFastPassDemo();
                  }}
                  className="py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[11px] font-bold text-indigo-300 border border-indigo-500/20 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>Fast Demo Play</span>
                </button>
                
                <button
                  onClick={() => {
                    setPublicMobileMenuOpen(false);
                    setMagicLinkSent(false);
                    setPublicTab("home");
                    setTimeout(() => {
                      const loginEl = document.getElementById("login-box-target");
                      if (loginEl) loginEl.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-[11px] font-bold rounded-lg text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Home Screen View */}
        {publicTab === "home" && (
          <main className="flex-1">
            {/* Hero bento presentation block */}
            <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/40 border border-indigo-900/50 rounded-full text-[10px] text-indigo-300 font-mono tracking-widest uppercase mb-6">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Next-Gen Enterprise Advisor Engine</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] font-sans">
                The Business growth system built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500">Service Professionals.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
                Ria'S Scale AI provides dynamic outbound generation, strategic business advice tailored to matching agency specializations, custom copywriters, and standard Kanban pipelines. No templates required.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleFastPassDemo}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl text-white shadow-lg tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all border border-indigo-400/20"
                >
                  <Sparkles className="w-4 h-4 fill-indigo-200" />
                  <span>Launch Free Workspace Mock</span>
                </button>
                <button
                  onClick={() => setPublicTab("pricing")}
                  className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold rounded-xl text-indigo-200 border border-white/5 transition-all cursor-pointer"
                >
                  Explore Cost Pricing Models
                </button>
              </div>

              {/* Home Marketing Bento Presentation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20">
                {/* Bento card 1 */}
                <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 text-left hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-900/40 flex items-center justify-center text-indigo-400 font-bold text-sm mb-4">
                      💻
                    </div>
                    <h3 className="font-bold text-white text-base">Marketing Agencies</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Pitch high-margin custom retainer solutions. Target key e-commerce retail networks using personalized copy structures.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 mt-4 block">UGC Playbooks included →</span>
                </div>

                {/* Bento card 2 */}
                <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 text-left hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-900/40 flex items-center justify-center text-indigo-400 font-bold text-sm mb-4">
                      🎨
                    </div>
                    <h3 className="font-bold text-white text-base">Web Designers</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Elevate basic redesign pitches into standardized high-ticket migrations. Offer recurring conversion audits.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 mt-4 block">Webflow setups ready →</span>
                </div>

                {/* Bento card 3 */}
                <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 text-left hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-900/40 flex items-center justify-center text-indigo-400 font-bold text-sm mb-4">
                      👔
                    </div>
                    <h3 className="font-bold text-white text-base">Headhunters & Recruiters</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Capture lucrative corporate commission assignments. Leverage high-response cold messages for engineering roles.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 mt-4 block">Startup catalogs loaded →</span>
                </div>
              </div>
            </section>

            {/* Passwordless login box segment aligned to theme */}
            <section id="login-box-target" className="max-w-md mx-auto px-6 pb-24">
              <div className="bg-[#111113] border border-white/5 rounded-2xl p-8 relative overflow-hidden shadow-2xl animate-fade-in">
                <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl" />
                
                {/* Supabase Status Indicator */}
                <div className="flex justify-center mb-4">
                  {isSupabaseConfigured ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-950/40 border border-teal-900/50 rounded-full text-[10px] font-medium text-teal-400 shadow-sm animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      <span>Live Supabase Auth Connected</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 border border-amber-900/50 rounded-full text-[10px] font-medium text-amber-400 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Sandbox Engine Active (Mock Auth)</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
                    🔑
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Access Your Scale OS</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isSupabaseConfigured 
                      ? "Enter your details to receive an authentic Supabase OTP Verification."
                      : "No Passwords. Authenticate with a dynamic mock email OTP."}
                  </p>
                </div>

                {errorMsg && (
                  <div className="bg-red-950/50 border border-red-900/50 text-[11px] text-red-200 p-3 rounded-lg mt-4 font-mono">
                    {errorMsg}
                  </div>
                )}

                {!magicLinkSent ? (
                  <form onSubmit={handleRequestMagicLink} className="mt-6 space-y-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Business Email Address</label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="e.g. alex@vanguardconsult.com"
                        className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 focus:outline-none focus:border-indigo-500 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                        className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 focus:outline-none focus:border-indigo-500 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Agency Company Name</label>
                      <input
                        type="text"
                        required
                        value={authCompany}
                        onChange={(e) => setAuthCompany(e.target.value)}
                        placeholder="e.g. Vanguard Tech Consults"
                        className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 focus:outline-none focus:border-indigo-500 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Operating Specialty</label>
                      <select
                        value={authIndustry}
                        onChange={(e) => setAuthIndustry(e.target.value as TargetIndustry)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs p-3 focus:outline-none focus:border-indigo-500 text-white"
                      >
                        <option value={TargetIndustry.MARKETING}>💻 Marketing Agency Specialty</option>
                        <option value={TargetIndustry.WEB_DESIGN}>🎨 Web Design Agency Specialty</option>
                        <option value={TargetIndustry.RECRUITMENT}>👔 Recruitment Specialist Specialty</option>
                        <option value={TargetIndustry.INSURANCE}>🛡️ Insurance Broking Specialty</option>
                        <option value={TargetIndustry.MORTGAGE}>🏠 Mortgage Broking Specialty</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white rounded-lg tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isVerifying && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isSupabaseConfigured ? "Send Magic OTP Code" : "Process Email Magic Link →"}</span>
                    </button>

                    <div className="relative my-4 flex py-1 items-center">
                      <div className="flex-grow border-t border-white/5" />
                      <span className="flex-shrink mx-3 text-[9px] uppercase tracking-wider text-zinc-500 font-mono select-none">Or Developer Access</span>
                      <div className="flex-grow border-t border-white/5" />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVipAccessBypass("uzorbenny51@gmail.com")}
                      className="w-full py-2.5 bg-gradient-to-r from-[#059669] via-[#0d9488] to-[#4f46e5] hover:opacity-95 text-xs font-extrabold text-white rounded-lg tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20"
                    >
                      👑 Instant VIP Developer Access
                    </button>
                    
                    {!isSupabaseConfigured && (
                      <p className="text-[10px] text-zinc-500 text-center mt-2 italic">
                        Provides instant passwordless login. Set `VITE_SUPABASE_URL` in Secrets to enable live Supabase verification.
                      </p>
                    )}
                  </form>
                ) : (
                  <form onSubmit={handleVerifyMagicCode} className="mt-6 space-y-4">
                    {isSupabaseConfigured ? (
                      <div className="bg-teal-950/60 border border-teal-900/50 p-3.5 rounded-lg text-xs text-teal-200">
                        Supabase sent a passwordless verification OTP code to <strong className="text-white">{authEmail}</strong>.
                        Please type the code received in your inbox below to initiate secure login.
                      </div>
                    ) : (
                      <div className="bg-indigo-950/60 border border-indigo-900/50 p-3.5 rounded-lg text-xs text-indigo-200">
                        We've simulated sending a passwordless magic OTP code to <strong className="text-white">{authEmail}</strong>. 
                        Please type <strong className="font-mono text-white underline">12345</strong> below to test verification and log in.
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Enter Code Received</label>
                      <input
                        type="text"
                        required
                        value={magicCodeInput}
                        onChange={(e) => setMagicCodeInput(e.target.value)}
                        placeholder={isSupabaseConfigured ? "e.g. 841920" : "e.g. 12345"}
                        maxLength={isSupabaseConfigured ? 8 : 5}
                        className="w-full bg-white/5 border border-white/10 rounded-lg text-center tracking-widest text-lg font-bold p-3 focus:outline-none focus:border-indigo-500 text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white rounded-lg uppercase cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isVerifying && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>Verify and Access Workspace</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setMagicLinkSent(false)}
                      className="w-full text-center text-indigo-400 hover:text-indigo-300 text-[11px] cursor-pointer"
                    >
                      ← Back to details edit
                    </button>
                  </form>
                )}
              </div>
            </section>
          </main>
        )}

        {/* Features Screen View */}
        {publicTab === "features" && (
          <main className="flex-1 max-w-5xl mx-auto px-6 py-12">
            <h2 className="text-3xl font-bold text-white text-center tracking-tight mb-3">Enterprise AI Powered Workspaces</h2>
            <p className="text-xs text-slate-400 text-center uppercase tracking-widest mb-12">Complete toolkit matching your vertical specializations</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#111113] border border-white/5 rounded-2xl p-6">
                <span className="text-xs font-mono text-indigo-400">MODULE 01</span>
                <h3 className="text-lg font-bold text-white mt-2">Specialty AI Growth Coach</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Interactive real-time advisory dashboard. Chat about package pricing, client contract models, outbound formulas, high-ticket scaling traps, and staff development.
                </p>
              </div>
              <div className="bg-[#111113] border border-white/5 rounded-2xl p-6">
                <span className="text-xs font-mono text-indigo-400">MODULE 02</span>
                <h3 className="text-lg font-bold text-white mt-2">Outbound Campaign copywriter</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Craft targeted cold emails, LinkedIn icebreakers, customized sales scripts, or automatic follow-up messages tailored to prospect parameters with one click.
                </p>
              </div>
              <div className="bg-[#111113] border border-white/5 rounded-2xl p-6">
                <span className="text-xs font-mono text-indigo-400">MODULE 03</span>
                <h3 className="text-lg font-bold text-white mt-2">Client Proposal SOW Architect</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Generate professional statements of work, client pricing breakdowns, estimate calculations, and binding agreement clauses ready for copy-pasting or printing.
                </p>
              </div>
              <div className="bg-[#111113] border border-white/5 rounded-2xl p-6">
                <span className="text-xs font-mono text-indigo-400">MODULE 04</span>
                <h3 className="text-lg font-bold text-white mt-2">Operational CRM Pipeline</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Avoid sheet clutter. Organize prospects from discovery stage to verified Won contracts. Track monthly premium volumes and overall conversion metrics in real-time.
                </p>
              </div>
            </div>
          </main>
        )}

        {/* Pricing Screen View (Stripe Simulation) */}
        {publicTab === "pricing" && (
          <main className="flex-1 max-w-5xl mx-auto px-6 py-12" id="public-plans-anchor">
            <h2 className="text-3xl font-bold text-white text-center tracking-tight mb-3">Flexible Plans Tailored For Agency Scale</h2>
            <p className="text-xs text-slate-400 text-center uppercase tracking-widest mb-12">Upgrade safely using mock stripe sandbox integration</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Starter */}
              <div className="bg-[#111113] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase">Starter</h3>
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-400 text-[9px] font-mono font-bold">3,000 COIN</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white mt-3">$24<span className="text-xs text-slate-500 font-normal">/mo</span></p>
                  <p className="text-[10px] text-slate-400 mt-2 italic">Perfect for individual consultants launching outbound campaigns.</p>
                  <ul className="text-xs text-slate-400 mt-6 space-y-2">
                    <li>• AI Advisory Workspace</li>
                    <li>• 3,000 Monthly Coin Credits</li>
                    <li>• Core Outreach presets</li>
                    <li>• Auto-logout lockout alert</li>
                  </ul>
                </div>
                <button onClick={() => showToast("Please sign in or use Fast Demo to configure payments!", "info")} className="w-full mt-6 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[11px] font-bold text-white border border-white/10 cursor-pointer">
                  Activate Starter Mock
                </button>
              </div>

              {/* Professional */}
              <div className="bg-[#111113] border border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between relative shadow-lg shadow-indigo-950/20">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-[9px] font-mono uppercase text-white tracking-widest font-bold">POPULAR</span>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase">Professional</h3>
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[9px] font-mono font-bold border border-indigo-905/30">10,000 COIN</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white mt-3">$49<span className="text-xs text-slate-500 font-normal">/mo</span></p>
                  <p className="text-[10px] text-slate-400 mt-2 italic">Ideal for specialized boutique recruiters, designers, and marketing experts.</p>
                  <ul className="text-xs text-slate-400 mt-6 space-y-2">
                    <li>• Unlimited Leads Tracking</li>
                    <li>• 10,000 Monthly Coin Credits</li>
                    <li>• Advanced proposals layouts</li>
                    <li>• Dynamic client specializations</li>
                  </ul>
                </div>
                <button onClick={() => showToast("Please sign in or use Fast Demo to configure payments!", "info")} className="w-full mt-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[11px] font-bold text-white cursor-pointer">
                  Activate Professional Mock
                </button>
              </div>

              {/* Growth */}
              <div className="bg-[#111113] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase">Growth</h3>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[9px] font-mono font-bold border border-purple-900/40">30,000 COIN</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white mt-3">$99<span className="text-xs text-slate-500 font-normal">/mo</span></p>
                  <p className="text-[10px] text-slate-400 mt-2 italic">Standard operational base for scaling service teams and agents.</p>
                  <ul className="text-xs text-slate-400 mt-6 space-y-2">
                    <li>• Priority Gemini AI support</li>
                    <li>• 30,000 Monthly Coin Credits</li>
                    <li>• Full pipeline CRM records</li>
                    <li>• SVG interactive analytics</li>
                  </ul>
                </div>
                <button onClick={() => showToast("Please sign in or use Fast Demo to configure payments!", "info")} className="w-full mt-6 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[11px] font-bold text-white border border-white/10 cursor-pointer">
                  Activate Growth Mock
                </button>
              </div>

              {/* Enterprise */}
              <div className="bg-[#111113] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase">Enterprise</h3>
                  <p className="text-xl font-extrabold text-white mt-3">Custom pricing</p>
                  <p className="text-[10px] text-slate-400 mt-2 italic">Custom setups, white-label PDF engines, and customizable coin packages.</p>
                  <ul className="text-xs text-slate-400 mt-6 space-y-2">
                    <li>• Custom pricing and coin quotas</li>
                    <li>• Dedicated server endpoints</li>
                    <li>• Custom branding outputs</li>
                    <li>• Premium support SLA</li>
                  </ul>
                </div>
                <button onClick={() => setPublicTab("contact")} className="w-full mt-6 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[11px] font-bold text-white border border-white/10 cursor-pointer">
                  Contact Sales Office
                </button>
              </div>
            </div>
          </main>
        )}

        {/* About Screen View */}
        {publicTab === "about" && (
          <main className="flex-1 max-w-3xl mx-auto px-6 py-12 text-zinc-300">
            <h2 className="text-3xl font-bold text-white mb-6">Built For Agency Craft</h2>
            <p className="text-sm leading-relaxed mb-4">
              Ria'S Scale AI was designed with a simple mandate: client acquisition and service formulation are complex processes. The tool aims to minimize manual writing bottlenecks.
            </p>
            <p className="text-sm leading-relaxed mb-4">
              Our core values bypass simulated tech jargon in favor of actual functional value - helping consultants, marketers, headhunters, and brokers generate targeted outreach text and close contracts with minimal friction.
            </p>
            <div className="bg-[#111113] border border-white/5 p-5 rounded-2xl mt-12 flex gap-4 items-center">
              <span className="text-3xl">🎯</span>
              <div>
                <h4 className="font-bold text-white text-sm">System Framework v1.4</h4>
                <p className="text-xs text-slate-400">Synchronized dynamically across Google Gemini 3.5 Flash models for optimized content structure.</p>
              </div>
            </div>
          </main>
        )}

        {/* Blog Screen View */}
        {publicTab === "blog" && (
          <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-8">Service Scale Playbook Records</h2>
            <div className="space-y-8">
              <article className="bg-[#111113] border border-white/5 p-6 rounded-2xl hover:border-indigo-500/25 transition-all">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">RETAINER STRUCTURING</span>
                <h3 className="text-lg font-bold text-white">How Webpage Redesigns Should be Priced to Escape the Time Trap</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Stop writing unique timeline estimates for simple page restructuring. Standardize your Webflow migrations, request 50% upfront, and retain clients via ongoing optimization subscription structures.
                </p>
              </article>
              <article className="bg-[#111113] border border-white/5 p-6 rounded-2xl hover:border-indigo-500/25 transition-all">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">SALES CONVERSIONS</span>
                <h3 className="text-lg font-bold text-white">Cold Emails That Actually Receive Booked Calls - The Rule of 7 Minutes</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Do not describe feature mechanics. Cite previous wins and ask for a 7-minute introductory call. Reduce prospect friction and lock in calendars easily.
                </p>
              </article>
            </div>
          </main>
        )}

        {/* Contact Screen View */}
        {publicTab === "contact" && (
          <main className="flex-1 max-w-md mx-auto px-6 py-12">
            <div className="bg-[#111113] border border-white/5 p-8 rounded-2xl text-slate-200">
              <h2 className="text-lg font-bold text-white tracking-tight text-center">Contact Enterprise Support</h2>
              <p className="text-xs text-slate-400 text-center mt-1">Submit high-ticket pricing inquiries or feedback directly</p>

              {contactSubmitted ? (
                <div className="bg-emerald-950/40 border border-emerald-900/60 p-4 rounded-xl text-xs text-emerald-200 text-center mt-6">
                  Thank you! Your strategic scaling inquiry has been logged in our mock routing databases. An agency consultant will reach out.
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }} className="mt-6 space-y-4">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Owner Name</label>
                    <input type="text" required placeholder="e.g. Sarah Jenkins" className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Business Email</label>
                    <input type="email" required placeholder="e.g. sarah@apexlabs.com" className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Describe Niche Scale Goals</label>
                    <textarea rows={3} required placeholder="What specialized challenges can we help you solve?" className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg uppercase tracking-wider cursor-pointer">
                    Submit Sales Inquiry →
                  </button>
                </form>
              )}
            </div>
          </main>
        )}

        <footer className="border-t border-white/5 bg-[#0d0d0f] py-8 text-center text-xs text-slate-500 mt-auto">
          <p>© 2026 Ria'S Scale AI platform. All mock databases and subscription systems activated.</p>
        </footer>
      </div>
    );
  }

  // --- RENDERING AUTHENTICATED SaaS INTERFACES (THEME: BENTO GRID) ---
  return (
    <div className="flex h-screen bg-[#09090b] text-slate-100 font-sans overflow-hidden">
      
      {/* Dynamic Niche Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userIndustry={userIndustry}
        onChangeIndustry={handleChangeIndustry}
        userProfile={{ name: session.name, email: session.email, company: session.company }}
        onLogout={handleLogout}
        subscriptionPlan={(subscription?.tierName || "Professional Plan").toUpperCase()}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        coins={subscription?.coins}
        maxCoins={subscription?.maxCoins}
      />

      {/* Main Content Area in Bento Style */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Global Authenticated Top Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-3 sm:px-6 bg-[#0c0c0e]/95 backdrop-blur-md sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            {/* Hamburger button for mobile views */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              id="mobile-sidebar-toggle"
              className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer shrink-0"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/20 border border-indigo-900/30 text-[10px] text-amber-400 font-mono italic shrink-0">
              ⭐ Premium Version
            </div>
            
            <span className="text-[10px] sm:text-xs text-slate-400 truncate flex items-center gap-1.5">
              <span className="hidden md:inline font-medium text-slate-500">Specialization:</span>
              <span className="text-white bg-indigo-600/10 border border-indigo-500/20 px-2 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-[11px] font-bold font-mono tracking-wide shadow-sm truncate max-w-[120px] sm:max-w-none">
                {userIndustry === TargetIndustry.MARKETING && "💻 Marketing"}
                {userIndustry === TargetIndustry.WEB_DESIGN && "🎨 Web Design"}
                {userIndustry === TargetIndustry.RECRUITMENT && "👔 Recruitment"}
                {userIndustry === TargetIndustry.INSURANCE && "🛡️ Insurance"}
                {userIndustry === TargetIndustry.MORTGAGE && "🏠 Mortgage"}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Real-time Dynamic Credit Badge */}
            {subscription && (
              <button
                onClick={() => setActiveTab("billing")}
                className="px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[9px] sm:text-[11px] text-amber-300 font-extrabold font-mono tracking-wider transition-all duration-200 flex items-center gap-1 cursor-pointer shrink-0 shadow-lg"
                title="Your Available Credits - Click to purchase more"
              >
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 fill-amber-400/20 animate-pulse" />
                <span>{subscription.coins?.toLocaleString() ?? "0"} <span className="hidden xs:inline">COINS</span></span>
              </button>
            )}

            {/* Quick search input */}
            <div className="relative hidden md:block shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2" />
              <input
                type="text"
                placeholder="Find leads..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full py-1 pl-8 pr-3 text-[11px] w-36 lg:w-48 xl:w-56 focus:outline-none focus:border-indigo-500/50 text-white transition-all"
              />
            </div>

            {/* User Profile Badge button links to Settings */}
            <button
              onClick={() => setActiveTab("settings")}
              className="group flex items-center gap-2 text-left hover:opacity-90 transition-all cursor-pointer"
              title="SaaS Settings"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md group-hover:scale-105 transition-all">
                {session?.name ? session.name.slice(0, 2).toUpperCase() : "US"}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-white leading-tight max-w-[80px] lg:max-w-[120px] truncate">{session?.name || "User"}</p>
                <p className="text-[9px] text-indigo-400 font-mono tracking-wider">WORKSPACE</p>
              </div>
            </button>
          </div>
        </header>

        {/* Dynamic Pages Area wrapped in responsive Bento sections */}
        <div className="flex-1 overflow-y-auto bg-[#09090b] p-6 max-h-[calc(100vh-64px)]">
          
          {/* 1. Integrated Specialty Dashboard Overview */}
          {activeTab === "dashboard" && (
            <DashboardOverview
              userProfile={{
                name: session.name,
                company: session.company,
                email: session.email
              }}
              userIndustry={userIndustry}
              leads={leads}
              campaignsCount={campaigns.length}
              contentsCount={contentList.length}
              proposalsCount={proposals.length}
              onNavigate={setActiveTab}
              subscriptionPlan={(subscription?.tierName || "Professional Plan").toUpperCase()}
            />
          )}

          {/* 2. Interactive Strategic Advisor AI Coaching Terminal */}
          {activeTab === "ai-assistant" && session && (
            <AiAssistant
              chatMessages={chatMessages}
              isSendingChat={isSendingChat}
              chatInput={chatInput}
              setChatInput={setChatInput}
              onSendMessage={handleSendChatMessage}
              onResetHistory={() => {
                const fresh = [
                  {
                    id: "chat-base-" + Date.now(),
                    role: "model" as const,
                    text: `Terminal environment synchronized with the latest strategic parameters under **${userIndustry}**. Ask about target lead conversions, scope parameters, or proposal pricing methods!`,
                    createdAt: new Date().toISOString()
                  }
                ];
                setChatMessages(fresh);
                LocalStorageDB.saveChatMessages(fresh);
              }}
              userIndustry={userIndustry}
              userProfile={{
                name: session.name,
                email: session.email,
                company: session.company
              }}
              isSupabaseConfigured={isSupabaseConfigured}
              leads={leads}
            />
          )}

          {/* 3. Prospects Database list panel */}
          {activeTab === "leads" && (
            <LeadsDatabase
              leads={leads}
              userIndustry={userIndustry}
              onAddLead={(newLead) => {
                const leadRecord: Lead = {
                  id: "lead-" + Date.now(),
                  ...newLead,
                  createdAt: new Date().toISOString()
                };
                const updatedList = [leadRecord, ...leads];
                setLeads(updatedList);
                LocalStorageDB.saveLeads(userIndustry, updatedList);
              }}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onDeleteLead={handleDeleteLead}
            />
          )}

          {/* 4. Outreach Copier Generator Panel */}
          {activeTab === "outreach" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form Block Left */}
              <div className="lg:col-span-5 bg-[#111113] border border-white/10 p-6 rounded-2xl h-fit">
                <h2 className="text-base font-bold text-white">Outbound Script Generator</h2>
                <p className="text-xs text-slate-400 mt-1">Select outreach campaign formats tailored using Google Gemini API structures.</p>

                <form onSubmit={handleGenerateOutreach} className="mt-6 space-y-4">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">SCRIPT FORMAT</label>
                    <select
                      value={outreachType}
                      onChange={(e) => setOutreachType(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs p-3 text-white"
                    >
                      <option value="email">📧 Cold B2B Outreach Email</option>
                      <option value="linkedin">💬 High-Conversion LinkedIn Message</option>
                      <option value="followup">⏰ Relationship Follow-Up sequence</option>
                      <option value="script">📞 Direct Phone Sales Script</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">RECIPIENT CONTACT NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. Michael Jenkins"
                      value={outreachRecipient}
                      onChange={(e) => setOutreachRecipient(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">PROSPECT CAPACITY / CONTEXT</label>
                    <input
                      type="text"
                      placeholder="e.g. Webflow redesign boutique with 15 designers"
                      value={outreachCompanySize}
                      onChange={(e) => setOutreachCompanySize(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">CALL-TO-ACTION OBJECTIVE</label>
                    <input
                      type="text"
                      placeholder="e.g. Schedule a 7-minute visual audit call"
                      value={outreachCustomGoal}
                      onChange={(e) => setOutreachCustomGoal(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingCampaign}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-xs font-bold text-white rounded-lg uppercase cursor-pointer"
                  >
                    {isGeneratingCampaign ? "GENERATING TEMPLATE..." : "Compose AI Script Link →"}
                  </button>
                </form>
              </div>

              {/* View Output panel Right */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-[#111113] border border-white/10 p-6 rounded-2xl flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs font-mono text-slate-400 uppercase">COPYRIGHT ENGINE OUTPUT</span>
                      {latestGeneratedCampaign && (
                        <button
                          onClick={handleSaveOutreachCampaign}
                          className="text-[10px] font-bold text-emerald-400 hover:underline"
                        >
                          Lock and Save into Campaign Catalog
                        </button>
                      )}
                    </div>

                    <div className="mt-4 p-4 bg-zinc-950/50 border border-white/5 rounded-xl font-sans text-xs text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[220px]">
                      {latestGeneratedCampaign || "Strategic copy structures formulated real-time will output here."}
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 mt-4 italic">
                    All drafts automatically optimize terms targeting client sectors within the {userIndustry} space.
                  </p>
                </div>

                {/* Local library catalogs saved previously */}
                <div className="bg-[#111113] border border-white/10 p-5 rounded-2xl">
                  <h3 className="text-xs font-bold text-white mb-3">Saved outreaches under {userIndustry}</h3>
                  {campaigns.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No custom sequences cataloged yet in local list storage.</p>
                  ) : (
                    <div className="space-y-2">
                      {campaigns.map((c) => (
                        <div key={c.id} className="p-2.5 bg-white/5 rounded-lg border border-white/5 text-[11px] flex justify-between items-center text-slate-300">
                          <div>
                            <strong>{c.name}</strong> ({c.type})
                          </div>
                          <button onClick={() => setLatestGeneratedCampaign(c.generatedText)} className="text-xs text-indigo-400 hover:underline">Load</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 5. Social Content Generator Dashboard */}
          {activeTab === "content" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form block */}
              <div className="lg:col-span-5 bg-[#111113] border border-white/10 p-6 rounded-2xl">
                <h2 className="text-base font-bold text-white">Value Ghostwriter Console</h2>
                <p className="text-xs text-slate-400 mt-1">Develop impactful social media campaigns tailored to high-ticket prospects.</p>

                <form onSubmit={handleGenerateContent} className="mt-6 space-y-4">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">PLATFORM OR TARGET CANNEL</label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs p-3 text-white"
                    >
                      <option value="linkedin_post">💼 Engaging LinkedIn Professional Post</option>
                      <option value="x_thread">🐤 Educational Twitter / X Thread</option>
                      <option value="blog">📑 Comprehensive Blog Article Outline</option>
                      <option value="newsletter">✉️ Value-First Substack Newsletter outline</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">PRIMARY TOPIC / THOUGHT PATTERN</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Why specialized headhunters fail when they refuse to map outplacement pipeline goals."
                      value={contentTopic}
                      onChange={(e) => setContentTopic(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">AESTHETIC STYLE & TONE</label>
                    <input
                      type="text"
                      placeholder="e.g. modern, structured, cynical yet constructive SaaS leader"
                      value={contentTone}
                      onChange={(e) => setContentTone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingContent}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-xs font-bold text-white rounded-lg uppercase cursor-pointer"
                  >
                    {isGeneratingContent ? "AUTHORING CONTENT COPY..." : "Orchestrate Social Asset →"}
                  </button>
                </form>
              </div>

              {/* Outputs showcase */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-[#111113] border border-white/10 p-6 rounded-2xl flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono text-slate-400">GHOSTWRITING PLATFORM ACCURACY</span>
                      {latestGeneratedContent && (
                        <button onClick={handleSaveSocialAsset} className="text-xs text-indigo-400 hover:underline">Catalog Draft Library</button>
                      )}
                    </div>

                    <div className="mt-4 p-4 bg-zinc-950/40 border border-white/5 rounded-xl font-sans text-xs text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[220px]">
                      {latestGeneratedContent || "Custom informational blog and newsletter copy assets mapping target specializations output here."}
                    </div>
                  </div>
                </div>

                <div className="bg-[#111113] border border-white/10 p-5 rounded-2xl">
                  <h3 className="text-xs font-bold text-white mb-3">Saved Social Assets</h3>
                  {contentList.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No copy assets cataloged yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {contentList.map((item) => (
                        <div key={item.id} className="p-2.5 bg-white/5 rounded-lg border border-white/5 text-[11px] flex justify-between items-center text-slate-300">
                          <div className="truncate pr-4 max-w-xs font-semibold">
                            {item.title}
                          </div>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-indigo-950 text-indigo-400 rounded shrink-0">{item.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 6. Proposal SOW Architect & Simulator */}
          {activeTab === "proposals" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* SOW Architect Input Panel */}
              <div className="lg:col-span-4 bg-[#111113] border border-white/10 p-6 rounded-2xl">
                <h2 className="text-base font-bold text-white">Proposal & SOW Architect</h2>
                <p className="text-xs text-slate-400 mt-1">Structure high-ticket corporate SOW proposals cleanly in seconds.</p>

                <form onSubmit={handleGenerateProposal} className="mt-6 space-y-4">
                  <div>
                    <label className="text-[10px] font-mono block text-slate-400 mb-1">CLIENT EXEC NAME</label>
                    <input type="text" required placeholder="e.g. David J" value={propClientName} onChange={(e) => setPropClientName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono block text-slate-400 mb-1">CLIENT COMPANY NAME</label>
                    <input type="text" required placeholder="e.g. Acme Scribe" value={propCompanyName} onChange={(e) => setPropCompanyName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono block text-slate-400 mb-1">SERVICE TITLE DECORATION</label>
                    <input type="text" placeholder="e.g. High-Volume Lead Pipeline Integration" value={propServiceTitle} onChange={(e) => setPropServiceTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono block text-slate-400 mb-1">USER VALUE STATEMENTS & SCOPE DELIVERABLES</label>
                    <textarea rows={3} placeholder="Customize three key milestones..." value={propScope} onChange={(e) => setPropScope(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono block text-slate-400 mb-1">ESTIMATED COST SCHEMAS</label>
                    <input type="text" placeholder="e.g. $4,500/month flat fee retainer" value={propCost} onChange={(e) => setPropCost(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg text-xs p-3 text-white" />
                  </div>

                  <button type="submit" disabled={isGeneratingProposal} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-xs font-bold text-white rounded-lg uppercase">
                    {isGeneratingProposal ? "COMPILING SOW PLATFORM..." : "Orchestrate Client Contract"}
                  </button>
                </form>
              </div>

              {/* Formatted Contract Output (Printable format) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-[#111113] border border-white/10 p-6 rounded-2xl flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Legal Agreement Contract Preview</span>
                      <div className="flex gap-2">
                        {latestGeneratedProposal && (
                          <>
                            <button onClick={handleSaveProposalToList} className="text-xs text-indigo-400 font-bold hover:underline">Save to Database</button>
                            <button onClick={() => { showToast("Success: Saved proposal output exported locally to format PDF!", "success"); }} className="text-xs text-emerald-400 font-bold hover:underline">Print / Export PDF</button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-white text-zinc-950 p-8 rounded-xl font-sans text-xs leading-relaxed max-h-[460px] overflow-y-auto shadow-inner select-text">
                      {latestGeneratedProposal ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                            <div>
                              <h3 className="text-sm font-bold uppercase">{latestGeneratedProposal.serviceTitle || "Custom service SOW"}</h3>
                              <p className="text-[10px] text-zinc-500">Prepared for: {latestGeneratedProposal.clientName} ({latestGeneratedProposal.companyName})</p>
                            </div>
                            <span className="text-[9px] border border-zinc-300 px-1 py-0.5 rounded uppercase font-mono font-bold">MUTUAL AGREEMENT</span>
                          </div>

                          <div className="whitespace-pre-wrap leading-normal font-sans text-[11px] text-zinc-800">
                            {latestGeneratedProposal.generatedText}
                          </div>

                          <div className="border-t border-zinc-200 pt-3 text-[9px] text-zinc-400 flex justify-between items-center italic">
                            <span>Platform authorized agency contract.</span>
                            <span>Version 1.0</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-20 text-zinc-400">
                          <p className="text-xl">📄</p>
                          <p className="text-xs mt-2 font-mono">Fill custom variables on Left and compile to trigger formal contract mockup.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Proposals index list */}
                <div className="bg-[#111113] border border-white/10 p-5 rounded-2xl">
                  <h3 className="text-xs font-bold text-white mb-3">Saved Proposal Documents</h3>
                  {proposals.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No document metrics recorded.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {proposals.map((p) => (
                        <div key={p.id} className="p-2.5 bg-white/5 rounded-lg border border-white/5 text-[11px] flex justify-between items-center text-slate-300">
                          <span className="truncate max-w-xs">{p.companyName} - {p.serviceTitle}</span>
                          <button onClick={() => setLatestGeneratedProposal(p)} className="text-xs text-indigo-400 font-mono">View</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 7. CRM Interactive Pipe Organizer (Kanban Card Board) */}
          {activeTab === "crm" && (
            <CrmBoard
              leads={leads}
              userIndustry={userIndustry}
              onUpdateLeadStatus={handleUpdateLeadStatus}
            />
          )}

          {/* 8. Interactive Specialty Analytics Dashboard */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              
              {/* Top Summary Row Bento Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#111113] border border-white/10 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Outbox Outreach conversion</span>
                  <p className="text-2xl font-extrabold text-indigo-400 mt-2">15.4%</p>
                  <p className="text-[10px] text-slate-500 mt-1">Average benchmark conversion</p>
                </div>
                <div className="bg-[#111113] border border-white/10 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Proposals Generated</span>
                  <p className="text-2xl font-extrabold text-[#38bdf8] mt-2">{proposals.length}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Direct from generator hub</p>
                </div>
                <div className="bg-[#111113] border border-white/10 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Active Retainers Volume</span>
                  <p className="text-2xl font-extrabold text-emerald-400 mt-2">
                    {userIndustry === TargetIndustry.MARKETING ? "$14,500" :
                     userIndustry === TargetIndustry.WEB_DESIGN ? "$28,000" :
                     userIndustry === TargetIndustry.RECRUITMENT ? "$45,200" :
                     userIndustry === TargetIndustry.INSURANCE ? "$12,400" : "$75,000"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Custom tuned from operational list</p>
                </div>
                <div className="bg-[#111113] border border-white/10 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">AI Assets Cataloged</span>
                  <p className="text-2xl font-extrabold text-white mt-2">{contentList.length + campaigns.length}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Outbounds, followups & post metrics</p>
                </div>
              </div>

              {/* Graphic metrics simulation block (Raw elegant SVG chart) */}
              <div className="bg-[#111113] border border-white/10 p-6 rounded-2xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">Monthly Active Client Growth Chart</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Calculated based on simulated subscription metrics.</p>
                  </div>
                  <span className="text-[10px] bg-indigo-950 text-indigo-400 px-3 py-1 border border-indigo-900 rounded font-mono">RETRIEVING LIVE METRICS</span>
                </div>

                {/* Simulated Chart Container */}
                <div className="h-64 flex items-end gap-3 px-4 relative">
                  
                  {/* Grid Lines mockup */}
                  <div className="absolute inset-x-0 bottom-4 border-b border-white/5" />
                  <div className="absolute inset-x-0 bottom-16 border-b border-white/5" />
                  <div className="absolute inset-x-0 bottom-28 border-b border-white/5" />
                  <div className="absolute inset-x-0 bottom-40 border-b border-white/5" />
                  
                  {/* Data Bar 01 */}
                  <div className="flex-1 flex flex-col items-center gap-2 group z-10 cursor-pointer">
                    <span className="text-[9px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">$12k</span>
                    <div className="w-full bg-zinc-800 hover:bg-neutral-700 h-10 rounded-t transition-all" />
                    <span className="text-[10px] text-slate-400 font-mono">JAN</span>
                  </div>

                  {/* Data Bar 02 */}
                  <div className="flex-1 flex flex-col items-center gap-2 group z-10 cursor-pointer">
                    <span className="text-[9px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">$18k</span>
                    <div className="w-full bg-zinc-800 hover:bg-neutral-700 h-16 rounded-t transition-all" />
                    <span className="text-[10px] text-slate-400 font-mono">FEB</span>
                  </div>

                  {/* Data Bar 03 */}
                  <div className="flex-1 flex flex-col items-center gap-2 group z-10 cursor-pointer">
                    <span className="text-[9px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">$15k</span>
                    <div className="w-full bg-zinc-800 hover:bg-neutral-700 h-14 rounded-t transition-all" />
                    <span className="text-[10px] text-slate-400 font-mono">MAR</span>
                  </div>

                  {/* Data Bar 04 */}
                  <div className="flex-1 flex flex-col items-center gap-2 group z-10 cursor-pointer">
                    <span className="text-[9px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">$24k</span>
                    <div className="w-full bg-zinc-800 hover:bg-neutral-700 h-24 rounded-t transition-all" />
                    <span className="text-[10px] text-slate-400 font-mono">APR</span>
                  </div>

                  {/* Data Bar 05 */}
                  <div className="flex-1 flex flex-col items-center gap-2 group z-10 cursor-pointer">
                    <span className="text-[9px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">$32k</span>
                    <div className="w-full bg-zinc-800 hover:bg-neutral-700 h-32 rounded-t transition-all" />
                    <span className="text-[10px] text-slate-400 font-mono">MAY</span>
                  </div>

                  {/* Data Bar 06 (User target industry simulated peak!) */}
                  <div className="flex-1 flex flex-col items-center gap-2 group z-10 cursor-pointer">
                    <span className="text-[9px] font-mono text-emerald-400 font-bold opacity-100">$45k</span>
                    <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 h-44 rounded-t hover:brightness-110 transition-all shadow shadow-indigo-900" />
                    <span className="text-[10px] text-white font-mono font-bold">CURRENT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. Billing and Cost Premium Setup (Stripe Engine Integration Dashboard) */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="bg-[#111113] border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🪙</span> Stripe Coin Credits Ledger & Billings Matrix
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Track payment statuses, available API tokens, and simulate coin-based workspace lockdowns securely.</p>
                </div>
                {subscription && (
                  <div className="bg-indigo-950/40 border border-indigo-900/50 p-3 rounded-xl text-xs text-indigo-300">
                    Active Plan: <strong className="text-white">{subscription.tierName}</strong> ({subscription.price})
                  </div>
                )}
              </div>

              {/* Subscriptions toggle cards representation with the exact new coin credit tiers */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Starter */}
                <div className={`p-5 rounded-2xl bg-[#111113] flex flex-col justify-between ${subscription?.planId === 'starter' ? 'border-2 border-indigo-500' : 'border border-white/5'}`}>
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-400 text-xs uppercase">Starter Plan</h3>
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-400 text-[9px] font-mono font-bold">3,000 COIN</span>
                    </div>
                    <p className="text-2xl font-extrabold text-white mt-2">$24<span className="text-xs text-slate-500 font-normal">/mo</span></p>
                    <p className="text-[11px] text-slate-400 mt-2 italic">Standard single-seat templates and basic advisory query helper.</p>
                  </div>
                  <button onClick={() => handleSelectStripePlan("starter", "$24/mo")} className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-[10px] tracking-wider uppercase font-bold text-slate-300 border border-white/10 rounded-lg mt-6 cursor-pointer">
                    {subscription?.planId === 'starter' ? "CURRENTLY ACTIVE" : "ACTIVATE STARTER"}
                  </button>
                </div>

                {/* Professional */}
                <div className={`p-5 rounded-2xl bg-[#111113] flex flex-col justify-between ${subscription?.planId === 'professional' ? 'border-2 border-indigo-500' : 'border border-white/5'}`}>
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-indigo-400 text-xs uppercase font-sans">Professional</h3>
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[9px] font-mono font-bold border border-indigo-900/40">10,000 COIN</span>
                    </div>
                    <p className="text-2xl font-extrabold text-white mt-2">$49<span className="text-xs text-slate-500 font-normal">/mo</span></p>
                    <p className="text-[11px] text-slate-400 mt-2 italic">Ideal for growing marketing agency, design specialists, and independent recruiters.</p>
                  </div>
                  <button onClick={() => handleSelectStripePlan("professional", "$49/mo")} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-[10px] tracking-wider uppercase font-bold text-white rounded-lg mt-6 cursor-pointer">
                    {subscription?.planId === 'professional' ? "CURRENTLY ACTIVE" : "ACTIVATE PROFESSIONAL"}
                  </button>
                </div>

                {/* Growth */}
                <div className={`p-5 rounded-2xl bg-[#111113] flex flex-col justify-between ${subscription?.planId === 'growth' ? 'border-2 border-indigo-500' : 'border border-white/5'}`}>
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-400 text-xs uppercase font-sans">Growth Pack</h3>
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[9px] font-mono font-bold border border-purple-900/40">30,000 COIN</span>
                    </div>
                    <p className="text-2xl font-extrabold text-white mt-2">$99<span className="text-xs text-slate-500 font-normal">/mo</span></p>
                    <p className="text-[11px] text-slate-400 mt-2 italic">High volume outbound pipelines and copywriting structures for entire agency teams.</p>
                  </div>
                  <button onClick={() => handleSelectStripePlan("growth", "$99/mo")} className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-[10px] tracking-wider uppercase font-bold text-slate-300 border border-white/10 rounded-lg mt-6 cursor-pointer">
                    {subscription?.planId === 'growth' ? "CURRENTLY ACTIVE" : "ACTIVATE GROWTH PACK"}
                  </button>
                </div>

                {/* Enterprise Customized Controls */}
                <div className={`p-5 rounded-2xl bg-[#111113] flex flex-col justify-between ${subscription?.planId === 'enterprise' ? 'border-2 border-emerald-500' : 'border border-white/5'}`}>
                  <div>
                    <h3 className="font-bold text-emerald-400 text-xs uppercase">Enterprise Custom</h3>
                    <p className="text-[10px] text-slate-400 mt-1 italic">Input your custom pricing specifications and coin limits below:</p>
                    
                    <div className="mt-3 space-y-2.5">
                      <div>
                        <label className="text-[9px] font-mono text-zinc-500 uppercase block">Custom Coin Credit</label>
                        <input 
                          type="number"
                          value={entCustomCoins}
                          onChange={(e) => setEntCustomCoins(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-zinc-500 uppercase block">Custom Price ($/mo)</label>
                        <input 
                          type="number"
                          value={entCustomPrice}
                          onChange={(e) => setEntCustomPrice(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSelectStripePlan("enterprise", `$${entCustomPrice}/mo`, entCustomCoins)} 
                    className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 text-[10px] tracking-wider uppercase font-bold text-emerald-300 border border-emerald-800/40 rounded-lg mt-4 cursor-pointer"
                  >
                    {subscription?.planId === 'enterprise' ? "RE-DEPLOY CUSTOM" : "UPGRADE ENTERPRISE"}
                  </button>
                </div>

              </div>

              {/* Advanced Coin Ledger Monitor & Diagnostics Simulator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                
                {/* Left Side: Real-time Credit status and test buttons */}
                <div className="bg-[#111113] border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-2 font-bold">🔐 Coin Wallet Diagnostics Center</h3>
                    <p className="text-xs text-slate-400">
                      Instantly test how the system reacts to depletion. Since coin credit is checking reactively, reaching 0 coins will instantly terminate the session, trigger the warning banner, and log you out.
                    </p>

                    <div className="my-6 p-4 bg-zinc-950/40 border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Remaining Balance</p>
                        <h4 className="text-3xl font-extrabold text-white mt-1 font-sans">
                          🪙 {(subscription?.coins ?? 10000).toLocaleString()}{" "}
                          <span className="text-xs text-zinc-500 font-mono font-normal">credits</span>
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Limit Capacity</p>
                        <p className="text-xs text-zinc-300 font-bold mt-1 font-mono">
                          {((subscription?.coins ?? 10000) / (subscription?.maxCoins ?? 10000) * 100).toFixed(0)}% Utilized
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-white/5 mb-6">
                      <div 
                        style={{ width: `${Math.min(100, Math.max(0, ((subscription?.coins ?? 10000) / (subscription?.maxCoins ?? 10000)) * 100))}%` }}
                        className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${(subscription?.coins ?? 10000) < 2000 ? "from-red-500 to-amber-500" : "from-indigo-500 via-purple-500 to-emerald-400"}`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => chargeCoins(2500, "Simulator Test Charge")}
                      className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] tracking-wider uppercase font-bold text-slate-300 border border-white/5 rounded-lg cursor-pointer"
                    >
                      🔥 Spend 2,500 Coins
                    </button>
                    <button
                      onClick={() => handleLockoutRedirect("Self-Triggered Account Credit Depletion Simulator")}
                      className="flex-1 py-2.5 bg-rose-950 hover:bg-rose-900 text-[10px] tracking-wider uppercase font-bold text-rose-200 border border-rose-800/40 rounded-lg cursor-pointer"
                    >
                      🛑 Trigger Direct Lockout
                    </button>
                  </div>
                </div>

                {/* Right Side: Price manifest sheet */}
                <div className="bg-[#111113] border border-white/10 p-6 rounded-2xl">
                  <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-2 font-bold">📋 Operational Cost Sheet</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    The platform computes the complexity of active LLM and pipeline interactions. Every query and template creation consumes the following:
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-zinc-900/40 rounded-lg border border-white/5">
                      <span className="text-slate-300 font-sans font-medium">Add Prospect Lead</span>
                      <strong className="text-amber-400 font-mono font-extrabold">100 Coins</strong>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-zinc-900/40 rounded-lg border border-white/5">
                      <span className="text-slate-300 font-sans font-medium">AI Copywriter Content Builder</span>
                      <strong className="text-amber-400 font-mono font-extrabold">300 Coins</strong>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-zinc-900/40 rounded-lg border border-white/5">
                      <span className="text-slate-300 font-sans font-medium">AI Strategic Consultation Chat Response</span>
                      <strong className="text-amber-400 font-mono font-extrabold">350 Coins</strong>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-zinc-900/40 rounded-lg border border-white/5">
                      <span className="text-slate-300 font-sans font-medium">AI Outbound Campaign Template Generator</span>
                      <strong className="text-amber-400 font-mono font-extrabold">400 Coins</strong>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-zinc-900/40 rounded-lg border border-white/5">
                      <span className="text-slate-300 font-sans font-medium">AI custom Proposal & SOW Draft</span>
                      <strong className="text-amber-400 font-mono font-extrabold">600 Coins</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 10. Platform Settings */}
          {activeTab === "settings" && appSettings && (
            <div className="max-w-2xl bg-[#111113] border border-white/10 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white">Application Environment configurations</h2>
              <p className="text-xs text-slate-400 mt-1">Manage private credentials, UI controls and API metadata definitions.</p>

              <form onSubmit={handleSaveSettings} className="mt-6 space-y-6">
                <div>
                  <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-3">Enterprise credentials</h3>
                  <div className="p-4 bg-zinc-950/60 border border-white/5 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Database Engine Host</span>
                      <strong className="text-indigo-400 font-mono">SUPABASE POSTGRESQL (ACTIVE)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Access Key Vault Status</span>
                      <strong className="text-emerald-400 font-mono">CONNECTED SECRETS PANEL</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Interface Settings</h3>
                  
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <label className="text-xs font-medium text-white block">Email Notification Alerts</label>
                      <span className="text-[11px] text-slate-400">Receive alerts when strategic proposal audits finish compiling.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={appSettings.notificationsEnabled}
                      onChange={(e) => setAppSettings({ ...appSettings, notificationsEnabled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-white/10 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <label className="text-xs font-medium text-white block">Strategic Advisor LLM Model</label>
                      <span className="text-[11px] text-slate-400">Change target Gemini generative parameters dynamically.</span>
                    </div>
                    <select
                      value={appSettings.geminiModel}
                      onChange={(e) => setAppSettings({ ...appSettings, geminiModel: e.target.value })}
                      className="bg-zinc-900 border border-white/10 text-xs p-2 rounded text-white"
                    >
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash (Optimized)</option>
                      <option value="gemini-3.5-pro">Gemini 3.5 Pro (Precision Context)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white uppercase tracking-wider rounded-lg cursor-pointer">
                    Save Configurations
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Custom Toast Notification Panel */}
          {toast && (
            <div className="fixed bottom-6 right-6 z-[9999] animate-fade-in pointer-events-auto">
              <div className={`p-4 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-md max-w-sm border-white/10 ${
                toast.type === "success" 
                  ? "bg-emerald-950/95 text-emerald-100 border-emerald-500/30"
                  : toast.type === "error"
                  ? "bg-rose-950/95 text-rose-100 border-rose-500/30"
                  : "bg-indigo-950/95 text-indigo-100 border-indigo-500/30"
              }`}>
                <span className="text-base shrink-0 select-none">
                  {toast.type === "success" ? "✨" : toast.type === "error" ? "🛑" : "💡"}
                </span>
                <p className="text-xs font-semibold leading-relaxed font-sans">{toast.message}</p>
                <button 
                  onClick={() => setToast(null)}
                  className="ml-2 hover:opacity-80 text-[11px] text-neutral-400 hover:text-white cursor-pointer select-none border border-neutral-800 rounded px-1"
                >
                  dismiss
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
