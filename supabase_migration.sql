-- Agency Growth AI: Supabase PostgreSQL Database Schema
-- Initialize production-ready database schema with Row Level Security (RLS) rules, indexes, and automated updated_at triggers.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. USERS PROFILE TABLE
-- ==========================================
create table public.users (
    id uuid references auth.users on delete cascade not null primary key,
    email text not null unique,
    name text,
    company text,
    industry text not null default 'Marketing Agency',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) for Users
alter table public.users enable row level security;

create policy "Users can view their own profile."
    on public.users for select
    using (auth.uid() = id);

create policy "Users can update their own profile."
    on public.users for update
    using (auth.uid() = id);

create policy "Enable insert for authenticated users only"
    on public.users for insert
    with check (auth.uid() = id);


-- ==========================================
-- 2. SUBSCRIPTIONS TABLE
-- ==========================================
create table public.subscriptions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    stripe_subscription_id text unique,
    plan_id text not null default 'starter', -- 'starter', 'professional', 'growth', 'enterprise'
    status text not null default 'none', -- 'active', 'canceled', 'trailing', 'past_due', 'none'
    price_id text,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Subscriptions
alter table public.subscriptions enable row level security;

create policy "Users can view their own subscriptions."
    on public.subscriptions for select
    using (auth.uid() = user_id);

-- Create subscription index for Stripe callback searches
create index idx_subscriptions_stripe_id on public.subscriptions (stripe_subscription_id);
create index idx_subscriptions_user_id on public.subscriptions (user_id);


-- ==========================================
-- 3. LEADS TABLE
-- ==========================================
create table public.leads (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    name text not null,
    company text not null,
    industry text, -- Target client vertical specialization (e.g. Health, Tech, SaaS)
    email text,
    phone text,
    status text not null default 'New Lead', -- 'New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Leads
alter table public.leads enable row level security;

create policy "Users can select their own leads."
    on public.leads for select
    using (auth.uid() = user_id);

create policy "Users can insert their own leads."
    on public.leads for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own leads."
    on public.leads for update
    using (auth.uid() = user_id);

create policy "Users can delete their own leads."
    on public.leads for delete
    using (auth.uid() = user_id);

-- Indexes for performance filtering on leads
create index idx_leads_user_status on public.leads (user_id, status);
create index idx_leads_created_at on public.leads (created_at desc);


-- ==========================================
-- 4. OUTREACH CAMPAIGNS TABLE
-- ==========================================
create table public.outreach_campaigns (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    name text not null,
    type text not null, -- 'email', 'linkedin', 'script', 'followup'
    specialized_industry text not null, -- The operating profile industry (Marketing, Web Design, Recruiters, etc.)
    subject text,
    generated_text text not null,
    recipient_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Campaigns
alter table public.outreach_campaigns enable row level security;

create policy "Users can view their outreach campaigns."
    on public.outreach_campaigns for select
    using (auth.uid() = user_id);

create policy "Users can insert outreach campaigns."
    on public.outreach_campaigns for insert
    with check (auth.uid() = user_id);

create policy "Users can delete outreach campaigns."
    on public.outreach_campaigns for delete
    using (auth.uid() = user_id);

create index idx_campaigns_user_id on public.outreach_campaigns (user_id);


-- ==========================================
-- 5. GENERATED CONTENT TABLE
-- ==========================================
create table public.generated_content (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    title text not null,
    type text not null, -- 'linkedin_post', 'x_thread', 'blog', 'newsletter', 'marketing_email'
    specialized_industry text not null,
    prompt text not null,
    output_text text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Generated Content
alter table public.generated_content enable row level security;

create policy "Users can view their generated content."
    on public.generated_content for select
    using (auth.uid() = user_id);

create policy "Users can save generated content."
    on public.generated_content for insert
    with check (auth.uid() = user_id);

create policy "Users can delete generated content."
    on public.generated_content for delete
    using (auth.uid() = user_id);

create index idx_content_user_id on public.generated_content (user_id);


-- ==========================================
-- 6. PROPOSALS TABLE
-- ==========================================
create table public.proposals (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    client_name text not null,
    company_name text not null,
    service_title text not null,
    scope_of_work text,
    contract_terms text,
    estimated_cost text,
    generated_text text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Proposals
alter table public.proposals enable row level security;

create policy "Users can view their proposals."
    on public.proposals for select
    using (auth.uid() = user_id);

create policy "Users can save proposals."
    on public.proposals for insert
    with check (auth.uid() = user_id);

create policy "Users can delete proposals."
    on public.proposals for delete
    using (auth.uid() = user_id);

create index idx_proposals_user_id on public.proposals (user_id);


-- ==========================================
-- 7. CRM PIPELINES & HISTORY RECORDS
-- ==========================================
create table public.crm_records (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    lead_id uuid references public.leads(id) on delete cascade not null,
    previous_stage text,
    new_stage text not null,
    deal_value numeric(12, 2) default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for CRM records
alter table public.crm_records enable row level security;

create policy "Users can view their CRM stage records."
    on public.crm_records for select
    using (auth.uid() = user_id);

create policy "Users can write CRM log records."
    on public.crm_records for insert
    with check (auth.uid() = user_id);

create index idx_crm_lead_history on public.crm_records (lead_id);


-- ==========================================
-- 8. ANALYTICS SNAPSHOTS TABLE
-- ==========================================
create table public.analytics (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    leads_count integer default 0,
    outreach_sent_count integer default 0,
    proposals_count integer default 0,
    conversion_rate double precision default 0.0,
    active_mrr numeric(12, 2) default 0.00,
    snapshot_date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Analytics
alter table public.analytics enable row level security;

create policy "Users can view their analytics logs."
    on public.analytics for select
    using (auth.uid() = user_id);

create unique index idx_analytics_user_date on public.analytics (user_id, snapshot_date);


-- ==========================================
-- 9. SETTINGS TABLE
-- ==========================================
create table public.settings (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null unique,
    theme text not null default 'dark',
    primary_color text not null default 'indigo',
    gemini_model text not null default 'gemini-3.5-flash',
    notifications_enabled boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Settings
alter table public.settings enable row level security;

create policy "Users can view their app settings."
    on public.settings for select
    using (auth.uid() = user_id);

create policy "Users can update their app settings."
    on public.settings for update
    using (auth.uid() = user_id);

create policy "Users can insert their initial settings."
    on public.settings for insert
    with check (auth.uid() = user_id);


-- ==========================================
-- AUTOMATION TRIGGER FOR TIMESTAMP SYNCS
-- ==========================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Apply updated_at Triggers on critical tables
create trigger sync_users_updated_at before update on public.users
    for each row execute procedure public.handle_updated_at();

create trigger sync_subscriptions_updated_at before update on public.subscriptions
    for each row execute procedure public.handle_updated_at();

create trigger sync_leads_updated_at before update on public.leads
    for each row execute procedure public.handle_updated_at();

create trigger sync_settings_updated_at before update on public.settings
    for each row execute procedure public.handle_updated_at();


-- ==========================================
-- REGISTER TRIGGER TO AUTO-PROVISION SETTINGS ON USER SIGNUP
-- ==========================================
create or replace function public.handle_new_user_provision()
returns trigger as $$
begin
    -- Auto insert standard configuration settings
    insert into public.settings (user_id, theme, primary_color, gemini_model, notifications_enabled)
    values (new.id, 'dark', 'indigo', 'gemini-3.5-flash', true);
    return new;
end;
$$ language plpgsql;

create trigger sync_new_user_provision after insert on public.users
    for each row execute procedure public.handle_new_user_provision();
