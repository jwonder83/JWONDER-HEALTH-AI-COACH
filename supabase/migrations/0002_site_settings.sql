-- 사이트 문구·이미지 URL 저장 (공개 읽기, 쓰기는 service_role 전용 권장)
-- 실행 후: Dashboard → Settings → API → "Reload schema" 로 PostgREST 스키마 캐시 갱신
create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id, settings)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  to anon, authenticated
  using (id = 1);

-- authenticated / anon 에게는 SELECT 만 (업데이트는 API에서 service_role 로 수행)
