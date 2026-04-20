/**
 * 앱 전역 메뉴·탭·보조 내비게이션 공통 스타일.
 * 헤더 고스트 링크 / 테두리 pill / 페이지 내 세그먼트를 한 톤으로 맞춘다.
 */
export const navMenuTracking = "uppercase tracking-[0.16em]";

/** 섹션 라벨·브랜드 보조 텍스트 (Admin 배지 등) */
export const navMenuEyebrow =
  `font-display text-[11px] font-medium ${navMenuTracking} text-apple-subtle dark:text-zinc-500`;

/** 메인 앱 헤더: 로고 옆 주요 링크 */
export const navHeaderLink = `inline-flex min-h-[40px] items-center justify-center rounded-md border border-transparent px-2.5 text-[11px] font-medium ${navMenuTracking} text-apple-ink transition-colors hover:border-neutral-200 hover:bg-neutral-50 sm:px-3 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/70`;

/** 로그아웃·보조 액션 */
export const navHeaderLinkMuted = `inline-flex min-h-[40px] items-center justify-center rounded-md border border-transparent px-2.5 text-[11px] font-medium ${navMenuTracking} text-apple-subtle transition-colors hover:border-neutral-200 hover:bg-neutral-50 hover:text-apple-ink sm:px-3 dark:text-zinc-500 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/70 dark:hover:text-zinc-100`;

/** 관리자 서브내비·프로그램 목차 등 테두리 pill */
export const navPillLink = `inline-flex min-h-[40px] items-center justify-center rounded-md border border-neutral-200 bg-white px-3.5 py-2 text-[11px] font-medium ${navMenuTracking} text-apple-ink transition-colors hover:border-black hover:bg-neutral-50 sm:px-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-400 dark:hover:bg-zinc-800/80`;

/** 목차 등 한 줄에 많이 붙는 compact pill */
export const navPillLinkCompact = `inline-flex min-h-[36px] items-center justify-center rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-medium ${navMenuTracking} text-apple-ink transition-colors hover:border-black hover:bg-neutral-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-400 dark:hover:bg-zinc-800/80`;

/** 홈 대시보드 스티키 앵커 바 */
export const navSegmentBar =
  "flex w-full max-w-2xl flex-wrap divide-neutral-200 overflow-hidden rounded-md border border-neutral-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-nowrap sm:divide-x";

export const navSegmentItem = `min-h-[48px] flex-1 bg-white px-3 py-3 text-center text-[12px] font-medium ${navMenuTracking} text-apple-ink transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/15 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900 sm:flex-none sm:min-w-[6.75rem] sm:px-5`;

/** 스티키 바 옆 보조 버튼(전체 삭제 등) */
export const navToolbarButton = `inline-flex min-h-[44px] items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-[11px] font-medium ${navMenuTracking} text-apple-subtle transition-colors hover:border-black hover:bg-neutral-50 hover:text-apple-ink dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-400 dark:hover:text-zinc-100`;
