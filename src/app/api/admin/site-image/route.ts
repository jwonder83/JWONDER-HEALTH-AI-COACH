import { isUserAdmin } from "@/lib/site-settings/admin-check";
import {
  PROGRAM_BUILTIN_IMAGE_STORAGE_SLOTS,
  SITE_ASSETS_BUCKET,
  SITE_IMAGE_ALLOWED_MIME,
  SITE_IMAGE_SLOTS,
  SITE_IMAGE_UPLOAD_MAX_BYTES,
} from "@/lib/site-settings/storage-constants";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function extFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return ".bin";
  }
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

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "multipart 요청이 필요합니다." }, { status: 400 });
  }

  const slotRaw = form.get("slot");
  const file = form.get("file");

  const allowedSlots = [...SITE_IMAGE_SLOTS, ...PROGRAM_BUILTIN_IMAGE_STORAGE_SLOTS] as readonly string[];
  if (typeof slotRaw !== "string" || !allowedSlots.includes(slotRaw)) {
    return NextResponse.json({ error: "유효한 slot 값이 필요합니다." }, { status: 400 });
  }
  const slot = slotRaw;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }

  if (!SITE_IMAGE_ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "허용 형식: JPEG, PNG, WebP, GIF 만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  if (file.size > SITE_IMAGE_UPLOAD_MAX_BYTES) {
    return NextResponse.json({ error: "파일은 5MB 이하여야 합니다." }, { status: 400 });
  }

  try {
    const admin = createServiceRoleClient();
    const buf = Buffer.from(await file.arrayBuffer());
    const objectPath = `${slot}/${randomUUID()}${extFromMime(file.type)}`;

    const { error: upErr } = await admin.storage.from(SITE_ASSETS_BUCKET).upload(objectPath, buf, {
      contentType: file.type,
      upsert: false,
    });

    if (upErr) {
      return NextResponse.json(
        { error: upErr.message.includes("Bucket not found") ? "Storage 버킷 site-assets 가 없습니다. SQL 마이그레이션을 적용하세요." : upErr.message },
        { status: 500 },
      );
    }

    const { data: pub } = admin.storage.from(SITE_ASSETS_BUCKET).getPublicUrl(objectPath);
    return NextResponse.json({ url: pub.publicUrl, path: objectPath, slot });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "업로드 실패";
    const status = msg.includes("SUPABASE_SERVICE_ROLE_KEY") ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
