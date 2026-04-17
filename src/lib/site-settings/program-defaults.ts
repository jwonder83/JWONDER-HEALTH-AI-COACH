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
  { id: "framework", label: "원칙·과학" },
  { id: "split", label: "스플릿·주기" },
  { id: "volume", label: "볼륨 랜드마크" },
  { id: "deload", label: "델로드·피로" },
  { id: "order", label: "운동 순서" },
  { id: "warmup", label: "워밍업·쿨다운" },
  { id: "rpe", label: "RPE·RIR" },
  { id: "alternatives", label: "대체 종목" },
  { id: "checklist", label: "종목별 큐" },
  { id: "micro", label: "마이크로 목표" },
  { id: "stats", label: "통계" },
  { id: "safety", label: "안전" },
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
    alt: "원판과 트레이닝 준비",
  },
  calm: {
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=82",
    alt: "회복과 휴식",
  },
  athlete: {
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=82",
    alt: "트레이닝 동작",
  },
  stretch: {
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=82",
    alt: "스트레칭과 준비 운동",
  },
  kettle: {
    src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=82",
    alt: "케틀벨과 액세서리 트레이닝",
  },
  rack: {
    src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=82",
    alt: "랙과 머신 트레이닝",
  },
};

export const DEFAULT_PROGRAM_BUILTIN_VIDEOS: ProgramBuiltinVideos = {
  framework: { videoId: "k0J8URJfUTg", title: "점진적 과부하에 대한 설명 (Jeff Nippard, 영문)" },
  split: { videoId: "3JOEZb46-dM", title: "반복 수·강도와 근성장 (Jeff Nippard Fundamentals, 영문)" },
  volumeMain: { videoId: "ifoX_HJeGA4", title: "근성장을 위한 세트 볼륨 (Mike Israetel, 영문)" },
  deload: { videoId: "1KWsgdDX79w", title: "보디빌딩을 위한 주기화 예시 (Jeff Nippard, 영문)" },
  warmupMain: { videoId: "E81GN-3A8XM", title: "과학 기반 워밍업·모빌리티 루틴 (영문)" },
  cooldown: { videoId: "IlHgLYdt3kc", title: "운동 후 풀바디 스트레칭·쿨다운 (영문)" },
  rpe: { videoId: "deDlhPmT2SY", title: "훈련 강도와 RPE·RIR (Jeff Nippard, 영문)" },
  squat: { videoId: "W73Mc0Gil9A", title: "스쿼트와 무릎 통증·자세 (Jeremy Ethier, 영문)" },
  deadlift: { videoId: "MBbyAqvTNkU", title: "5단계 데드리프트 셋업 (Alan Thrall, 영문)" },
  bench: { videoId: "vcBig73ojpE", title: "벤치 프레스 기술 (Jeff Nippard, 영문)" },
};

export const DEFAULT_PROGRAM_VOLUME_EXTERNAL_LINK: ProgramExternalVideoLink = {
  lead: "심화 이론(영문 강의):",
  anchorLabel: "Volume Landmarks 추정 (Renaissance Periodization)",
  href: "https://www.youtube.com/watch?v=M2PP8AAXgPo",
};

export const DEFAULT_PROGRAM_SECTION_TITLES: ProgramSectionTitles = {
  framework: "훈련 원칙과 과학적 프레임",
  split: "주간 스플릿과 중주기(Mesocycle)",
  volume: "볼륨 랜드마크(MV–MEV–MAV–MRV)",
  deload: "델로드·피로 관리·주기화",
  order: "운동 순서와 신경·대사 우선순위",
  warmup: "워밍업(RAMP)과 쿨다운",
  rpe: "RPE·RIR와 자동조절 프로그래밍",
  alternatives: "대체 종목·도구 선택",
  checklist: "종목별 코칭 큐와 참고 영상",
  micro: "마이크로 목표와 주간 운영",
  stats: "데이터로 주기를 점검하기",
  safety: "안전·의학적 경고",
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
