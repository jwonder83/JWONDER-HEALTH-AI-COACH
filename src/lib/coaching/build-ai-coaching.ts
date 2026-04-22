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

const SYSTEM_PROMPT = `당신은 한국어로 답하는 헬스·근력 트레이닝 코치입니다.
운동 기록(빈도·볼륨·쉰 날·추세)을 먼저 짚고, 짧은 문장으로 오늘 할 일을 제안하세요. 보고서 말투·과장된 칭찬은 피하고, 옆에서 같이 보는 사람처럼 말하되 다음 행동은 분명히 알려 주세요.
사용자 메모리(목표·경험·선호 종목·보완 부위·부상 이력·일관성·피로 신호)가 있으면 기록 요약과 모순되지 않게 녹이세요.
"개인화 코칭 힌트" 목록이 있으면 **첫 단락**에 그중 1~2개를 자연스럽게 넣으세요(운동 이름·부위는 그대로). 막연한 격언으로 시작하지 마세요.
"~할까요?"만으로 흐리게 끝내지 말고, "~해 보세요", "~부터 가면 돼요"처럼 다음 스텝이 보이게 쓰세요. 모든 문장을 딱딱한 명령조로만 길게 이을 필요는 없습니다.
의학적 진단·부상 판정은 하지 말고, 통증·이상이 있으면 전문가 상담을 권하는 한 줄을 포함하세요.
가독을 위해 마크다운(##, ###, 목록)을 사용하세요.`;

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
        "User-Agent": "JWONDER-COACH/1.0 (+https://vercel.com)",
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
    "\n\n## 사용자 메모리(자동으로 짠 요약)\n\n" +
    formatUserMemoryForPrompt(memory) +
    "\n\n위 항목은 코드가 기록에서 추정한 값이에요. 부상 이력 칸은 직접 적어 둔 경우에만 채워져요.\n"
  );
}

/** OpenAI 없이: 기록 요약 + (선택) 웹 참고 문단을 코칭처럼 묶어 반환 */
async function buildWebOrLocalCoaching(rows: WorkoutRow[], memory: UserMemoryProfile | null | undefined): Promise<string> {
  const local = buildLocalCoachingText(rows, memory) + memoryBlock(memory);
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
          "_실시간 모델 호출 없이, 저장 기록이랑 공개 웹 글을 섞어 만든 참고 메모예요. 부상·통증 있으면 전문가한테 먼저 물어보세요._"
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
    "*의학 진단은 아니에요. 무리한 중량·통증 있으면 전문의 상담부터요.*"
  );
}

async function buildOpenAiCoaching(
  rows: WorkoutRow[],
  apiKey: string,
  memory: UserMemoryProfile | null | undefined,
): Promise<string> {
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const localSummary = buildLocalCoachingText(rows, memory);
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

위 자료를 바탕으로 한국어로 코칭을 써 주세요. 포함할 내용:
1. 첫 단락: 개인화 힌트·선호 종목·최근 끊김·부족한 부위 중 최소 한 가지를 구체적으로 짚고, 오늘 할 행동을 제안하세요.
2. 오늘~이번 주 실행 팁 2~4문장(되면 숫자 근거를 짧게 곁들이기)
3. 종목별로 눈에 띄는 패턴이 있으면 사실 위주로만 언급
4. 다음 1~2주에 시험해 볼 변화 2~4가지를 짧게`;

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
