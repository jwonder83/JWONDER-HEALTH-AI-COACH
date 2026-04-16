import { isUserAdmin } from "@/lib/site-settings/admin-check";
import { mergeSiteSettingsFromDb } from "@/lib/site-settings/merge";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettingsMerged } from "@/types/site-settings";
import { NextResponse } from "next/server";

function humanizeSiteSettingsDbError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("site_settings") && (m.includes("schema cache") || m.includes("could not find"))) {
    return [
      "Supabase에 public.site_settings 테이블이 없습니다.",
      "1) SQL Editor에서 프로젝트의 supabase/migrations/0002_site_settings.sql 전체를 실행하세요.",
      "2) Dashboard → Settings → API → Reload schema 를 한 번 눌러 캐시를 갱신하세요.",
    ].join(" ");
  }
  return message;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  }
  if (!isUserAdmin(user.email)) {
    return { error: NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 }) };
  }
  return { user };
}

export async function PUT(request: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const incoming = (body as { settings?: unknown }).settings;
  if (!incoming || typeof incoming !== "object") {
    return NextResponse.json({ error: "settings 객체가 필요합니다." }, { status: 400 });
  }

  try {
    const merged = mergeSiteSettingsFromDb(incoming) as SiteSettingsMerged;
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("site_settings").upsert(
      {
        id: 1,
        settings: merged,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) {
      return NextResponse.json({ error: humanizeSiteSettingsDbError(error.message) }, { status: 500 });
    }
    return NextResponse.json({ ok: true, settings: merged });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "저장 실패";
    const status = msg.includes("SUPABASE_SERVICE_ROLE_KEY") ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
