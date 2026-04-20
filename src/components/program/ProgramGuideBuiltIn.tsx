import { navPillLinkCompact } from "@/components/nav/menu-styles";
import Link from "next/link";
import { GuideFigure, YouTubeEmbed } from "@/components/program/ProgramGuideMedia";
import type { ProgramGuideSettings } from "@/types/site-settings";

const card = "rounded-sm border border-neutral-200 bg-white p-4 shadow-sm sm:p-5";
const h2 = "font-display text-[1.2rem] font-bold tracking-[-0.02em] text-apple-ink sm:text-[1.35rem]";
const body = "text-[14px] leading-relaxed text-apple-subtle sm:text-[15px]";

type Props = { program: ProgramGuideSettings };

/** 사이트 설정에서 켜 둔 “내장 가이드” 본문(표·영상). 상단 제목·리드는 ProgramGuideView에서 렌더합니다. */
export function ProgramGuideBuiltIn({ program }: Props) {
  const bi = program.builtinImages;
  const bv = program.builtinVideos;
  const volLink = program.volumeExternalLink;
  const st = program.sectionTitles;

  return (
    <>
      <GuideFigure src={bi.hero.src} alt={bi.hero.alt} priority className="mt-8" />

      <nav aria-label="이 페이지 목차" className="mt-10 flex flex-wrap gap-2 border-y border-neutral-200 py-5 dark:border-zinc-800">
        {program.toc.map((item) => (
          <a key={item.id} href={`#${item.id}`} className={navPillLinkCompact}>
            {item.label}
          </a>
        ))}
      </nav>

      {/* 원칙 */}
      <section id="framework" className="mt-14 scroll-mt-28 space-y-4">
        <h2 className={h2}>{st.framework}</h2>
        <p className={body}>
          근육은 <strong className="text-apple-ink">장력·대사 스트레스</strong>에 반응해 적응합니다. 프로그램의 뼈대는{" "}
          <strong className="text-apple-ink">점진적 과부하(Progressive Overload)</strong>, <strong>특이성(Specificity)</strong>, 그리고{" "}
          <strong>자극–회복–적응(SRA)</strong>의 균형입니다. 주간 볼륨·강도·종목 선택은 이 세 축을 기준으로 조정합니다.
        </p>
        <ul className={`${body} list-inside list-disc space-y-2`}>
          <li>
            <strong className="text-apple-ink">개인차가 큽니다</strong>. 같은 계획이라도 수면·영양·스트레스·컨디션에 따라 주간에 감당할 수 있는 볼륨(MRV)은
            달라집니다.
          </li>
          <li>
            <strong className="text-apple-ink">숫자로 주기를 관리</strong>: 중량, 총 세트, RPE/RIR, 주간 총 볼륨(kg×회×세트), 부위별 비중.
          </li>
          <li>
            <strong className="text-apple-ink">자세(폼) 우선</strong> — 관절 각도·안정성·가동 범위(ROM)가 유지될 때 중량 상승이 의미 있습니다.
          </li>
        </ul>
        <YouTubeEmbed id={bv.framework.videoId} title={bv.framework.title} />
      </section>

      {/* 스플릿 */}
      <section id="split" className="mt-16 scroll-mt-28 space-y-5">
        <h2 className={h2}>{st.split}</h2>
        <p className={body}>
          <strong className="text-apple-ink">분할(Split)</strong>은 한 세션의 부담을 나누고, 부위별 주간 세트를 MEV~MAV 구간에 두기 위한 설계 도구입니다.
          입문 단계에서는 전신 또는 상·하 2분할로 패턴을 익히고, 중급 이후에는 푸시/풀/레그 또는 부위 4~5분할로 세분화하는 경우가 많습니다.
        </p>
        <GuideFigure src={bi.barbell.src} alt={bi.barbell.alt} />
        <YouTubeEmbed id={bv.split.videoId} title={bv.split.title} />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={card}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-apple-subtle">입문 · 주 3일 (전신 또는 상·하)</p>
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
              세션당 주 동작 4~6개를 기준으로, 아래 볼륨 랜드마크를 참고해 세트 합을 점진적으로 올리면 됩니다.
            </p>
          </div>
          <div className={card}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-apple-subtle">중급 · 주 4~5일</p>
            <ul className="mt-3 space-y-2 text-[14px] leading-snug text-apple-ink">
              <li>
                <span className="font-semibold">4분할</span> 하체 / 가슉·전면어깨 / 등·후면어깨 / 팔·보조
              </li>
              <li>
                <span className="font-semibold">푸시·풀·레그</span> 3분할 + 약점 부위 스페셜라이제이션 0.5~1일
              </li>
            </ul>
            <p className="mt-3 text-[12px] leading-relaxed text-apple-subtle">
              같은 근육은 보통 <strong className="text-apple-ink">48~72시간</strong> 간격을 두고, 주간 세트가 MRV에 가까워지면 관절·컨디션이 먼저 한계 신호를
              보냅니다.
            </p>
          </div>
        </div>
      </section>

      {/* 볼륨 랜드마크 */}
      <section id="volume" className="mt-16 scroll-mt-28 space-y-4">
        <h2 className={h2}>{st.volume}</h2>
        <p className={body}>
          르네상스 퍼리오다이제이션(RP)에서 널리 쓰는 틀로, <strong className="text-apple-ink">근육당 주간 세트</strong>를 잡을 때 참고합니다. 수치는
          평균적인 가이드이며, 본인의 기록과 회복 신호에 맞게 반드시 조정해야 합니다.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-[13px] text-apple-ink sm:text-[14px]">
            <thead className="border-b border-neutral-200 bg-neutral-100 text-[10px] font-bold uppercase tracking-[0.12em] text-apple-subtle sm:text-[11px]">
              <tr>
                <th className="px-3 py-2.5 sm:px-4">용어</th>
                <th className="px-3 py-2.5 sm:px-4">뜻</th>
                <th className="px-3 py-2.5 sm:px-4">현장에서</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-apple-subtle">
              <tr>
                <td className="px-3 py-2.5 font-semibold text-apple-ink sm:px-4">MV</td>
                <td className="px-3 py-2.5 sm:px-4">유지 볼륨</td>
                <td className="px-3 py-2.5 sm:px-4">바쁜 주에도 이 하한을 크게 밑돌지 않으면 유지에 유리합니다</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-apple-ink sm:px-4">MEV</td>
                <td className="px-3 py-2.5 sm:px-4">최소 효과 볼륨</td>
                <td className="px-3 py-2.5 sm:px-4">성장 기대할 때 최소 주간 세트 하한(근육·경험마다 다름)</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-apple-ink sm:px-4">MAV</td>
                <td className="px-3 py-2.5 sm:px-4">최대 적응 볼륨</td>
                <td className="px-3 py-2.5 sm:px-4">오래 머물기 좋은 “성장 효율” 구간 평균대</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold text-apple-ink sm:px-4">MRV</td>
                <td className="px-3 py-2.5 sm:px-4">최대 회복 가능 볼륨</td>
                <td className="px-3 py-2.5 sm:px-4">이를 넘기면 관절·컨디션·자세 품질이 흔들릴 확률이 커집니다 — 델로드·종목 전환을 검토할 시점</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={body}>
          근비대를 목표로 하면 <strong className="text-apple-ink">대근육군당 주 10~20세트</strong>가 흔한 출발점입니다. 대퇴사두·광배·삼각근·비복근 등
          부위마다 감당 가능한 양은 크게 다릅니다. 아래 영상은 세트를 늘릴 때의 근거와 주의점을 다룹니다.
        </p>
        <GuideFigure src={bi.plates.src} alt={bi.plates.alt} />
        <YouTubeEmbed id={bv.volumeMain.videoId} title={bv.volumeMain.title} />
        {volLink.href.trim() ? (
          <p className={`${body} rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2.5 text-[13px] sm:text-[14px]`}>
            {volLink.lead.trim() ? (
              <>
                {volLink.lead}
                {" "}
              </>
            ) : null}
            <a
              href={volLink.href}
              className="font-semibold text-apple-ink underline decoration-neutral-400 underline-offset-4 hover:opacity-60"
              target="_blank"
              rel="noopener noreferrer"
            >
              {volLink.anchorLabel.trim() || volLink.href}
            </a>
          </p>
        ) : null}
      </section>

      {/* 델로드 */}
      <section id="deload" className="mt-16 scroll-mt-28 space-y-4">
        <h2 className={h2}>{st.deload}</h2>
        <p className={body}>
          <strong className="text-apple-ink">누적 피로</strong>는 1RM뿐 아니라 바 속도·RPE·자세 품질에서 먼저 드러납니다. 보통{" "}
          <strong className="text-apple-ink">3:1 또는 4:1</strong>(적응 3~4주 + 델로드 1주) 주기를 쓰거나, RPE 급상승·수면 악화·통증 패턴 변화가 있으면
          델로드를 앞당깁니다.
        </p>
        <ul className={`${body} list-inside list-disc space-y-2`}>
          <li>
            <strong className="text-apple-ink">볼륨 델로드</strong>: 총 세트 30~50% 깎고, 강도는 중간 RPE로 느낌은 유지
          </li>
          <li>
            <strong className="text-apple-ink">강도 델로드</strong>: 세트 수는 유지하고 중량·RIR만 낮춤 — 관절이 예민할 때 자주 활용합니다
          </li>
          <li>
            <strong className="text-apple-ink">전환 델로드</strong>: 스쿼트 변형·그립 바꾸기 등 같은 패턴만 반복해서 쌓인 부담 풀기
          </li>
        </ul>
        <GuideFigure src={bi.calm.src} alt={bi.calm.alt} />
        <YouTubeEmbed id={bv.deload.videoId} title={bv.deload.title} />
      </section>

      {/* 순서 */}
      <section id="order" className="mt-16 scroll-mt-28 space-y-4">
        <h2 className={h2}>{st.order}</h2>
        <p className={body}>
          <strong className="text-apple-ink">신경계 부담이 큰 복합 동작</strong>을 앞쪽에 두면, 보조근이 지치기 전에 중추 신경계 타이밍을 맞추기 쉽습니다.{" "}
          <strong>프리-익스오스트(Pre-exhaust)</strong>는 고립 동작을 먼저 한 뒤 복합으로 타깃 근육을 이어 가는 기법입니다. 입문 단계나 요추 보호가 필요할 때는
          순서·중량·ROM을 보수적으로 설계하고, 숙련도가 올라가면 기록과 코치 피드백에 맞춰 순서를 조정합니다.
        </p>
        <ol className={`${body} list-inside list-decimal space-y-2`}>
          <li>올림픽 리프트·스매스 스쿼트 등 파워 패턴(할 때만)</li>
          <li>메인 복합(스쿼트·데드·벤치·풀업 등)</li>
          <li>보조 복합(런지·딥스·로우 변형)</li>
          <li>고립·머신·케이블로 볼륨 마무리</li>
        </ol>
        <GuideFigure src={bi.athlete.src} alt={bi.athlete.alt} />
      </section>

      {/* 워밍업 */}
      <section id="warmup" className="mt-16 scroll-mt-28 space-y-4">
        <h2 className={h2}>{st.warmup}</h2>
        <p className={body}>
          <strong className="text-apple-ink">RAMP</strong>로 정리하면 Raise(체온) – Activate(깨우기) – Mobilize(가동) – Potentiate(본 동작 패턴) 흐름이에요.
          15~20분을 넘기면 본 세트의 질이 떨어질 수 있으니 <strong className="text-apple-ink">짧게, 당일 메인 동작에 맞춰</strong> 구성합니다.
        </p>
        <GuideFigure src={bi.stretch.src} alt={bi.stretch.alt} />
        <YouTubeEmbed id={bv.warmupMain.videoId} title={bv.warmupMain.title} />
        <div className={card}>
          <p className="text-[13px] font-bold text-apple-ink">쿨다운</p>
          <p className={`mt-2 ${body}`}>
            본 세트 끝나면 <strong className="text-apple-ink">저강도 유산소 5~8분</strong>이랑 오늘 메인으로 쓴 근육 위주{" "}
            <strong>정적 스트레칭 30~60초×2~3세트</strong>로 심박과 긴장을 낮추고 혈류를 유지합니다. 통증이 있는 각도에서는 억지로 늘리지 마세요.
          </p>
          <YouTubeEmbed id={bv.cooldown.videoId} title={bv.cooldown.title} />
        </div>
      </section>

      {/* RPE */}
      <section id="rpe" className="mt-16 scroll-mt-28 space-y-4">
        <h2 className={h2}>{st.rpe}</h2>
        <p className={body}>
          <strong className="text-apple-ink">RPE</strong>는 체감 난이도, <strong>RIR</strong>은 실패 직전까지 남은 반복 수의 추정입니다. 입문 단계에서는
          RIR 2~4에서 자세를 고정하고, 중급 이후에는 일부 세트만 RIR 0~2로 점진적으로 확장합니다.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-[12px] text-apple-ink sm:text-[13px]">
            <thead className="border-b border-neutral-200 bg-neutral-100 text-[10px] font-medium uppercase tracking-[0.1em] text-apple-subtle">
              <tr>
                <th className="px-3 py-2 sm:px-4">RPE(10점)</th>
                <th className="px-3 py-2 sm:px-4">대략 RIR</th>
                <th className="px-3 py-2 sm:px-4">느낌</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-apple-subtle">
              <tr>
                <td className="px-3 py-2 font-semibold text-apple-ink sm:px-4">10</td>
                <td className="px-3 py-2 sm:px-4">0 (실패 또는 바로 직전)</td>
                <td className="px-3 py-2 sm:px-4">더 못 밈</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-apple-ink sm:px-4">9</td>
                <td className="px-3 py-2 sm:px-4">~1</td>
                <td className="px-3 py-2 sm:px-4">매우 무겁고 자세 한계에 근접</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-apple-ink sm:px-4">8</td>
                <td className="px-3 py-2 sm:px-4">~2</td>
                <td className="px-3 py-2 sm:px-4">근비대에서 자주 쓰는 상한 느낌</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-apple-ink sm:px-4">7</td>
                <td className="px-3 py-2 sm:px-4">~3</td>
                <td className="px-3 py-2 sm:px-4">폼·볼륨 쌓기 좋음</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-apple-ink sm:px-4">≤6</td>
                <td className="px-3 py-2 sm:px-4">4+</td>
                <td className="px-3 py-2 sm:px-4">워밍업·펌핑·가볍게 도는 날</td>
              </tr>
            </tbody>
          </table>
        </div>
        <GuideFigure src={bi.kettle.src} alt={bi.kettle.alt} />
        <YouTubeEmbed id={bv.rpe.videoId} title={bv.rpe.title} />
      </section>

      {/* 대체 */}
      <section id="alternatives" className="mt-16 scroll-mt-28 space-y-4">
        <h2 className={h2}>{st.alternatives}</h2>
        <p className={body}>
          관절 각도와 하중 방향만 조정해도 <strong className="text-apple-ink">같은 운동 패턴</strong>을 유지한 채 부담을 나눌 수 있습니다. 불편감이 있으면
          중량을 먼저 줄이기보다 <strong className="text-apple-ink">각도·ROM·도구</strong>를 먼저 바꾸는 편이 안전한 경우가 많습니다.
        </p>
        <GuideFigure src={bi.rack.src} alt={bi.rack.alt} />
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-[13px] text-apple-ink sm:text-[14px]">
            <thead className="border-b border-neutral-200 bg-neutral-100 text-[10px] font-bold uppercase tracking-[0.12em] text-apple-subtle sm:text-[11px]">
              <tr>
                <th className="px-3 py-2.5 sm:px-4">본 동작</th>
                <th className="px-3 py-2.5 sm:px-4">비슷한 대안</th>
                <th className="px-3 py-2.5 sm:px-4">팁</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">바벨 백스쿼트</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">세이프티바 스쿼트, SSB, 고블릿, 레그프레스</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">척추 압·전방 심 부담 줄이기</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">콘벤셔널 데드</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">루마니안, 스모, 덤벨 RDL, 힙힌지 머신</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">햄·등 각도 조절</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">바벨 벤치</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">덤벨, 머신, 플로어 프레스, 푸시업</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">어깨 외회전이 제한될 때</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">풀업</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">랫풀다운, 어시스트, 체스트 서포티드 로우</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">위에서 당기는 패턴 유지</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">스탠딩 OHP</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">시티드 덤벨, 핀숄더프레스, 랜드마인</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">허리 보상 동작을 줄이고 싶을 때</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium sm:px-4">바벨 로우</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">케이블 로우, 체스트패드 머신로우</td>
                <td className="px-3 py-2.5 text-apple-subtle sm:px-4">허리 중립 유지가 수월함</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 체크리스트 + 영상 */}
      <section id="checklist" className="mt-16 scroll-mt-28 space-y-6">
        <h2 className={h2}>{st.checklist}</h2>
        <p className={body}>
          아래는 <strong className="text-apple-ink">현장에서 확인할 수 있는 체크리스트</strong>입니다. 통증이 있으면 자세 조정 전에 의료진 상담을 우선
          고려하세요.
        </p>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className={card}>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-apple-subtle">스쿼트</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-apple-subtle sm:text-[14px]">
              <li>발 스크류(바깥·앞으로 살짝 비틀기)로 아치 유지</li>
              <li>무릎 방향은 발가락 2~5번 쪽이랑 맞추기</li>
              <li>흉추 살짝 세우고, 목은 중립~살짝 위</li>
              <li>앉는 깊이는 가동·무게 보고 “허벅지 거의 평행~살짝 아래”부터 천천히</li>
            </ul>
          </div>
          <YouTubeEmbed id={bv.squat.videoId} title={bv.squat.title} />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className={card}>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-apple-subtle">데드리프트·힙힌지</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-apple-subtle sm:text-[14px]">
              <li>견갑은 억지로 당기기보다 중립으로 단단히</li>
              <li>바는 중족 쪽에 수직으로 걸리게</li>
              <li>올릴 때 무릎·엉덩이 같이 펴기(더블 익스텐션 느낌)</li>
              <li>허리 말리기(라운딩) 나오면 바로 스톱·강도 내리기</li>
            </ul>
          </div>
          <YouTubeEmbed id={bv.deadlift.videoId} title={bv.deadlift.title} />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className={card}>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-apple-subtle">벤치 프레스</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-apple-subtle sm:text-[14px]">
              <li>견갑 아래·안쪽으로 고정, 흉추 살짝 아치</li>
              <li>팔꿈치 45° 전후(앞에서 보면 몸이랑 각)</li>
              <li>바는 보통 턱 근처에서 시작해서 흉골 아래로 J자</li>
              <li>하체 레그 드라이브로 베이스 단단히</li>
            </ul>
          </div>
          <YouTubeEmbed id={bv.bench.videoId} title={bv.bench.title} />
        </div>

        <div className={card}>
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-apple-subtle">로우·수평당김</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-apple-subtle sm:text-[14px]">
            <li>견갑 뒤로 내린 뒤 단단해지면 전완으로 당기기</li>
            <li>허리만 과하게 꺾지 말고 흉추는 중립~살짝만</li>
            <li>케이블은 줄–전완 방향이 저항 방향</li>
          </ul>
        </div>
      </section>

      {/* 마이크로 */}
      <section id="micro" className="mt-16 scroll-mt-28 space-y-3">
        <h2 className={h2}>{st.micro}</h2>
        <p className={body}>
          한 주에는 <strong className="text-apple-ink">변수 하나</strong>만 조정합니다. 예: “스쿼트 전 세트 RIR 2”, “벤치 바닥 터치 위치 고정”, “풀업
          하강 3초”. 대시보드의 주간 목표와 함께 쓰면 실행과 점검이 수월해집니다.
        </p>
      </section>

      {/* 운동 기록 */}
      <section id="stats" className="mt-16 scroll-mt-28 space-y-3">
        <h2 className={h2}>{st.stats}</h2>
        <p className={body}>
          주간·월간 볼륨, 종목 비중, 연속 기록은{" "}
          <Link href="/performance" className="font-semibold text-apple-ink underline decoration-neutral-400 underline-offset-[5px] hover:opacity-60">
            성과
          </Link>
          화면과 대시보드 카드에서 확인할 수 있습니다. CSV를 내려받아 스프레드시트에 <strong className="text-apple-ink">4주 이동 평균</strong>을 표시하면 MRV
          접근 여부를 빠르게 점검할 수 있습니다.
        </p>
      </section>

      {/* 안전 */}
      <section id="safety" className="mt-16 scroll-mt-28 space-y-3">
        <h2 className={h2}>{st.safety}</h2>
        <p className="rounded-sm border border-neutral-300 bg-neutral-50 px-4 py-3 text-[14px] leading-relaxed text-apple-ink">
          흉통, 실신 직전의 어지러움, 날카로운 관절 통증, 호흡 곤란이 있으면 즉시 운동을 중단하고 응급·의료기관을 이용하세요. 본 문서는 일반적인 근력
          트레이닝 정보를 제공할 뿐이며, 의학적 진단이나 처방을 대체하지 않습니다.
        </p>
      </section>
    </>
  );
}
