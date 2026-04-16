-- AI 코칭 결과 저장 (계정별). 실행 후 필요 시 Schema Reload.
create table if not exists public.coaching_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists coaching_logs_user_created_idx on public.coaching_logs (user_id, created_at desc);

alter table public.coaching_logs enable row level security;

drop policy if exists "coaching_logs_select_own" on public.coaching_logs;
drop policy if exists "coaching_logs_insert_own" on public.coaching_logs;
drop policy if exists "coaching_logs_delete_own" on public.coaching_logs;

create policy "coaching_logs_select_own"
  on public.coaching_logs for select
  using (auth.uid() = user_id);

create policy "coaching_logs_insert_own"
  on public.coaching_logs for insert
  with check (auth.uid() = user_id);

create policy "coaching_logs_delete_own"
  on public.coaching_logs for delete
  using (auth.uid() = user_id);
