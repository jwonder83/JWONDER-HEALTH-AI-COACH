import type { ProgramGuideSettings } from "@/types/site-settings";
import { ProgramGuideBuiltIn } from "@/components/program/ProgramGuideBuiltIn";
import { ProgramMarkdownBlock } from "@/components/program/ProgramMarkdownBlock";

const leadClass = "text-[14px] font-medium leading-snug text-apple-ink sm:text-[15px]";

type Props = { program: ProgramGuideSettings };

export function ProgramGuideView({ program }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-14">
      <p className="text-[11px] font-medium tracking-[-0.01em] text-apple-subtle">{program.pageEyebrow}</p>
      <h1 className="font-display mt-2 text-[1.75rem] font-bold tracking-[-0.03em] text-apple-ink sm:text-[2.1rem]">
        {program.pageTitle}
      </h1>
      <p className={`mt-3 whitespace-pre-line ${leadClass}`}>{program.pageLead}</p>

      {program.prefixMarkdown.trim() ? (
        <div className="mt-6">
          <ProgramMarkdownBlock markdown={program.prefixMarkdown} />
        </div>
      ) : null}

      {program.showBuiltInSections ? (
        <ProgramGuideBuiltIn program={program} />
      ) : (
        <div className="mt-8 border border-neutral-300 bg-neutral-50 px-4 py-3 text-[14px] text-apple-ink">
          내장 가이드가 꺼져 있어요. 관리 화면에서 「내장 가이드 표시」를 켜거나, 위·아래 마크다운에 내용을 넣어 주세요.
        </div>
      )}

      {program.appendixMarkdown.trim() ? (
        <div className="mt-8">
          <p className="mb-2 text-[12px] font-medium tracking-[-0.01em] text-apple-subtle">추가 안내</p>
          <ProgramMarkdownBlock markdown={program.appendixMarkdown} />
        </div>
      ) : null}
    </div>
  );
}
