import Link from "next/link";

const toc = [
  { href: "#split", label: "주간 스플릿" },
  { href: "#deload", label: "델로드" },
  { href: "#order", label: "운동 순서" },
  { href: "#warmup", label: "워밍업·쿨다운" },
  { href: "#rpe", label: "RPE·RIR" },
  { href: "#alternatives", label: "대체 종목" },
  { href: "#checklist", label: "종목 체크" },
  { href: "#micro", label: "마이크로 목표" },
  { href: "#stats", label: "통계 활용" },
  { href: "#safety", label: "안전" },
] as const;

const card = "rounded-2xl border border-orange-100/90 bg-white/90 p-4 shadow-sm sm:p-5";
const h3 = "font-display text-[1.05rem] font-bold text-apple-ink sm:text-[1.125rem]";

export function ProgramGuide() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple">Program</p>
      <h1 className="font-display mt-2 text-[1.75rem] font-bold tracking-[-0.03em] text-apple-ink sm:text-[2rem]">운동 프로그램 가이드</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-apple-subtle sm:text-[16px]">
        루틴 짜기·안전·강도 조절에 쓸 수 있는 짧은 참고 자료입니다. 개인 체력·질환은 전문가와 상담하세요.
      </p>

      <nav aria-label="이 페이지 목차" className="mt-8 flex flex-wrap gap-2">
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

      <section id="split" className="mt-12 scroll-mt-28 space-y-4">
        <h2 className={h3}>주간 스플릿 예시</h2>
        <p className="text-[14px] leading-relaxed text-apple-subtle sm:text-[15px]">
          하루에 전신을 다 넣기보다, 부위를 나눠서 볼륨을 모으는 방식입니다. 아래는 일반적인 예시이며, 회복과 일정에 맞게 조정하면 됩니다.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={card}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-apple">초보 · 주 3일</p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-[14px] text-apple-ink">
              <li>1일차: 하체(스쿼트·레그 등) + 코어</li>
              <li>2일차: 상체 밀기(벤치·오버헤드 등)</li>
              <li>3일차: 상체 당기기(로우·풀다운 등)</li>
            </ul>
            <p className="mt-3 text-[12px] leading-relaxed text-apple-subtle">요일 사이에 휴식 1일 이상 두면 회복에 유리합니다.</p>
          </div>
          <div className={card}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-apple">중급 · 주 4~5일</p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-[14px] text-apple-ink">
              <li>4분할: 하체 / 가슉·어깨 / 등 / 팔·보조</li>
              <li>또는 푸시·풀·레그를 돌리는 3분할 + 약한 부위 1일</li>
            </ul>
            <p className="mt-3 text-[12px] leading-relaxed text-apple-subtle">같은 부위는 보통 48~72시간 간격을 두는 편이 안전합니다.</p>
          </div>
        </div>
      </section>

      <section id="deload" className="mt-12 scroll-mt-28 space-y-3">
        <h2 className={h3}>델로드 주</h2>
        <p className="text-[14px] leading-relaxed text-apple-subtle sm:text-[15px]">
          4~8주마다 한 주는 <strong className="text-apple-ink">총 볼륨을 약 40~60%</strong>로 줄이거나, 세트 수만 줄이고 가볍게 기술을 다듬는 주를 넣어 보세요. 수면·스트레스가 많을 때도 같은 원리로 부담을 낮추면 좋습니다.
        </p>
      </section>

      <section id="order" className="mt-12 scroll-mt-28 space-y-3">
        <h2 className={h3}>운동 순서</h2>
        <ol className="list-inside list-decimal space-y-2 text-[14px] leading-relaxed text-apple-ink sm:text-[15px]">
          <li>큰 근육·복합 동작(스쿼트, 데드, 풀업 등)을 앞에 둡니다.</li>
          <li>고립·보조 동작은 뒤쪽에 배치합니다.</li>
          <li>같은 부위에서 무거운 세트가 먼저 오도록 정렬합니다.</li>
        </ol>
      </section>

      <section id="warmup" className="mt-12 scroll-mt-28 space-y-3">
        <h2 className={h3}>워밍업·쿨다운</h2>
        <div className={card}>
          <p className="text-[14px] font-medium text-apple-ink">워밍업</p>
          <p className="mt-2 text-[14px] leading-relaxed text-apple-subtle">
            가벼운 유산소 5분 → 관절 가동 → 본 운동과 비슷한 패턴으로 무게를 점진적으로 올립니다. 첫 세트를 워밍업 세트로 쓰는 것도 방법입니다.
          </p>
          <p className="mt-4 text-[14px] font-medium text-apple-ink">쿨다운</p>
          <p className="mt-2 text-[14px] leading-relaxed text-apple-subtle">
            짧게 걷기·느린 호흡, 당일 썼던 근육 위주로 가볍게 스트레칭을 5~10분 하면 혈류·긴장 완화에 도움이 됩니다.
          </p>
        </div>
      </section>

      <section id="rpe" className="mt-12 scroll-mt-28 space-y-3">
        <h2 className={h3}>RPE와 RIR (간단히)</h2>
        <ul className="space-y-2 text-[14px] leading-relaxed text-apple-subtle sm:text-[15px]">
          <li>
            <strong className="text-apple-ink">RPE</strong>는 세트 난이도 체감(1 매우 쉬움 ~ 10 실패 직전)입니다. 기록 시 “오늘은 대부분 RPE 7~8”처럼 메모해 두면 주간 볼륨 조절에 참고가 됩니다.
          </li>
          <li>
            <strong className="text-apple-ink">RIR</strong>는 “실패까지 남은 반복 횟수”에 가깝게 씁니다. 예: RIR 2면 2회 더 할 수 있을 것 같은 강도.
          </li>
        </ul>
      </section>

      <section id="alternatives" className="mt-12 scroll-mt-28 space-y-4">
        <h2 className={h3}>대체 종목 참고</h2>
        <p className="text-[14px] text-apple-subtle sm:text-[15px]">장비·통증에 따라 바꿔 쓸 수 있는 흔한 예시입니다.</p>
        <div className="overflow-x-auto rounded-2xl border border-orange-100/90 bg-white shadow-sm">
          <table className="min-w-full text-left text-[13px] text-apple-ink sm:text-[14px]">
            <thead className="border-b border-orange-100/90 bg-u-lavender/20 text-[11px] font-bold uppercase tracking-[0.12em] text-apple">
              <tr>
                <th className="px-3 py-2.5 sm:px-4">본 동작</th>
                <th className="px-3 py-2.5 sm:px-4">대안 예시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/80">
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">바벨 스쿼트</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">고블릿 스쿼트, 레그 프레스, 스핏 스쿼트</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">콘벤셔널 데드</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">루마니안 데드, 덤벨 RDL, 힙 힌지 머신</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">바벨 벤치</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">덤벨 프레스, 머신 체스트 프레스, 푸시업</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">풀업</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">랫풀다운, 어시스트 풀업, 인버티드 로우</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">오버헤드 프레스</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">덤벨 숄더 프레스, 머신 숄더 프레스</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="checklist" className="mt-12 scroll-mt-28 space-y-4">
        <h2 className={h3}>종목별 체크(짧게)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={card}>
            <p className="text-[13px] font-bold text-apple-ink">스쿼트</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[13px] text-apple-subtle">
              <li>발바닥 세 균형, 무릎은 발가락 방향과 맞추기</li>
              <li>가슴·골반 높이 유지, 무리한 상체 전굴 주의</li>
            </ul>
          </div>
          <div className={card}>
            <p className="text-[13px] font-bold text-apple-ink">데드리프트</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[13px] text-apple-subtle">
              <li>바는 몸에 가깝게, 어깨 블레이드 아래에서 시작</li>
              <li>들어 올릴 때 등이 둥글어지지 않게</li>
            </ul>
          </div>
          <div className={card}>
            <p className="text-[13px] font-bold text-apple-ink">벤치 프레스</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[13px] text-apple-subtle">
              <li>발바닥으로 바닥 밀기, 견갑 고정</li>
              <li>팔꿈치는 너무 벌리지 않기(약 45° 전후)</li>
            </ul>
          </div>
          <div className={card}>
            <p className="text-[13px] font-bold text-apple-ink">로우류</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[13px] text-apple-subtle">
              <li>견갑을 먼저 모으고 팔로 당기기</li>
              <li>허리 과신전 없이 중립 유지</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="micro" className="mt-12 scroll-mt-28 space-y-3">
        <h2 className={h3}>마이크로 목표</h2>
        <p className="text-[14px] leading-relaxed text-apple-subtle sm:text-[15px]">
          한 주에 <strong className="text-apple-ink">종목 하나</strong>만 “폼·1RM이 아니라 <strong className="text-apple-ink">동일 RPE에서 한두 회 더</strong>” 같은 작은 목표를 두면 부담이 줄고 꾸준해지기 쉽습니다. 대시보드의 주간 목표와 함께 써도 좋습니다.
        </p>
      </section>

      <section id="stats" className="mt-12 scroll-mt-28 space-y-3">
        <h2 className={h3}>통계·한 줄 요약</h2>
        <p className="text-[14px] leading-relaxed text-apple-subtle sm:text-[15px]">
          이번 달 볼륨·종목 비중은{" "}
          <Link href="/records" className="font-semibold text-apple-muted underline decoration-apple/25 underline-offset-[5px] hover:text-apple">
            통계·보내기
          </Link>
          에서 한 줄로 확인할 수 있습니다. CSV로 내려받아 스프레드시트에서 추세를 보는 것도 방법입니다.
        </p>
      </section>

      <section id="safety" className="mt-12 scroll-mt-28 space-y-3">
        <h2 className={h3}>통증·안전</h2>
        <p className="rounded-2xl border border-rose-100/90 bg-rose-50/60 px-4 py-3 text-[14px] leading-relaxed text-rose-950">
          날카로운 통증·호흡 곤란·어지러움이 있으면 즉시 중단하고 필요 시 의료 기관을 이용하세요. 이 앱은 일반 정보 제공용이며 진단·치료를 대신하지 않습니다.
        </p>
      </section>
    </div>
  );
}
