-- 사이트 이미지용 Storage (공개 읽기, 업로드는 서비스 롤 API에서만)
insert into storage.buckets (id, name, public, file_size_limit)
values ('site-assets', 'site-assets', true, 5242880)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "site_assets_public_read" on storage.objects;
create policy "site_assets_public_read"
  on storage.objects for select
  using (bucket_id = 'site-assets');
