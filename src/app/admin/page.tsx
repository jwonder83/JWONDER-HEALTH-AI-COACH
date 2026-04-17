import Link from "next/link";

const cardClass =
  "group flex flex-col border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-black";

export default function AdminIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-[1.75rem] font-bold tracking-[-0.02em] text-apple-ink sm:text-[2rem]">관리자 홈</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-apple-subtle">
        수정할 영역을 선택하세요. 변경 사항은 저장 후 메인·프로그램 페이지를 새로고침하면 반영됩니다.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/site" className={cardClass}>
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-apple-subtle">Site</span>
          <span className="font-display mt-2 text-[1.2rem] font-semibold text-apple-ink group-hover:opacity-70">사이트 문구·이미지</span>
          <span className="mt-2 text-[13px] leading-relaxed text-apple-subtle">앱 타이틀, 히어로, 폼 문구, 도움말, 푸터, 이미지 슬롯</span>
        </Link>
        <Link href="/admin/program" className={cardClass}>
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-apple-subtle">Program</span>
          <span className="font-display mt-2 text-[1.2rem] font-semibold text-apple-ink group-hover:opacity-70">프로그램 안내</span>
          <span className="mt-2 text-[13px] leading-relaxed text-apple-subtle">메뉴 레이블, 페이지 제목·리드, 내장 가이드 on/off, 마크다운</span>
        </Link>
      </div>
    </div>
  );
}
