-- Supabase 대시보드 → SQL Editor → New query → 전체 실행
-- 프로젝트: kcwddfxsqanccvribmeu
-- 실행 후 10~30초 정도 지나도 같은 오류면: Dashboard → Settings → API → Schema / Reload 관련 옵션이 있으면 새로고침

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_name text not null,
  weight_kg numeric not null,
  reps integer not null,
  sets integer not null,
  success boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists workouts_user_created_idx on public.workouts (user_id, created_at desc);

alter table public.workouts enable row level security;

drop policy if exists "workouts_select_own" on public.workouts;
drop policy if exists "workouts_insert_own" on public.workouts;
drop policy if exists "workouts_update_own" on public.workouts;
drop policy if exists "workouts_delete_own" on public.workouts;

create policy "workouts_select_own"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "workouts_insert_own"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "workouts_update_own"
  on public.workouts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workouts_delete_own"
  on public.workouts for delete
  using (auth.uid() = user_id);
