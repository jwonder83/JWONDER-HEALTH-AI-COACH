/**
 * Supabase Postgres에 workouts 마이그레이션을 직접 적용합니다.
 * 필요: .env.local 에 DATABASE_URL (대시보드 → Settings → Database → URI)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "..", "supabase", "migrations", "0001_workouts.sql");

const DATABASE_URL = process.env.DATABASE_URL?.trim();
if (!DATABASE_URL) {
  console.error(
    "[db:apply] .env.local 에 DATABASE_URL 이 없습니다.\n" +
      "Supabase 대시보드 → Project Settings → Database → Connection string → URI 를 복사해 넣은 뒤 다시 실행하세요."
  );
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, "utf8");
const useSsl = !/localhost|127\.0\.0\.1/i.test(DATABASE_URL);

const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

await client.connect();
try {
  await client.query(sql);
  console.log("[db:apply] 완료: public.workouts + RLS 정책이 적용되었습니다.");
} catch (e) {
  console.error("[db:apply] SQL 실행 실패:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
