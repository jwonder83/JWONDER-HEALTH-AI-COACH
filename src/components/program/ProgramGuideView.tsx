import type { ProgramGuideSettings } from "@/types/site-settings";
import { ProgramGuideBuiltIn } from "@/components/program/ProgramGuideBuiltIn";
import { ProgramMarkdownBlock } from "@/components/program/ProgramMarkdownBlock";

const leadClass = "text-[15px] font-medium leading-relaxed text-apple-ink sm:text-[16px]";

type Props = { program: ProgramGuideSettings };

export function ProgramGuideView({ program }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-14">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple">{program.pageEyebrow}</p>
      <h1 className="font-display mt-2 text-[1.85rem] font-bold tracking-[-0.03em] text-apple-ink sm:text-[2.25rem]">
        {program.pageTitle}
      </h1>
      <p className={`mt-3 whitespace-pre-line ${leadClass}`}>{program.pageLead}</p>

      {program.prefixMarkdown.trim() ? (
        <div className="mt-6">
          <ProgramMarkdownBlock markdown={program.prefixMarkdown} />
        </div>
      ) : null}

      {program.showBuiltInSections ? (
        <ProgramGuideBuiltIn />
      ) : (
        <div className="mt-8 rounded-2xl border border-amber-200/90 bg-amber-50/70 px-4 py-3 text-[14px] text-amber-950">
          내장 프로그램 본문이 꺼져 있습니다. 어드민에서 「내장 가이드 표시」를 켜거나, 위·아래 마크다운 영역에 내용을 채워 주세요.
        </div>
      )}

      {program.appendixMarkdown.trim() ? (
        <div className="mt-8">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-apple">추가 안내</p>
          <ProgramMarkdownBlock markdown={program.appendixMarkdown} />
        </div>
      ) : null}
    </div>
  );
}
