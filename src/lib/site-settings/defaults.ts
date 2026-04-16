import type { SiteSettingsMerged } from "@/types/site-settings";

export const DEFAULT_SITE_SETTINGS: SiteSettingsMerged = {
  images: {
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
    appTitle: "헬스 기록 · AI 코칭",
    appDescription: "Supabase 로그인과 클라우드 운동 기록, AI 코칭",
    loginPanel: {
      eyebrow: "JWS · Workout",
      title: "한 세트씩 쌓이는 기록",
      description: "로그인하면 운동이 클라우드에 동기화되고, AI 코칭과 목록이 한 화면에서 이어집니다.",
    },
    loginCard: {
      eyebrow: "Welcome back",
      title: "로그인",
      subtitle: "이메일과 비밀번호로 계속하세요.",
    },
    signupPanel: {
      eyebrow: "JWS · Workout",
      title: "오늘부터 기록을 시작해 보세요",
      description: "가입 후 바로 세트를 남기고, 목록과 AI 코칭으로 루틴을 다듬을 수 있습니다.",
    },
    signupCard: {
      eyebrow: "Create account",
      title: "회원가입",
      subtitle: "이메일 인증을 켜 두었다면 메일함도 확인해 주세요.",
    },
    mainHero: {
      eyebrow: "Workout log",
      titleLine1: "오늘의 세트를 남기고,",
      titleLine2: "내일의 리듬을 만드세요.",
      subtitle: "기록은 Supabase에 저장됩니다. 아래에서 입력·목록·AI 코칭을 오갈 수 있어요.",
    },
    mainNavSectionLabels: ["기록", "목록", "AI 코칭"],
    mainDashTileCaptions: ["기록", "추적", "AI 코칭"],
    webCoachingEyebrow: "AI Coach",
    webCoachingTitle: "AI 코칭",
    webCoachingHint:
      "OpenAI를 사용해 기록을 읽고 한국어 코칭을 생성합니다. 서버에 OPENAI_API_KEY가 필요합니다.",
    webCoachingButtonLabel: "AI 코칭 받기",
    listEmptyTitle: "아직 기록이 없어요",
    listEmptySubtitle: "위에서 첫 세트를 저장해 보세요.",
    workoutForm: {
      eyebrow: "New",
      title: "운동 입력",
      subtitle: "필수만 채우면 됩니다. 저장과 동시에 목록에 반영돼요.",
      exerciseLabel: "운동명",
      exercisePlaceholder: "예: 벤치 프레스",
      weightLabel: "중량 (kg)",
      repsLabel: "반복",
      setsLabel: "세트",
      outcomeGroupLabel: "세트 결과",
      outcomeAriaLabel: "세트 성공 여부",
      successLabel: "성공",
      failLabel: "실패",
      saveButtonLabel: "저장",
      savingButtonLabel: "저장 중…",
      savedToast: "저장되었습니다.",
    },
    coachingHistoryTitle: "최근 AI 코칭",
    helpCenter: {
      pageTitle: "도움말",
      intro:
        "운동 기록은 메인 화면에서 입력하고, 목록에서 확인하며, AI 코칭으로 피드백을 받을 수 있습니다. 아래 FAQ를 참고해 주세요.",
      contactLine: "문의가 필요하면 서비스 운영자에게 이메일로 연락해 주세요.",
      faqSectionTitle: "자주 묻는 질문",
      faqItems: [
        {
          question: "기록은 어디에 저장되나요?",
          answer: "로그인한 계정에 연결된 Supabase 데이터베이스에 저장됩니다. 다른 기기에서 같은 계정으로 로그인하면 같은 목록이 보입니다.",
        },
        {
          question: "AI 코칭은 어떻게 동작하나요?",
          answer: "저장된 운동 목록을 서버가 요약해 OpenAI 등에 보내고, 한국어 코칭 문구를 생성합니다. API 키가 설정되어 있어야 합니다.",
        },
        {
          question: "비밀번호를 잊었어요.",
          answer: "계정 설정 화면에서 재설정 이메일을 요청하거나, 로그인 화면의 비밀번호 찾기(가입 시 설정한 경우)를 이용해 주세요.",
        },
        {
          question: "기록을 지울 수 있나요?",
          answer: "목록에서 항목별 삭제가 가능하고, 메인 화면의 전체 삭제로 한 번에 비울 수도 있습니다. 전체 삭제는 되돌릴 수 없습니다.",
        },
      ],
    },
    legalPages: {
      termsTitle: "이용약관",
      termsBody:
        "제1조 (목적)\n이 약관은 본 서비스의 이용과 관련하여 필요한 사항을 규정합니다.\n\n제2조 (서비스)\n운동 기록 저장, 목록 조회, AI 코칭 기능을 제공합니다.\n\n제3조 (의무)\n이용자는 계정 정보를 타인에게 공유하지 않도록 주의해야 합니다.",
      privacyTitle: "개인정보처리방침",
      privacyBody:
        "1. 수집 항목\n이메일, 운동 기록 데이터, AI 코칭 요청 시 전송되는 기록 요약이 처리될 수 있습니다.\n\n2. 목적\n서비스 제공, 본인 확인, 문의 응대에 사용됩니다.\n\n3. 보관\n계정 삭제 시 또는 관련 법령에 따른 기간까지 보관될 수 있습니다.",
    },
    footer: {
      primaryLine: "헬스 기록 · AI 코칭",
      secondaryLine: "",
      links: [
        { label: "이용약관", href: "/legal/terms" },
        { label: "개인정보처리방침", href: "/legal/privacy" },
        { label: "도움말", href: "/help" },
      ],
      copyrightLine: "© {year}",
    },
  },
};
