import { formatUserMemoryForPrompt } from "@/lib/user-memory/format-for-prompt";
import type { UserMemoryProfile } from "@/types/user-memory";
import type { WorkoutRow } from "@/types/workout";
import { buildLocalCoachingText } from "./analyze-workouts";

export type BuildAiCoachingOptions = {
  userMemory?: UserMemoryProfile | null;
};

type OpenAIChatResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

function formatWorkoutsTable(rows: WorkoutRow[]): string {
  const sorted = [...rows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const slice = sorted.slice(0, 45);
  const header = "| 날짜(ISO) | 운동명 | kg | reps | sets | 성공 |";
  const sep = "|---|---|---|---|---|---|";
  const lines = slice.map((r) => {
    const ok = r.success ? "예" : "아니오";
    const name = r.exercise_name.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
    return `| ${r.created_at} | ${name} | ${r.weight_kg} | ${r.reps} | ${r.sets} | ${ok} |`;
  });
  return [header, sep, ...lines].join("\n");
}

const SYSTEM_PROMPT = `당신은 한국어로 답하는 헬스·strength 트레이닝 코치입니다.
사용자의 운동 기록 숫자(빈도·볼륨·휴식·추세)를 먼저 읽고, 짧은 결정형 문장으로 행동을 지시한 뒤 같은 단락에서 근거를 한 줄로 붙이세요.
사용자 메모리(목표·경험·선호 종목·보완 부위·부상 이력·일관성·피로 지표)가 주어지면 기록 요약과 모순되지 않게 반영하세요.
"~해볼까요?", "~어때요?" 같은 추천체는 쓰지 말고 "~하세요.", "~로 진행하세요."처럼 확정 톤을 쓰세요.
의학적 진단·부상 판정은 하지 말고, 통증·이상이 있으면 전문가 상담을 권하는 문장을 포함하세요.
마크다운(##, ###, 목록)을 사용해 가독성 있게 작성하세요.`;

function isAllowedCoachingUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h === "127.0.0.1" || h.endsWith(".local")) return false;
    if (h.startsWith("169.254.")) return false;
    return true;
  } catch {
    return false;
  }
}

function htmlToPlainText(html: string): string {
  const t = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|br|h[1-6]|li|tr|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return t
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

async function fetchCoachingWebSource(url: string): Promise<string> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 12_000);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
        "User-Agent": "JWONDER-HEALTH-AI-COACH/1.0 (+https://vercel.com)",
      },
      redirect: "follow",
      signal: ac.signal,
    });
    if (!res.ok) {
      throw new Error(`참고 페이지 응답 ${res.status}`);
    }
    const maxBytes = 120_000;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > maxBytes) {
      throw new Error("참고 페이지 본문이 너무 큽니다.");
    }
    const raw = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("text/html") || raw.trimStart().startsWith("<")) {
      return htmlToPlainText(raw).slice(0, 10_000);
    }
    return raw.trim().slice(0, 10_000);
  } finally {
    clearTimeout(timer);
  }
}

function memoryBlock(memory: UserMemoryProfile | null | undefined): string {
  if (!memory) return "";
  return (
    "\n\n## 사용자 메모리(자동 산출)\n\n" +
    formatUserMemoryForPrompt(memory) +
    "\n\n위 메모리는 코드가 기록에서 추정한 값입니다. 부상 이력은 사용자가 저장한 경우에만 채워질 수 있습니다.\n"
  );
}

/** OpenAI 없이: 기록 요약 + (선택) 웹 참고 문단을 코칭처럼 묶어 반환 */
async function buildWebOrLocalCoaching(rows: WorkoutRow[], memory: UserMemoryProfile | null | undefined): Promise<string> {
  const local = buildLocalCoachingText(rows) + memoryBlock(memory);
  const url = process.env.COACHING_CONTENT_URL?.trim();

  if (url && isAllowedCoachingUrl(url)) {
    try {
      const web = await fetchCoachingWebSource(url);
      if (web.length > 0) {
        return (
          "## 오늘의 코칭 메모\n\n" +
          "최근 기록을 바탕으로 아래에 **요약**과, 참고용으로 가져온 **웹 자료**를 함께 정리했어요.\n\n" +
          "### 기록 기반 요약\n\n" +
          local +
          "\n\n### 참고 자료 (웹)\n\n" +
          web +
          "\n\n---\n\n" +
          "_실시간 AI 모델 호출 없이, 저장 기록과 공개 웹 문서를 조합한 참고 코멘트예요. 부상·통증이 있으면 전문가 상담을 권해 드려요._"
        );
      }
    } catch {
      /* URL 실패 시 로컬만 */
    }
  }

  return (
    "## 코칭 인사이트\n\n" +
    local +
    "\n\n---\n\n" +
    "*의학적 진단이 아닙니다. 무리한 중량·통증이 있으면 전문의 상담을 권장드려요.*"
  );
}

async function buildOpenAiCoaching(
  rows: WorkoutRow[],
  apiKey: string,
  memory: UserMemoryProfile | null | undefined,
): Promise<string> {
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const localSummary = buildLocalCoachingText(rows);
  const table = formatWorkoutsTable(rows);

  const userContent = `아래는 사용자의 최근 운동 기록 표입니다.

## 기록 표
${table}

---

## 참고용 자동 요약 (코드 생성)
아래 요약의 숫자·추세와 모순되지 않게 코칭해 주세요.

${localSummary}
${memoryBlock(memory)}
---

위 자료를 바탕으로 한국어로 코칭을 작성해 주세요. 포함할 내용:
1. 오늘~이번 주 실행에 대한 결정형 지시 2~4문장(각 문장 뒤에 왜 그런지 숫자 근거를 짧게 붙여도 됨)
2. 운동별로 중요한 패턴이 있으면 사실 위주로 언급
3. 다음 1~2주 실행 항목을 명령형으로 2~4가지`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.65,
      max_tokens: 2800,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    }),
  });

  const json = (await res.json()) as OpenAIChatResponse;

  if (!res.ok) {
    const errMsg = json.error?.message ?? `OpenAI API 오류 (HTTP ${res.status})`;
    throw new Error(errMsg);
  }

  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI 응답에 코칭 텍스트가 없습니다.");
  }

  return text;
}

/**
 * 기본: OpenAI 호출 없음 → 기록 요약 + (선택) COACHING_CONTENT_URL 웹 본문.
 * OpenAI 사용: COACHING_USE_OPENAI=true 이고 OPENAI_API_KEY 가 있을 때만.
 */
export async function buildAiCoaching(rows: WorkoutRow[], options?: BuildAiCoachingOptions): Promise<string> {
  const memory = options?.userMemory ?? null;
  const useOpenAi =
    process.env.COACHING_USE_OPENAI === "1" || process.env.COACHING_USE_OPENAI === "true";
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (useOpenAi && apiKey) {
    return buildOpenAiCoaching(rows, apiKey, memory);
  }

  return buildWebOrLocalCoaching(rows, memory);
}
