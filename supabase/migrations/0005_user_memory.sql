-- 사용자 메모리(프로필 스냅샷) — 앱은 현재 localStorage 우선, 향후 동기화용
create table if not exists public.user_memory (
  user_id uuid not null references auth.users (id) on delete cascade primary key,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists user_memory_updated_at_idx on public.user_memory (updated_at desc);

alter table public.user_memory enable row level security;

create policy "Users read own memory"
  on public.user_memory for select
  using (auth.uid() = user_id);

create policy "Users upsert own memory"
  on public.user_memory for insert
  with check (auth.uid() = user_id);

create policy "Users update own memory"
  on public.user_memory for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
