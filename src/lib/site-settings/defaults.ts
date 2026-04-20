import type { SiteSettingsMerged } from "@/types/site-settings";
import { defaultProgramGuideBase } from "@/lib/site-settings/program-defaults";

const DEFAULT_PROGRAM: SiteSettingsMerged["program"] = {
  navLabel: "프로그램",
  promoLinkLabel: "루틴·개념 살펴보기",
  pageEyebrow: "가이드",
  pageTitle: "운동 프로그램 개요",
  pageLead:
    "벌크·컷에 쓰이는 핵심 개념만 정리했습니다. 통증·질환이 있으면 먼저 의료진과 상담하는 것이 안전합니다.",
  showBuiltInSections: true,
  prefixMarkdown: "",
  appendixMarkdown: "",
  ...defaultProgramGuideBase(),
};

export const DEFAULT_SITE_SETTINGS = {
  program: DEFAULT_PROGRAM,
  images: {
    headerLogo: {
      src: "",
      alt: "홈",
    },
    hero: {
      src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=82",
      alt: "헬스장, 덤벨이 놓인 벤치",
    },
    coaching: {
      src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=82",
      alt: "바벨과 웨이트 트레이닝 공간",
    },
    listEmpty: {
      src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=78",
      alt: "트레이닝 준비하는 운동 공간",
    },
    authPanel: {
      src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1600&q=82",
      alt: "밝은 피트니스 룸과 장비",
    },
    dashTile1: {
      src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
      alt: "바벨 트레이닝",
    },
    dashTile2: {
      src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
      alt: "트레이닝 공간",
    },
    dashTile3: {
      src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80",
      alt: "피트니스 룸",
    },
  },
  copy: {
    appTitle: "운동 기록 · 코칭",
    appDescription: "세트 기록은 클라우드에 안전하게 보관되고, 코칭은 한 줄 요약으로 바로 확인할 수 있습니다.",
    loginPanel: {
      eyebrow: "JWS",
      title: "기록이 쌓이면 리듬이 보입니다",
      description: "로그인하면 기기가 바뀌어도 데이터가 이어집니다. 홈에서 입력·목록·코칭까지 한 흐름으로 이용하세요.",
    },
    loginCard: {
      eyebrow: "Welcome",
      title: "다시 오셨습니다",
      subtitle: "이메일과 비밀번호를 입력한 뒤 로그인하세요.",
    },
    loginForm: {
      emailLabel: "이메일",
      passwordLabel: "비밀번호",
      submitLabel: "로그인",
      submittingLabel: "처리 중…",
      noAccountPrompt: "아직 계정이 없으신가요?",
      signupLinkLabel: "회원가입 후 시작하기",
    },
    signupPanel: {
      eyebrow: "JWS",
      title: "나만의 운동 로그",
      description: "가입 후 세트를 저장하면 목록과 코멘트가 함께 쌓입니다. 최소 정보만으로 시작할 수 있습니다.",
    },
    signupCard: {
      eyebrow: "Join",
      title: "회원가입",
      subtitle: "인증 메일은 스팸·프로모션함도 함께 확인해 주세요.",
    },
    mainHero: {
      eyebrow: "Today",
      titleLine1: "오늘 세트를 남기고",
      titleLine2: "내일의 나를 업데이트하세요",
      subtitle: "클라우드에 자동 저장됩니다. 입력·목록·코칭을 한 화면에서 이어갈 수 있습니다.",
    },
    mainNavSectionLabels: ["세트 입력", "운동 기록", "코칭"],
    mainDashTileCaptions: ["세트 입력", "전체 기록", "코칭 받기"],
    webCoachingEyebrow: "Coaching",
    webCoachingTitle: "코칭 요약",
    webCoachingHint:
      "저장된 운동을 바탕으로 짧은 코멘트를 생성합니다. OpenAI를 쓰려면 서버에 API 키와 COACHING_USE_OPENAI 설정이 필요합니다. COACHING_CONTENT_URL을 지정하면 해당 페이지 내용도 참고합니다.",
    webCoachingButtonLabel: "코멘트 생성",
    listEmptyTitle: "아직 저장된 기록이 없습니다",
    listEmptySubtitle: "첫 세트만 저장해도 이 영역이 곧 채워집니다.",
    workoutForm: {
      eyebrow: "New",
      title: "오늘의 세트",
      subtitle: "필수 항목만 입력하고 저장하면 아래 목록에 즉시 반영됩니다.",
      exerciseLabel: "운동 이름",
      exercisePlaceholder: "예: 벤치 프레스 (약칭 가능)",
      weightLabel: "중량 (kg)",
      repsLabel: "반복 횟수",
      setsLabel: "세트 수",
      outcomeGroupLabel: "세트 평가",
      outcomeAriaLabel: "세트 성공 여부",
      successLabel: "목표 달성",
      failLabel: "목표 미달",
      saveButtonLabel: "저장",
      savingButtonLabel: "저장 중…",
      savedToast: "저장되었습니다.",
    },
    coachingHistoryTitle: "최근 코칭",
    helpCenter: {
      pageTitle: "도움말",
      intro: "세트 입력 → 기록 확인 → 코칭까지의 흐름을 안내합니다. FAQ만 읽어도 대부분의 질문에 답할 수 있습니다.",
      contactLine: "추가 문의는 운영 담당자에게 메일로 보내 주세요.",
      faqSectionTitle: "자주 묻는 질문",
      faqItems: [
        {
          question: "기록은 어디에 저장되나요?",
          answer:
            "로그인한 계정에 연결된 Supabase 클라우드에 저장됩니다. 다른 기기에서 같은 계정으로 로그인하면 동일한 기록을 볼 수 있습니다.",
        },
        {
          question: "코칭은 어떻게 동작하나요?",
          answer:
            "저장된 운동 데이터를 서버가 요약해 코멘트를 만듭니다. OpenAI 연동을 사용하려면 관리자가 API 키를 설정해야 합니다.",
        },
        {
          question: "비밀번호를 잊었습니다.",
          answer: "설정 화면에서 재설정 메일을 요청하거나, 로그인 화면의 비밀번호 찾기(활성화된 경우)를 이용해 주세요.",
        },
        {
          question: "기록을 삭제할 수 있나요?",
          answer: "목록에서 개별 삭제가 가능하며, 홈에서 전체 삭제도 지원합니다. 전체 삭제는 되돌릴 수 없으니 신중히 선택해 주세요.",
        },
      ],
    },
    legalPages: {
      termsTitle: "이용약관",
      termsBody:
        "제1조 (목적)\n본 약관은 서비스 이용에 필요한 기본 사항을 규정합니다.\n\n제2조 (서비스)\n운동 기록 저장, 목록 조회, 코칭 기능을 제공합니다.\n\n제3조 (이용자의 의무)\n계정 정보는 본인만 사용하고, 타인과 공유하지 않도록 주의해야 합니다.",
      privacyTitle: "개인정보처리방침",
      privacyBody:
        "1. 수집 항목\n이메일, 운동 기록 데이터, 코칭 요청 시 전송되는 요약 데이터가 처리될 수 있습니다.\n\n2. 이용 목적\n서비스 제공, 본인 확인, 문의 응대에 사용됩니다.\n\n3. 보관\n계정 삭제 시 또는 관련 법령에서 정한 기간까지 보관될 수 있습니다.",
    },
    footer: {
      primaryLine: "운동 기록 · 코칭",
      secondaryLine: "",
      links: [
        { label: "이용약관", href: "/legal/terms" },
        { label: "개인정보", href: "/legal/privacy" },
        { label: "도움말", href: "/help" },
      ],
      copyrightLine: "© {year}",
    },
  },
  experience: {
    missedDayHourLocal: 22,
    workoutRestTargetSeconds: 60,
    briefingHighLoadDayMinRows: 7,
    briefingHighLoadDayMinVolume: 900,
    interventionMorningEndHour: 12,
    interventionAfternoonEndHour: 18,
    interventionEveningEndHour: 21,
    navLabels: {
      home: "홈",
      workout: "기록",
      performance: "성과",
      help: "도움말",
      settings: "설정",
    },
  },
} satisfies SiteSettingsMerged;
