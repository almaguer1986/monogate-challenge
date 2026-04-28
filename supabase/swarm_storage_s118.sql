-- Swarm coordination tables for Layer 3 of CapCard transferable-competence.
-- Run in Supabase SQL editor.
-- Date: 2026-04-28
--
-- Two tables:
--   swarms          — one row per swarm (problem + agent roster + status)
--   swarm_updates   — append-only log of agent findings, dead ends,
--                     status transitions; the "real-time channel"
--                     for agents to see each other's progress.
--
-- Trust model: same as petal_storage_s117 — anon RLS allows CRUD
-- because there is no per-agent auth. Spam-resistance is "out of
-- scope at research-blog scale." If swarm spam shows up, gate the
-- POST endpoint with a rate-limiter or Cloudflare Turnstile.
--
-- Real-time: clients (agents) can either poll
-- `/api/swarm/{id}/updates?since=...` over HTTP (simple, works
-- today with no extra infra) or subscribe to Supabase Realtime
-- on the `swarm_updates` channel for sub-second fan-out. The API
-- doesn't require either; both are valid client choices.

-- ─── swarms ──────────────────────────────────────────────────────

create table if not exists public.swarms (
  swarm_id        text primary key,
  problem         text not null,
  source_agent    text not null,                 -- the playbook source
  source_tier     text,                          -- captured at creation
  source_trust    float,                         -- captured at creation
  agent_roster    jsonb not null default '[]'::jsonb,  -- list of {agent_id, strategy, status, prompt}
  status          text not null default 'active' check (status in ('active', 'solved', 'abandoned')),
  solved_by       text,                          -- agent_id of solver, when status='solved'
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists swarms_source_agent_idx on public.swarms (source_agent);
create index if not exists swarms_status_idx on public.swarms (status);

-- Auto-bump updated_at on UPDATE.
create or replace function public.swarms_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists swarms_touch on public.swarms;
create trigger swarms_touch
  before update on public.swarms
  for each row execute function public.swarms_touch_updated_at();

-- ─── swarm_updates ───────────────────────────────────────────────

create table if not exists public.swarm_updates (
  id                  uuid primary key default gen_random_uuid(),
  swarm_id            text not null references public.swarms(swarm_id) on delete cascade,
  agent_id            text not null,
  status              text not null check (status in ('progress', 'stuck', 'solved', 'partial')),
  finding             text,
  dead_ends           jsonb default '[]'::jsonb,
  needs_from_others   text,
  lean_snippet        text,
  created_at          timestamptz not null default now()
);

create index if not exists swarm_updates_swarm_idx
  on public.swarm_updates (swarm_id, created_at);
create index if not exists swarm_updates_agent_idx
  on public.swarm_updates (agent_id);

-- ─── RLS ─────────────────────────────────────────────────────────

alter table public.swarms          enable row level security;
alter table public.swarm_updates   enable row level security;

drop policy if exists "anon_read_swarms" on public.swarms;
create policy "anon_read_swarms"
  on public.swarms for select
  to anon, authenticated using (true);

drop policy if exists "anon_insert_swarms" on public.swarms;
create policy "anon_insert_swarms"
  on public.swarms for insert
  to anon, authenticated with check (true);

drop policy if exists "anon_update_swarms" on public.swarms;
create policy "anon_update_swarms"
  on public.swarms for update
  to anon, authenticated using (true) with check (true);

drop policy if exists "anon_read_swarm_updates" on public.swarm_updates;
create policy "anon_read_swarm_updates"
  on public.swarm_updates for select
  to anon, authenticated using (true);

drop policy if exists "anon_insert_swarm_updates" on public.swarm_updates;
create policy "anon_insert_swarm_updates"
  on public.swarm_updates for insert
  to anon, authenticated with check (true);

-- swarm_updates is append-only; no UPDATE / DELETE policy on purpose.

-- ─── Realtime ────────────────────────────────────────────────────
-- Add the table to the realtime publication so subscribed clients
-- get a push the moment any agent posts an update.
alter publication supabase_realtime add table public.swarm_updates;

-- ─── Smoke tests (run after the above) ──────────────────────────
-- insert into public.swarms (swarm_id, problem, source_agent)
--   values ('__test__001', 'close sin_not_in_eml', '__test__alice');
-- insert into public.swarm_updates (swarm_id, agent_id, status, finding)
--   values ('__test__001', '__test__bob', 'progress', 'found AnalyticAt');
-- select * from public.swarm_updates where swarm_id like '__test__%';
-- delete from public.swarms where swarm_id like '__test__%';
