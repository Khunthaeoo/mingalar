/**
 * MingalarMate — Trilingual Localization Engine (i18n)
 * Supports English (en), Burmese (my - မြန်မာဘာသာ), and Traditional Chinese (zh - 繁體中文).
 */

const I18N_TRANSLATIONS = {
  en: {
    // Navigation & Global
    nav_home: "Home",
    nav_info_center: "Info Center",
    nav_forum: "Community Forum",
    nav_events: "Campus Events",
    nav_study: "Study in Taiwan",
    nav_living: "Living in Taiwan",
    nav_jobs: "Part-time Jobs",
    nav_about: "About",
    nav_admin: "Admin Console",
    nav_sign_in: "Sign In",
    nav_sign_out: "Sign Out",
    sidebar_title: "Navigation Menu",
    sidebar_student_portal: "International Student Hub",

    // Hero & Home
    hero_badge: "Independent Student Guide",
    hero_title: "Your friendly companion for studying & living in Taiwan",
    hero_lead: "MingalarMate brings together beginner-friendly, carefully researched guidance for Myanmar students and international scholars embarking on their educational journey in Taiwan.",
    btn_start_study: "Explore Study Guide",
    btn_explore_life: "Explore Daily Life",
    btn_info_center: "Browse Info Center",
    btn_ask_ai: "Ask AI Assistant",

    // AI Chat
    ai_launcher: "Ask AI Mate",
    ai_title: "MingalarMate AI",
    ai_subtitle: "Multilingual Verified RAG Assistant",
    ai_placeholder: "Ask in English, မြန်မာ, or 中文...",
    ai_verified_sources: "Verified Sources",

    // Common
    last_reviewed: "Last reviewed: November 2026",
    search_placeholder: "Search guides, articles or rules...",
    read_more: "Read Full Guide"
  },

  my: {
    // Navigation & Global
    nav_home: "ပင်မစာမျက်နှာ",
    nav_info_center: "သတင်းအချက်အလက်ဗဟို",
    nav_forum: "ကျောင်းသားစကားဝိုင်း",
    nav_events: "ကျောင်းတွင်းပွဲများ",
    nav_study: "ထိုင်ဝမ်တွင်ပညာသင်ကြားခြင်း",
    nav_living: "ထိုင်ဝမ်တွင်နေထိုင်မှုဘဝ",
    nav_jobs: "အချိန်ပိုင်းအလုပ်များ",
    nav_about: "အကြောင်းအရာ",
    nav_admin: "စီမံခန့်ခွဲမှုစနစ်",
    nav_sign_in: "အကောင့်ဝင်ရန်",
    nav_sign_out: "အကောင့်ထွက်ရန်",
    sidebar_title: "လမ်းညွှန်မီနူး",
    sidebar_student_portal: "နိုင်ငံတကာကျောင်းသားဗဟို",

    // Hero & Home
    hero_badge: "လွတ်လပ်သော ကျောင်းသားလမ်းညွှန်",
    hero_title: "ထိုင်ဝမ်တွင် ပညာသင်ကြားရန်နှင့် နေထိုင်ရန် သင့်မိတ်ဆွေကောင်း",
    hero_lead: "MingalarMate သည် ထိုင်ဝမ်သို့ ရောက်ရှိလာသော မြန်မာကျောင်းသားများနှင့် နိုင်ငံတကာပညာတော်သင်များအတွက် စနစ်တကျ ပြုစုထားသော လက်တွေ့အချက်အလက်များကို ဖော်ပြပေးပါသည်။",
    btn_start_study: "ပညာသင်ကြားရေးလမ်းညွှန်",
    btn_explore_life: "နေ့စဉ်လူနေမှုဘဝ",
    btn_info_center: "အချက်အလက်များရှာဖွေရန်",
    btn_ask_ai: "AI အကူကိုမေးမြန်းရန်",

    // AI Chat
    ai_launcher: "AI အကူကိုမေးပါ",
    ai_title: "MingalarMate AI ဉာဏ်ရည်တု",
    ai_subtitle: "ဘာသာစကားစုံ တရားဝင်အချက်အလက် အကူအညီ",
    ai_placeholder: "မေးခွန်းကို မြန်မာလို မေးမြန်းပါ...",
    ai_verified_sources: "ကိုးကားထားသော တရားဝင်ရင်းမြစ်များ",

    // Common
    last_reviewed: "နောက်ဆုံးစစ်ဆေးပြီးသည့်ရက်စွဲ - နိုဝင်ဘာ ၂၀၂၆",
    search_placeholder: "လမ်းညွှန်များနှင့် စည်းမျဉ်းများကို ရှာဖွေပါ...",
    read_more: "အပြည့်အစုံဖတ်ရှုရန်"
  },

  zh: {
    // Navigation & Global
    nav_home: "首頁",
    nav_info_center: "資訊中心",
    nav_forum: "學生交流論壇",
    nav_events: "校園與文化活動",
    nav_study: "留學台灣",
    nav_living: "生活在台灣",
    nav_jobs: "工讀與打工",
    nav_about: "關於我們",
    nav_admin: "管理後台",
    nav_sign_in: "登入系統",
    nav_sign_out: "登出",
    sidebar_title: "導覽選單",
    sidebar_student_portal: "國際學生整合支援平台",

    // Hero & Home
    hero_badge: "獨立學生資訊指南",
    hero_title: "留學與生活在台灣的貼心夥伴",
    hero_lead: "MingalarMate 為初到台灣的緬甸籍及國際留學生整合清晰、可靠且具官方來源的留學與生活實用資訊。",
    btn_start_study: "瀏覽留學指南",
    btn_explore_life: "探索在台生活",
    btn_info_center: "進入資訊中心",
    btn_ask_ai: "諮詢 AI 助理",

    // AI Chat
    ai_launcher: "詢問 AI 助理",
    ai_title: "MingalarMate 智慧助理",
    ai_subtitle: "多語言檢索增強 (RAG) 官方資訊諮詢",
    ai_placeholder: "以繁體中文、英文或緬文提問...",
    ai_verified_sources: "檢索參考來源",

    // Common
    last_reviewed: "最後檢視日期：2026年11月",
    search_placeholder: "搜尋文章、法規或生活指引...",
    read_more: "閱讀完整內容"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = this.getInitialLanguage();
    this.init();
  }

  getInitialLanguage() {
    const saved = localStorage.getItem('mingalarmate_lang');
    if (saved && ['en', 'my', 'zh'].includes(saved)) {
      return saved;
    }
    return 'en';
  }

  setLanguage(lang) {
    if (!['en', 'my', 'zh'].includes(lang)) return;
    this.currentLang = lang;
    localStorage.setItem('mingalarmate_lang', lang);
    this.applyTranslations();

    // Sync with authManager if present
    if (window.authManager && window.authManager.isAuthenticated()) {
      window.authManager.updateLanguage(lang);
    }

    // Sync with AI chat widget if present
    if (window.aiChatWidget) {
      window.aiChatWidget.currentLanguage = lang;
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('mingalarmate:languageChanged', { detail: { language: lang } }));
  }

  t(key) {
    const dict = I18N_TRANSLATIONS[this.currentLang] || I18N_TRANSLATIONS['en'];
    return dict[key] || I18N_TRANSLATIONS['en'][key] || key;
  }

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // Update html lang attribute
    document.documentElement.lang = this.currentLang === 'zh' ? 'zh-TW' : (this.currentLang === 'my' ? 'my' : 'en');
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.applyTranslations();
    });
  }
}

// Global initialization
window.i18n = new I18nManager();
