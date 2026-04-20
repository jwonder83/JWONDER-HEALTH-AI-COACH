import type {
  ProgramBuiltinImages,
  ProgramBuiltinVideos,
  ProgramExternalVideoLink,
  ProgramGuideSettings,
  ProgramSectionTitles,
  ProgramTocItem,
} from "@/types/site-settings";

/** 목차 id는 앵커(#id)와 섹션 id와 일치해야 합니다. */
export const DEFAULT_PROGRAM_TOC: ProgramTocItem[] = [
  { id: "framework", label: "훈련 원칙" },
  { id: "split", label: "주간 분할" },
  { id: "volume", label: "볼륨 기준" },
  { id: "deload", label: "델로드·휴식" },
  { id: "order", label: "운동 순서" },
  { id: "warmup", label: "워밍업·쿨다운" },
  { id: "rpe", label: "RPE·RIR" },
  { id: "alternatives", label: "대체 동작" },
  { id: "checklist", label: "동작 체크" },
  { id: "micro", label: "작은 목표" },
  { id: "stats", label: "기록 점검" },
  { id: "safety", label: "안전 안내" },
];

export const DEFAULT_PROGRAM_BUILTIN_IMAGES: ProgramBuiltinImages = {
  hero: {
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=82",
    alt: "웨이트 트레이닝 공간",
  },
  barbell: {
    src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=82",
    alt: "바벨 트레이닝",
  },
  plates: {
    src: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=82",
    alt: "원판을 준비하는 모습",
  },
  calm: {
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=82",
    alt: "휴식과 회복",
  },
  athlete: {
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=82",
    alt: "본 세트에 집중하는 모습",
  },
  stretch: {
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=82",
    alt: "준비 운동과 스트레칭",
  },
  kettle: {
    src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=82",
    alt: "케틀벨·액세서리 존",
  },
  rack: {
    src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=82",
    alt: "랙과 머신 라인",
  },
};

export const DEFAULT_PROGRAM_BUILTIN_VIDEOS: ProgramBuiltinVideos = {
  framework: { videoId: "k0J8URJfUTg", title: "점진적 과부하 설명 (Jeff Nippard, 영문)" },
  split: { videoId: "3JOEZb46-dM", title: "볼륨·강도와 근성장 (Jeff Nippard, 영문)" },
  volumeMain: { videoId: "ifoX_HJeGA4", title: "세트 볼륨 가이드 (Mike Israetel, 영문)" },
  deload: { videoId: "1KWsgdDX79w", title: "주기화·델로드 예시 (Jeff Nippard, 영문)" },
  warmupMain: { videoId: "E81GN-3A8XM", title: "근거 기반 워밍업 (영문)" },
  cooldown: { videoId: "IlHgLYdt3kc", title: "전신 쿨다운 스트레칭 (영문)" },
  rpe: { videoId: "deDlhPmT2SY", title: "RPE·RIR로 강도 조절 (Jeff Nippard, 영문)" },
  squat: { videoId: "W73Mc0Gil9A", title: "스쿼트·무릎·자세 (Jeremy Ethier, 영문)" },
  deadlift: { videoId: "MBbyAqvTNkU", title: "데드리프트 셋업 (Alan Thrall, 영문)" },
  bench: { videoId: "vcBig73ojpE", title: "벤치 프레스 기술 (Jeff Nippard, 영문)" },
};

export const DEFAULT_PROGRAM_VOLUME_EXTERNAL_LINK: ProgramExternalVideoLink = {
  lead: "심화 학습(영문):",
  anchorLabel: "볼륨 랜드마크 추정 (Renaissance Periodization)",
  href: "https://www.youtube.com/watch?v=M2PP8AAXgPo",
};

export const DEFAULT_PROGRAM_SECTION_TITLES: ProgramSectionTitles = {
  framework: "훈련 원칙 — 과학적 기반 한눈에",
  split: "주간 분할·중주기",
  volume: "볼륨 랜드마크(MV~MRV)",
  deload: "델로드·피로·주기",
  order: "운동 순서 — 신경·대사 부담",
  warmup: "워밍업(RAMP)·쿨다운",
  rpe: "RPE·RIR로 강도 맞추기",
  alternatives: "대체 동작·도구 선택",
  checklist: "종목별 체크포인트와 영상",
  micro: "작은 목표로 주간 운영",
  stats: "기록으로 주기 점검",
  safety: "안전·의학적 유의",
};

export function defaultProgramGuideBase(): Pick<
  ProgramGuideSettings,
  "toc" | "builtinImages" | "builtinVideos" | "volumeExternalLink" | "sectionTitles"
> {
  return {
    toc: structuredClone(DEFAULT_PROGRAM_TOC),
    builtinImages: structuredClone(DEFAULT_PROGRAM_BUILTIN_IMAGES),
    builtinVideos: structuredClone(DEFAULT_PROGRAM_BUILTIN_VIDEOS),
    volumeExternalLink: structuredClone(DEFAULT_PROGRAM_VOLUME_EXTERNAL_LINK),
    sectionTitles: structuredClone(DEFAULT_PROGRAM_SECTION_TITLES),
  };
}
