-- ============================================================
-- SECIT VII Golf Cup — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension (already enabled on most Supabase projects)
create extension if not exists "uuid-ossp";

-- ─── Table ───────────────────────────────────────────────────────────────────
-- One row per player-per-hole-per-matchup.
-- matchup_id and player_id are text slugs matching src/lib/tournament.js
-- (e.g. matchup_id='match1-1', player_id='derek')

create table if not exists hole_scores (
  id            uuid primary key default uuid_generate_v4(),
  matchup_id    text    not null,
  hole_number   integer not null check (hole_number between 1 and 18),
  player_id     text    not null,
  gross_strokes integer check (gross_strokes between 1 and 20),
  updated_at    timestamptz not null default now(),

  -- Only one score per player per hole per matchup
  unique (matchup_id, hole_number, player_id)
);

-- Index for fast per-matchup queries
create index if not exists idx_hole_scores_matchup on hole_scores (matchup_id);

-- Auto-update updated_at on upsert
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_hole_scores_updated_at on hole_scores;
create trigger trg_hole_scores_updated_at
  before update on hole_scores
  for each row execute function set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Tournament is a trusted group — allow all reads and writes.
-- For a real production app you'd restrict writes per team with JWT claims.

alter table hole_scores enable row level security;

-- Public read (leaderboard visible to all)
create policy "anyone can read scores"
  on hole_scores for select
  using (true);

-- Anyone can insert/update scores (trust-based — see note above)
create policy "anyone can upsert scores"
  on hole_scores for insert
  with check (true);

create policy "anyone can update scores"
  on hole_scores for update
  using (true);

-- ─── 19th Hole: Drinks Table ─────────────────────────────────────────────────
-- One row per drink logged. player_id matches slugs in src/lib/tournament.js.

create table if not exists drinks (
  id          uuid primary key default uuid_generate_v4(),
  player_id   text        not null,
  logged_at   timestamptz not null default now()
);

create index if not exists idx_drinks_player on drinks (player_id);

alter table drinks enable row level security;

create policy "anyone can read drinks"
  on drinks for select
  using (true);

create policy "anyone can log drinks"
  on drinks for insert
  with check (true);

create policy "anyone can delete drinks"
  on drinks for delete
  using (true);

-- ─── Real-time ────────────────────────────────────────────────────────────────
-- Enable real-time for the hole_scores table.
-- In Supabase Dashboard → Database → Replication, enable hole_scores.
-- Or run:
alter publication supabase_realtime add table hole_scores;
alter publication supabase_realtime add table drinks;

-- ─── Done ─────────────────────────────────────────────────────────────────────
-- After running this schema:
-- 1. Copy .env.example → .env and fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
-- 2. npm install && npm run dev
-- 3. Share the Vercel URL with all players
