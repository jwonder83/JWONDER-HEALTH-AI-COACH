import Link from "next/link";
import { GuideFigure, YouTubeEmbed } from "@/components/program/ProgramGuideMedia";

const toc = [
  { href: "#framework", label: "원칙·과학" },
  { href: "#split", label: "스플릿·주기" },
  { href: "#volume", label: "볼륨 랜드마크" },
  { href: "#deload", label: "델로드·피로" },
  { href: "#order", label: "운동 순서" },
  { href: "#warmup", label: "워밍업·쿨다운" },
  { href: "#rpe", label: "RPE·RIR" },
  { href: "#alternatives", label: "대체 종목" },
  { href: "#checklist", label: "종목별 큐" },
  { href: "#micro", label: "마이크로 목표" },
  { href: "#stats", label: "통계" },
  { href: "#safety", label: "안전" },
] as const;

const card = "rounded-2xl border border-orange-100/90 bg-white/90 p-4 shadow-sm sm:p-5";
const h2 = "font-display text-[1.2rem] font-bold tracking-[-0.02em] text-apple-ink sm:text-[1.35rem]";
const lead = "text-[15px] font-medium leading-relaxed text-apple-ink sm:text-[16px]";
const body = "text-[14px] leading-relaxed text-apple-subtle sm:text-[15px]";

/* Unsplash 사진 ID는 CDN에서 내려갈 수 있음 — 깨지면 HEAD로 확인 후 교체 */
const IMG = {
  gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=82",
  barbell: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=82",
  athlete: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=82",
  stretch: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=82",
  rack: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=82",
  plates: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=82",
  calm: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=82",
  kettle: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=82",
} as const;

export function ProgramGuide() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-14">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple">Program</p>
      <h1 className="font-display mt-2 text-[1.85rem] font-bold tracking-[-0.03em] text-apple-ink sm:text-[2.25rem]">
        운동 프로그램 클리닉
      </h1>
      <p className={`mt-3 ${lead}`}>
        헬스장·가정용 중량 트레이닝을 전제로, <strong>근비대·근력을 위한 프로그램 설계와 실행</strong>에 쓰이는 개념을 정리했습니다. 의학적 진단·재활 지침을
        대체하지 않으며, 통증·심혈관 질환이 있다면 사전에 전문가와 상담하세요.
      </p>

      <GuideFigure src={IMG.gym} alt="웨이트 트레이닝 공간" priority className="mt-8" />

      <nav aria-label="이 페이지 목차" className="mt-10 flex flex-wrap gap-2 border-y border-orange-100/80 py-5">
        {toc.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full border border-orange-100/90 bg-u-lavender/25 px-3 py-1.5 text-[11px] font-semibold text-apple-ink transition hover:border-apple/30 hover:bg-u-lavender/45"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* 원칙 */}
      <section id="framework" className="mt-14 scroll-mt-28 space-y-4">
        <h2 className={h2}>훈련 원칙과 과학적 프레임</h2>
        <p className={body}>
          근육은 <strong className="text-apple-ink">기계적 장력·대사 스트레스</strong>에 적응합니다. 프로그램의 핵심은{" "}
          <strong className="text-apple-ink">점진적 과부하(Progressive Overload)</strong>, <strong>특이성(Specificity)</strong>, 그리고{" "}
          <strong>회복-적응(SRA: Stimulus–Recovery–Adaptation)</strong>의 균형입니다. 주간 볼륨·강도·종목 선택은 모두 이 세 축 위에서 조정됩니다.
        </p>
        <ul className={`${body} list-inside list-disc space-y-2`}>
          <li>
            <strong className="text-apple-ink">개체차</strong>가 큽니다. 동일한 템플릿이라도 수면·영양·스트레스·컨디션에 따라 주간 허용 볼륨(MRV)이 달라집니다.
          </li>
          <li>
            <strong className="text-apple-ink">측정 가능한 변수</strong>로 주기를 관리하세요: 중량, 총 세트 수, RPE/RIR, 주간 총 볼륨(kg×회×세트), 종목별 분포.
          </li>
          <li>
            <strong className="text-apple-ink">기술(Technique) 우선</strong> — 부하 상승은 관절 각도·밸런스·가동범위가 유지될 때만 의미가 있습니다.
          </li>
        </ul>
        <YouTubeEmbed id="k0J8URJfUTg" title="점진적 과부하에 대한 설명 (Jeff Nippard, 영문)" />
      </section>

      {/* 스플릿 */}
      <section id="split" className="mt-16 scroll-mt-28 space-y-5">
        <h2 className={h2}>주간 스플릿과 중주기(Mesocycle)</h2>
        <p className={body}>
          <strong className="text-apple-ink">분할(Split)</strong>은 한 세션당 신경·대사 부담을 분산시키고, 부위별 주간 세트 수를 MEV~MAV 구간에 두기 위한
          도구입니다. 초보는 전신 또는 상·하 2분할로 시작해 패턴을 익히고, 중급 이후에는 푸시/풀/레그 또는 부위별 4~5분할로 세분화하는 경우가 많습니다.
        </p>
        <GuideFigure src={IMG.barbell} alt="바벨 트레이닝" />
        <YouTubeEmbed id="3JOEZb46-dM" title="반복 수·강도와 근성장 (Jeff Nippard Fundamentals, 영문)" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={card}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-apple">초급 · 주 3일 (전신 또는 상하)</p>
            <ul className="mt-3 space-y-2 text-[14px] leading-snug text-apple-ink">
              <li>
                <span className="font-semibold">A일</span> — 하체 복합(스쿼트/레그프레스) + 보조 1~2 + 코어
              </li>
              <li>
                <span className="font-semibold">B일</span> — 수평·수직 밀기(벤치·인클라인·오버헤드 중 택)
              </li>
              <li>
                <span className="font-semibold">C일</span> — 당기기(로우·풀다운·페이스풀 등) + 이두·삼두 보조
              </li>
            </ul>
            <p className="mt-3 text-[12px] leading-relaxed text-apple-subtle">
              세션당 큰 동작 4~6개, 세트 총합은 부위별 가이드(아래 볼륨 랜드마크)에 맞춰 점진적으로 올립니다.
            </p>
          </div>
          <div className={card}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-apple">중급 · 주 4~5일</p>
            <ul className="mt-3 space-y-2 text-[14px] leading-snug text-apple-ink">
              <li>
                <span className="font-semibold">4분할</span> 하체 / 가슉·전면어깨 / 등·후면어깨 / 팔·보조
              </li>
              <li>
                <span className="font-semibold">푸시·풀·레그</span> 3분할 + 약점 부위 스페셜라이제이션 0.5~1일
              </li>
            </ul>
            <p className="mt-3 text-[12px] leading-relaxed text-apple-subtle">
              동일 근군은 보통 <strong className="text-apple-ink">48~72시간</strong> 간격을 두고, 주간 세트가 MRV에 근접하면 관절·정신 피로도가 먼저 신호를
              줍니다.
            </p>
          </div>
        </div>
      </section>

      {/* 볼륨 랜드마크 */}
      <section id="volume" className="mt-16 scroll-mt-28 space-y-4">
        <h2 className={h2}>볼륨 랜드마크(MV–MEV–MAV–MRV)</h2>
        <p className={body}>
          르네상스 퍼리오다이제이션 등에서 널리 쓰는 프레임으로, <strong className="text-apple-ink">근육당 주간 세트</strong>를 설계할 때 참고합니다. 수치는
          population 가이드이며, 개인은 기록과 회복 신호로 보정해야 합니다.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-orange-100/90 bg-white shadow-sm">
          <table className="min-w-full text-left text-[13px] text-apple-ink sm:text-[14px]">
            <thead className="border-b border-orange-100/90 bg-u-lavender/25 text-[10px] font-bold uppercase tracking-[0.12em] text-apple sm:text-[11px]">
              <tr>
                <th className="px-3 py-2.5 sm:px-4">용어</th>
                <th className="px-3 py-2.5 sm:px-4">의미</th>
                <th className="px-3 py-2.5 sm:px-4">실무 적용</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/80 text-apple-subtle">
              <tr>
                <td className="px-3 py-2.5 font-semibold text-apple-ink sm:px-4">MV</td>
                <td className="px-3 py-2.5 sm:px-4">유지 볼륨</td>
                <td className="px-3 py-2.5 sm:px-4">휴식·여행 주에도 이하로 내려가지 않으면 근육 유지에 유리</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-apple-ink sm:px-4">MEV</td>
                <td className="px-3 py-2.5 sm:px-4">최소 효과 볼륨</td>
                <td className="px-3 py-2.5 sm:px-4">성장을 기대하는 최소 주간 세트 하한(근육·경험치별 상이)</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-apple-ink sm:px-4">MAV</td>
                <td className="px-3 py-2.5 sm:px-4">최대 적응 볼륨</td>
                <td className="px-3 py-2.5 sm:px-4">장기적으로 가장 많이 머무를 “성장 효율” 구간의 평균대</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-apple-ink sm:px-4">MRV</td>
                <td className="px-3 py-2.5 sm:px-4">최대 회복 가능 볼륨</td>
                <td className="px-3 py-2.5 sm:px-4">이 이상은 관절·정신 피로·수행도 붕괴 위험 — 델로드·종목 로테이션 신호</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={body}>
          근비대 목적의 <strong className="text-apple-ink">대근군당 주 10~20세트</strong>는 흔한 출발점이나, 큰 근육(대사두·등광배)·작은 근육(측면삼각·비복근)의
          내성은 크게 다릅니다. 아래 영상은 세트 수를 올릴 때의 근거와 주의를 다룹니다.
        </p>
        <GuideFigure src={IMG.plates} alt="원판과 트레이닝 준비" />
        <YouTubeEmbed id="ifoX_HJeGA4" title="근성장을 위한 세트 볼륨 (Mike Israetel, 영문)" />
        <p className={`${body} rounded-xl border border-orange-100/80 bg-u-mint/25 px-3 py-2.5 text-[13px] sm:text-[14px]`}>
          심화 이론(영문 강의):{" "}
          <a
            href="https://www.youtube.com/watch?v=M2PP8AAXgPo"
            className="font-semibold text-apple-muted underline decoration-apple/25 underline-offset-4 hover:text-apple"
            target="_blank"
            rel="noopener noreferrer"
          >
            Volume Landmarks 추정 (Renaissance Periodization)
          </a>
        </p>
      </section>

      {/* 델로드 */}
      <section id="deload" className="mt-16 scroll-mt-28 space-y-4">
        <h2 className={h2}>델로드·피로 관리·주기화</h2>
        <p className={body}>
          <strong className="text-apple-ink">누적 피로(Fatigue)</strong>는 1RM보다 먼저 수행 속도·RPE·정밀도를 깎아냅니다. 보통{" "}
          <strong className="text-apple-ink">3:1 또는 4:1</strong> 비율(3~4주 적응 주 + 1주 델로드)을 쓰거나, 자동조절 지표(RPE 급등, 수면 악화, 통증
          패턴 변화)로 델로드를 당깁니다.
        </p>
        <ul className={`${body} list-inside list-disc space-y-2`}>
          <li>
            <strong className="text-apple-ink">볼륨 델로드</strong>: 총 세트 30~50% 절감, 강도는 중간 RPE로 유지해 동작감을 잃지 않기
          </li>
          <li>
            <strong className="text-apple-ink">강도 델로드</strong>: 세트 수는 유지하되 중량·RIR 완화 — 관절이 예민할 때 선호
          </li>
          <li>
            <strong className="text-apple-ink">전환 델로드</strong>: 변형 스쿼트·그립 변경 등 동일 패턴 반복에 따른 조직 과사용 완화
          </li>
        </ul>
        <GuideFigure src={IMG.calm} alt="회복과 휴식" />
        <YouTubeEmbed id="1KWsgdDX79w" title="보디빌딩을 위한 주기화 예시 (Jeff Nippard, 영문)" />
      </section>

      {/* 순서 */}
      <section id="order" className="mt-16 scroll-mt-28 space-y-4">
        <h2 className={h2}>운동 순서와 신경·대사 우선순위</h2>
        <p className={body}>
          <strong className="text-apple-ink">신경 요구가 큰 복합 동작</strong>을 앞에 두면, 스테빌라이저 피로가 쌓이기 전에 중추 신경계 자원을 투입할 수
          있습니다. <strong>프리-익스오스트(Pre-exhaust)</strong>는 고립운동을 먼저 넣어 복합에서 표적 근육을 한계까지 끌어올리는 기법으로, 초보·허리 보호
          목적이 아니라면 보통 뒤쪽 배치가 안전합니다.
        </p>
        <ol className={`${body} list-inside list-decimal space-y-2`}>
          <li>올림픽 리프트·스매스 스쿼트 등 파워 패턴(해당 시)</li>
          <li>주종목 복합(스쿼트·데드·벤치·풀업 등)</li>
          <li>보조 복합(런지·딥스·딥로우 변형)</li>
          <li>고립·머신·케이블로 볼륨 마무리</li>
        </ol>
        <GuideFigure src={IMG.athlete} alt="트레이닝 동작" />
      </section>

      {/* 워밍업 */}
      <section id="warmup" className="mt-16 scroll-mt-28 space-y-4">
        <h2 className={h2}>워밍업(RAMP)과 쿨다운</h2>
        <p className={body}>
          <strong className="text-apple-ink">RAMP</strong>는 Raise(체온) – Activate(근활성) – Mobilize(가동) – Potentiate(본 동작 패턴)의 흐름으로 정리할
          수 있습니다. 15~20분을 넘기면 피로가 누적되어 본 세트 품질이 떨어질 수 있으니, <strong className="text-apple-ink">짧고 특이성 있게</strong> 구성하세요.
        </p>
        <GuideFigure src={IMG.stretch} alt="스트레칭과 준비 운동" />
        <YouTubeEmbed id="E81GN-3A8XM" title="과학 기반 워밍업·모빌리티 루틴 (영문)" />
        <div className={card}>
          <p className="text-[13px] font-bold text-apple-ink">쿨다운</p>
          <p className={`mt-2 ${body}`}>
            본 운동 직후에는 <strong className="text-apple-ink">저강도 유산소 5~8분</strong>과 당일 주동근 위주의 <strong>정적 스트레칭 30~60초×2~3세트</strong>
            로 교감신경을 낮추고 혈류를 유지합니다. 극단적인 통증 유발 스트레칭은 피합니다.
          </p>
          <YouTubeEmbed id="IlHgLYdt3kc" title="운동 후 풀바디 스트레칭·쿨다운 (영문)" />
        </div>
      </section>

      {/* RPE */}
      <section id="rpe" className="mt-16 scroll-mt-28 space-y-4">
        <h2 className={h2}>RPE·RIR와 자동조절 프로그래밍</h2>
        <p className={body}>
          <strong className="text-apple-ink">RPE(Rate of Perceived Exertion)</strong>는 주관적 체력감, <strong>RIR(Reps in Reserve)</strong>는 실패 직전까지
          남겨둔 반복 추정치입니다. 초보는 RIR 2~4에서 기술을 고정하고, 중급 이후 점진적으로 RIR 0~2 구간을 일부 세트에 도입하는 식으로 확장합니다.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-orange-100/90 bg-white shadow-sm">
          <table className="min-w-full text-left text-[12px] text-apple-ink sm:text-[13px]">
            <thead className="border-b border-orange-100/90 bg-u-mango/30 text-[10px] font-bold uppercase tracking-[0.1em] text-apple">
              <tr>
                <th className="px-3 py-2 sm:px-4">RPE(10점)</th>
                <th className="px-3 py-2 sm:px-4">대략적 RIR</th>
                <th className="px-3 py-2 sm:px-4">세트 느낌</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/80 text-apple-subtle">
              <tr>
                <td className="px-3 py-2 font-semibold text-apple-ink sm:px-4">10</td>
                <td className="px-3 py-2 sm:px-4">0 (실패 또는 직전)</td>
                <td className="px-3 py-2 sm:px-4">추가 반복 불가</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-apple-ink sm:px-4">9</td>
                <td className="px-3 py-2 sm:px-4">~1</td>
                <td className="px-3 py-2 sm:px-4">아주 무겁게, 기술 경계</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-apple-ink sm:px-4">8</td>
                <td className="px-3 py-2 sm:px-4">~2</td>
                <td className="px-3 py-2 sm:px-4">근비대 구간에서 자주 쓰는 상한</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-apple-ink sm:px-4">7</td>
                <td className="px-3 py-2 sm:px-4">~3</td>
                <td className="px-3 py-2 sm:px-4">기술·볼륨 누적에 유리</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-apple-ink sm:px-4">≤6</td>
                <td className="px-3 py-2 sm:px-4">4+</td>
                <td className="px-3 py-2 sm:px-4">워밍업·펌핑·회복 세션</td>
              </tr>
            </tbody>
          </table>
        </div>
        <GuideFigure src={IMG.kettle} alt="케틀벨과 액세서리 트레이닝" />
        <YouTubeEmbed id="deDlhPmT2SY" title="훈련 강도와 RPE·RIR (Jeff Nippard, 영문)" />
      </section>

      {/* 대체 */}
      <section id="alternatives" className="mt-16 scroll-mt-28 space-y-4">
        <h2 className={h2}>대체 종목·도구 선택</h2>
        <p className={body}>
          관절 각도·하중 벡터를 바꾸면 <strong className="text-apple-ink">동일 “운동 패턴”을 보존</strong>한 채 부담 부위를 분산할 수 있습니다. 통증이 있을
          때는 무게를 줄이는 것보다 <strong className="text-apple-ink">각도·ROM·도구</strong>를 먼저 바꾸는 편이 안전한 경우가 많습니다.
        </p>
        <GuideFigure src={IMG.rack} alt="랙과 머신 트레이닝" />
        <div className="overflow-x-auto rounded-2xl border border-orange-100/90 bg-white shadow-sm">
          <table className="min-w-full text-left text-[13px] text-apple-ink sm:text-[14px]">
            <thead className="border-b border-orange-100/90 bg-u-lavender/20 text-[10px] font-bold uppercase tracking-[0.12em] text-apple sm:text-[11px]">
              <tr>
                <th className="px-3 py-2.5 sm:px-4">본 동작</th>
                <th className="px-3 py-2.5 sm:px-4">대안(유사 패턴)</th>
                <th className="px-3 py-2.5 sm:px-4">메모</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/80">
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">바벨 백스쿼트</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">세이프티바 스쿼트, SSB, 고블릿, 레그프레스</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">척추 압박·전방 심부담 완화</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">콘벤셔널 데드</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">루마니안, 스모, 덤벨 RDL, 힙힌지 머신</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">햄스트링·등 각도 조절</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">바벨 벤치</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">덤벨, 머신, 플로어 프레스, 푸시업</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">견관절 외회전 한계 시 유리</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">풀업</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">랫풀다운, 어시스트, 체스트 서포티드 로우</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">수직 당김 패턴 유지</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">스탠딩 OHP</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">시티드 덤벨, 핀숄더프레스, 랜드마인</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">허리 보상 동작 감소</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">바벨 로우</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">케이블 로우, 체스트패드 머신로우</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">허리 중립 유지 용이</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 체크리스트 + 영상 */}
      <section id="checklist" className="mt-16 scroll-mt-28 space-y-6">
        <h2 className={h2}>종목별 코칭 큐와 참고 영상</h2>
        <p className={body}>
          아래는 <strong className="text-apple-ink">관찰 가능한 체크포인트</strong>입니다. 통증이 있으면 폼 교정 전에 의학적 평가를 고려하세요.
        </p>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className={card}>
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-apple">스쿼트</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-apple-subtle sm:text-[14px]">
              <li>발 스크류(외측 전방으로 회전력)로 아치 유지</li>
              <li>무릎 트랙은 발가락 2~5지 방향과 일치</li>
              <li>흉추 전만 유지, 목은 중립~약간 위</li>
              <li>골반 깊이는 개인 가동·부하에 맞춰 “병렬~약간 아래”부터 점진</li>
            </ul>
          </div>
          <YouTubeEmbed id="W73Mc0Gil9A" title="스쿼트와 무릎 통증·자세 (Jeremy Ethier, 영문)" />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className={card}>
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-apple">데드리프트·힙힌지</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-apple-subtle sm:text-[14px]">
              <li>견갑은 바로 “당기는” 것이 아니라 중립 견고화</li>
              <li>바는 항상 중족부에 수직으로 걸리게</li>
              <li>들어 올리기 시 슬관절·고관절 동시 확장(더블 카벤)</li>
              <li>허리 둥근막(라운딩) 발생 시 즉시 중단·강도 하향</li>
            </ul>
          </div>
          <YouTubeEmbed id="MBbyAqvTNkU" title="5단계 데드리프트 셋업 (Alan Thrall, 영문)" />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className={card}>
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-apple">벤치 프레스</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-apple-subtle sm:text-[14px]">
              <li>견갑 하후·내측 고정, 흉추 약간 아치</li>
              <li>팔꿈치 45° 전후(정면에서 보면 몸통과 각도)</li>
              <li>바 경로는 대개 턱선 쪽에서 시작해 흉골 하부 쪽 J자</li>
              <li>하체 다리 드라이브로 안정적 베이스</li>
            </ul>
          </div>
          <YouTubeEmbed id="vcBig73ojpE" title="벤치 프레스 기술 (Jeff Nippard, 영문)" />
        </div>

        <div className={card}>
          <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-apple">로우·수평당김</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-apple-subtle sm:text-[14px]">
            <li>견갑 후인·하행 후 견고해진 뒤 전완으로 당김</li>
            <li>과도한 요추 과신전 대신 흉추 중립~소확장</li>
            <li>케이블은 케이블-전완 방향이 곧 저항 벡터</li>
          </ul>
        </div>
      </section>

      {/* 마이크로 */}
      <section id="micro" className="mt-16 scroll-mt-28 space-y-3">
        <h2 className={h2}>마이크로 목표와 주간 운영</h2>
        <p className={body}>
          한 주에 <strong className="text-apple-ink">한 가지 변수만</strong> 바꿉니다. 예: “모든 스쿼트 세트 RIR 2 유지”, “벤치 바닿터치 일관화”, “풀업
          하강 3초 편심”. 대시보드의 주간 기록 목표와 병행하면 실행이 쉬워집니다.
        </p>
      </section>

      {/* 통계 */}
      <section id="stats" className="mt-16 scroll-mt-28 space-y-3">
        <h2 className={h2}>데이터로 주기를 점검하기</h2>
        <p className={body}>
          주간·월간 볼륨, 종목 비중, 연속 기록은 앱의{" "}
          <Link href="/records" className="font-semibold text-apple-muted underline decoration-apple/25 underline-offset-[5px] hover:text-apple">
            통계·보내기
          </Link>
          와 대시보드 카드에서 확인할 수 있습니다. CSV로 내려받아 엑셀·시트에서 <strong className="text-apple-ink">4주 이동 평균</strong>을 그리면 MRV 접근
          신호를 조기에 볼 수 있습니다.
        </p>
      </section>

      {/* 안전 */}
      <section id="safety" className="mt-16 scroll-mt-28 space-y-3">
        <h2 className={h2}>안전·의학적 경고</h2>
        <p className="rounded-2xl border border-rose-100/90 bg-rose-50/70 px-4 py-3 text-[14px] leading-relaxed text-rose-950">
          흉통, 실신 전조, 날카로운 관절통, 호흡곤란이 있으면 즉시 중단하고 응급·의료기관을 이용하세요. 본 문서는 일반적인 힘 트레이닝 정보이며 개인별
          진단·처방을 대체하지 않습니다.
        </p>
      </section>
    </div>
  );
}
