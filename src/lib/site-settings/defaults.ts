import type { SiteSettingsMerged } from "@/types/site-settings";
import { defaultProgramGuideBase } from "@/lib/site-settings/program-defaults";

const DEFAULT_PROGRAM: SiteSettingsMerged["program"] = {
  navLabel: "프로그램",
  promoLinkLabel: "루틴·용어 정리",
  pageEyebrow: "가이드",
  pageTitle: "운동 프로그램 개요",
  pageLead:
    "벌크·컷 할 때 자주 나오는 말만 골라 넣었어요. 아프거나 병력이 있으면 병원 말이 먼저예요.",
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
    appDescription: "세트는 계정에 붙어서 저장되고, 코칭은 그걸 보고 짧게 적어 줘요.",
    loginPanel: {
      eyebrow: "JWS",
      title: "기록이 쌓이면 패턴이 보여요",
      description: "폰이 바뀌어도 같은 계정이면 그대로예요. 홈에서 입력하고 아래로 내려가면 목록이랑 코칭이 이어져요.",
    },
    loginCard: {
      eyebrow: "Welcome",
      title: "다시 왔네요",
      subtitle: "이메일이랑 비밀번호 넣고 들어가면 돼요.",
    },
    loginForm: {
      emailLabel: "이메일",
      passwordLabel: "비밀번호",
      submitLabel: "로그인",
      submittingLabel: "잠깐만요…",
      noAccountPrompt: "아직 없어요?",
      signupLinkLabel: "가입하고 시작하기",
    },
    signupPanel: {
      eyebrow: "JWS",
      title: "운동 일기장 하나 만들기",
      description: "세트만 몇 번 저장해도 목록이랑 코멘트가 같이 쌓여요. 적을 건 별로 없어요.",
    },
    signupCard: {
      eyebrow: "Join",
      title: "회원가입",
      subtitle: "인증 메일은 스팸함·프로모션함도 한번 봐 주세요.",
    },
    mainHero: {
      eyebrow: "Today",
      titleLine1: "오늘 세트만 남기고",
      titleLine2: "내일은 오늘보다 편하게",
      subtitle: "저장하면 알아서 올라가요. 입력·목록·코칭 다 이 페이지에 있어요.",
    },
    mainNavSectionLabels: ["기록 넣기", "지난 기록", "코칭"],
    mainDashTileCaptions: ["기록 넣기", "전체 기록", "코칭 보기"],
    webCoachingEyebrow: "Coaching",
    webCoachingTitle: "코칭 한 줄",
    webCoachingHint:
      "저장해 둔 운동을 보고 짧게 코멘트를 붙여요. OpenAI 쓰려면 서버에 API 키랑 COACHING_USE_OPENAI가 있어야 하고, COACHING_CONTENT_URL 넣으면 그 페이지 글도 같이 읽어요.",
    webCoachingButtonLabel: "코멘트 받기",
    listEmptyTitle: "아직 기록이 없어요",
    listEmptySubtitle: "한 줄만 넣어도 여기가 금방 차요.",
    workoutForm: {
      eyebrow: "New",
      title: "오늘 세트",
      subtitle: "적을 건 이것뿐이에요. 저장하면 바로 아래 목록에 붙어요.",
      exerciseLabel: "운동 이름",
      exercisePlaceholder: "예: 벤치 (줄여도 됨)",
      weightLabel: "중량 (kg)",
      repsLabel: "횟수",
      setsLabel: "세트",
      outcomeGroupLabel: "이번 세트",
      outcomeAriaLabel: "잘했는지 여부",
      successLabel: "잘함",
      failLabel: "아쉬움",
      saveButtonLabel: "저장",
      savingButtonLabel: "저장 중…",
      savedToast: "올렸어요.",
    },
    coachingHistoryTitle: "최근 코칭",
    helpCenter: {
      pageTitle: "도움말",
      intro: "기록 넣기 → 목록 보기 → 코칭 순서만 알면 돼요. 아래 FAQ만 봐도 대부분 나와요.",
      contactLine: "더 물어볼 건 운영 메일로 보내 주세요.",
      faqSectionTitle: "자주 묻는 질문",
      faqItems: [
        {
          question: "기록은 어디에 저장되나요?",
          answer:
            "로그인한 계정에 묶여서 Supabase에 올라가요. 다른 폰·PC에서 같은 계정으로 보면 그대로예요.",
        },
        {
          question: "코칭은 어떻게 돌아가요?",
          answer:
            "저장된 운동을 서버가 읽고 짧게 정리해요. OpenAI 쓰려면 관리자가 API 키를 넣어 둬야 해요.",
        },
        {
          question: "비밀번호를 잊었습니다.",
          answer: "설정에서 재설정 메일 받거나, 로그인 화면에 비밀번호 찾기 있으면 그걸 쓰면 돼요.",
        },
        {
          question: "기록을 지울 수 있나요?",
          answer: "목록에서 하나씩 지울 수 있고, 홈에서 전부 지우기도 돼요. 전부 지우기는 돌이킬 수 없어서 신중히 눌러 주세요.",
        },
      ],
    },
    legalPages: {
      termsTitle: "이용약관",
      termsBody:
        "제1조 (목적)\n이 약관은 이 서비스 쓸 때 지켜야 할 기본만 적어 둔 거예요.\n\n제2조 (서비스)\n운동 기록 저장, 목록 보기, 코칭 같은 기능을 제공해요.\n\n제3조 (이용자의 의무)\n계정은 본인만 쓰고, 남이랑 같이 쓰지 말아 주세요.",
      privacyTitle: "개인정보처리방침",
      privacyBody:
        "1. 수집 항목\n이메일, 운동 기록, 코칭 요청 때 같이 올라가는 요약이 있을 수 있어요.\n\n2. 이용 목적\n서비스 돌리고, 본인 확인하고, 문의 답하는 데 써요.\n\n3. 보관\n계정 지우거나 법에서 정한 기간이 지나면 정리돼요.",
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
      workout: "운동",
      performance: "성과",
      help: "도움말",
      settings: "설정",
    },
  },
} satisfies SiteSettingsMerged;
