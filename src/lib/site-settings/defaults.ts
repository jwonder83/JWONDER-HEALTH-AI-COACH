import type { SiteSettingsMerged } from "@/types/site-settings";
import { defaultProgramGuideBase } from "@/lib/site-settings/program-defaults";

const DEFAULT_PROGRAM: SiteSettingsMerged["program"] = {
  navLabel: "프로그램",
  promoLinkLabel: "루틴·개념 보러가기",
  pageEyebrow: "읽을거리",
  pageTitle: "운동 프로그램 한눈에",
  pageLead: "벌크·컷에 쓰는 개념만 정리해 뒀어요. 몸이 불편하면 병원·전문가부터 가는 게 좋아요.",
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
    appTitle: "운동 기록 + 코치",
    appDescription: "기록은 클라우드에, 코치는 한마디로. 어디서든 이어서 적기.",
    loginPanel: {
      eyebrow: "JWS",
      title: "세트마다 쌓이는 자신감",
      description: "로그인하면 폰이 바뀌어도 기록은 그대로. 홈에서 입력·목록·코칭까지 한 번에.",
    },
    loginCard: {
      eyebrow: "Welcome",
      title: "다시 왔어?",
      subtitle: "이메일이랑 비밀번호만 넣으면 끝.",
    },
    loginForm: {
      emailLabel: "이메일",
      passwordLabel: "비밀번호",
      submitLabel: "로그인",
      submittingLabel: "잠깐만…",
      noAccountPrompt: "아직 계정 없어?",
      signupLinkLabel: "가입하고 시작하기",
    },
    signupPanel: {
      eyebrow: "JWS",
      title: "내 운동 기록은 내 거",
      description: "가입하고 세트만 남기면 목록이랑 코멘트가 같이 붙어요.",
    },
    signupCard: {
      eyebrow: "Join",
      title: "회원가입",
      subtitle: "인증 메일은 스팸함도 한번 봐 주세요.",
    },
    mainHero: {
      eyebrow: "Today",
      titleLine1: "오늘 세트 남기고",
      titleLine2: "내일 나한테 칭찬하기",
      subtitle: "클라우드에 저장돼요. 기록·목록·코칭을 한 화면에서.",
    },
    mainNavSectionLabels: ["세트 입력", "내 기록", "코치"],
    mainDashTileCaptions: ["세트 입력", "전체 보기", "코치 부르기"],
    webCoachingEyebrow: "Coaching",
    webCoachingTitle: "코칭 받기",
    webCoachingHint:
      "저장해 둔 운동을 요약해서 코멘트를 만들어요. OpenAI를 쓰려면 서버에 API 키랑 COACHING_USE_OPENAI가 필요하고, COACHING_CONTENT_URL을 넣으면 그 페이지 내용도 참고해요.",
    webCoachingButtonLabel: "코멘트 받기",
    listEmptyTitle: "아직 기록이 없어요",
    listEmptySubtitle: "첫 세트만 남겨도 여기가 바로 채워져요.",
    workoutForm: {
      eyebrow: "New",
      title: "오늘 뭐 했어?",
      subtitle: "필수만 채우고 저장하면 아래 목록에 바로 반영돼요.",
      exerciseLabel: "종목",
      exercisePlaceholder: "예: 벤치프레스 (별칭 OK)",
      weightLabel: "중량 (kg)",
      repsLabel: "횟수",
      setsLabel: "세트 수",
      outcomeGroupLabel: "이번 세트 느낌",
      outcomeAriaLabel: "세트 성공 여부",
      successLabel: "성공",
      failLabel: "아쉬움",
      saveButtonLabel: "저장",
      savingButtonLabel: "저장 중…",
      savedToast: "저장 완료!",
    },
    coachingHistoryTitle: "지난 코칭",
    helpCenter: {
      pageTitle: "도움말",
      intro: "세트 입력 → 목록 확인 → 코치 코멘트까지. FAQ만 훑어도 충분해요.",
      contactLine: "막히면 운영자에게 메일 주세요.",
      faqSectionTitle: "자주 묻는 질문",
      faqItems: [
        {
          question: "기록은 어디에 저장돼요?",
          answer: "로그인한 계정에 연결된 클라우드(Supabase)에요. 다른 기기에서 같은 계정으로 들어가면 그대로 보여요.",
        },
        {
          question: "코치는 어떻게 동작해요?",
          answer: "저장된 운동을 서버가 요약해서 코멘트를 만들어요. OpenAI를 쓰려면 API 키 설정이 필요해요.",
        },
        {
          question: "비밀번호를 잊어버렸어요",
          answer: "설정에서 재설정 메일을 받거나, 로그인 화면의 비밀번호 찾기(켜져 있을 때)를 이용해 주세요.",
        },
        {
          question: "기록을 지울 수 있나요?",
          answer: "목록에서 하나씩 지울 수 있고, 홈에서 전체 삭제도 가능해요. 전체 삭제는 되돌릴 수 없어요.",
        },
      ],
    },
    legalPages: {
      termsTitle: "이용약관",
      termsBody:
        "제1조 (목적)\n이 약관은 본 서비스의 이용과 관련하여 필요한 사항을 규정합니다.\n\n제2조 (서비스)\n운동 기록 저장, 목록 조회, 코칭 기능을 제공합니다.\n\n제3조 (의무)\n이용자는 계정 정보를 타인에게 공유하지 않도록 주의해야 합니다.",
      privacyTitle: "개인정보처리방침",
      privacyBody:
        "1. 수집 항목\n이메일, 운동 기록 데이터, 코칭 요청 시 전송되는 기록 요약이 처리될 수 있습니다.\n\n2. 목적\n서비스 제공, 본인 확인, 문의 응대에 사용됩니다.\n\n3. 보관\n계정 삭제 시 또는 관련 법령에 따른 기간까지 보관될 수 있습니다.",
    },
    footer: {
      primaryLine: "운동 기록 + 코치",
      secondaryLine: "",
      links: [
        { label: "약관", href: "/legal/terms" },
        { label: "개인정보", href: "/legal/privacy" },
        { label: "도움말", href: "/help" },
      ],
      copyrightLine: "© {year}",
    },
  },
} satisfies SiteSettingsMerged;
