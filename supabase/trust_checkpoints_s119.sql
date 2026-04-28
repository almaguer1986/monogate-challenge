-- L5 entity checkpoints — Phase 1 of the Trust Depth Protocol.
-- Run in Supabase SQL editor.
-- Date: 2026-04-28
--
-- One row per entity. The checkpoint_hash captures the entity's
-- canonical state at first registration; it is NEVER updated.
-- That stability is what makes it useful as the L5 floor:
-- "this entity exists and was registered with this hash at this
-- time."
--
-- L4 attestations on subsequent CapCard responses include this
-- hash in the _attestation field so a verifier can chain
-- "is this entity legit?" (L5) with "is THIS response legit?" (L4)
-- in one round trip.
--
-- Schema is intentionally narrow — entity_id, hash, timestamp.
-- Future trust levels (L3 network consensus) get separate tables.

create table if not exists public.entity_checkpoints (
  id              uuid primary key default gen_random_uuid(),
  entity_id       text not null unique,
  checkpoint_hash text not null,                    -- "sha256:<hex>"
  seed_canonical  text,                             -- copy of hash for audit
  registered_at   timestamptz not null default now()
);

create index if not exists entity_checkpoints_hash_idx
  on public.entity_checkpoints (checkpoint_hash);

-- ─── RLS ─────────────────────────────────────────────────────────

alter table public.entity_checkpoints enable row level security;

-- READ — fully public. The whole point of L5 is that anyone can
-- check whether an entity was ever registered, without auth.
drop policy if exists "anon_read_entity_checkpoints" on public.entity_checkpoints;
create policy "anon_read_entity_checkpoints"
  on public.entity_checkpoints for select
  to anon, authenticated using (true);

-- INSERT — open. Registration is idempotent at the application
-- layer (the unique constraint on entity_id prevents duplicates;
-- repeat-registers fall through and the existing row wins).
drop policy if exists "anon_insert_entity_checkpoints" on public.entity_checkpoints;
create policy "anon_insert_entity_checkpoints"
  on public.entity_checkpoints for insert
  to anon, authenticated with check (true);

-- UPDATE / DELETE — disallowed. L5 checkpoints are immutable by
-- design; a notary that can rewrite history is no notary.

-- ─── Smoke tests (run after the above) ──────────────────────────
-- insert into public.entity_checkpoints (entity_id, checkpoint_hash)
--   values ('__test__alice', 'sha256:0000...');
-- select * from public.entity_checkpoints where entity_id like '__test__%';
-- delete from public.entity_checkpoints where entity_id like '__test__%';
-- (DELETE only works via the service role; anon will be blocked
-- by the missing policy — that's intentional.)
