import type { Language } from "@/lib/types";

export type CopyKey =
  | "brand"
  | "tagline"
  | "auth.login"
  | "auth.register"
  | "auth.forgot"
  | "auth.reset"
  | "auth.remember"
  | "auth.demoNotice"
  | "nav.home"
  | "nav.posts"
  | "nav.nearby"
  | "nav.connections"
  | "nav.activities"
  | "nav.building"
  | "nav.settings"
  | "nav.info"
  | "nav.signOut"
  | "nav.posts.all"
  | "nav.posts.sharing"
  | "nav.posts.secondHand"
  | "nav.posts.lostFound"
  | "nav.posts.quests"
  | "nav.nearby.shops"
  | "nav.nearby.communities"
  | "nav.connections.messages"
  | "nav.connections.friends"
  | "nav.activities.events"
  | "nav.activities.calendar"
  | "nav.activities.booking"
  | "nav.building.facilities"
  | "nav.building.ai"
  | "nav.building.documents"
  | "nav.settings.website"
  | "nav.settings.profile"
  | "nav.info.feedback"
  | "nav.info.community"
  | "nav.info.faq"
  | "nav.info.help"
  | "nav.info.about"
  | "nav.info.privacy"
  | "nav.info.terms"
  | "nav.info.version"
  | "control.fontSize"
  | "control.language"
  | "control.notifications"
  | "control.lightDark"
  | "weather.loading"
  | "weather.unavailable"
  | "weather.today"
  | "weather.wind"
  | "weather.rainfall"
  | "page.home"
  | "page.welcome"
  | "page.adminMessage"
  | "page.recentSharing"
  | "page.yourQuests"
  | "page.acceptedQuests";

const copy: Record<Language, Record<CopyKey, string>> = {
  en: {
    brand: "To-Link",
    tagline: "Neighborhood life, connected with care.",
    "auth.login": "Sign in",
    "auth.register": "Create account",
    "auth.forgot": "Forgot or change password",
    "auth.reset": "Reset password",
    "auth.remember": "Remember me",
    "auth.demoNotice": "Email sign-in, registration, and password reset are live when Firebase is configured.",
    "nav.home": "Home",
    "nav.posts": "Posts",
    "nav.nearby": "Nearby",
    "nav.connections": "Connections",
    "nav.activities": "Activities",
    "nav.building": "Building",
    "nav.settings": "Settings",
    "nav.info": "Info",
    "nav.signOut": "Sign Out",
    "nav.posts.all": "All",
    "nav.posts.sharing": "Sharing",
    "nav.posts.secondHand": "2nd Hand",
    "nav.posts.lostFound": "Lost & Find",
    "nav.posts.quests": "Quests",
    "nav.nearby.shops": "Nearby Shops",
    "nav.nearby.communities": "Nearby Communities",
    "nav.connections.messages": "Messages",
    "nav.connections.friends": "Friends",
    "nav.activities.events": "Events",
    "nav.activities.calendar": "Calendar",
    "nav.activities.booking": "Booking Status",
    "nav.building.facilities": "Facilities",
    "nav.building.ai": "AI Chat",
    "nav.building.documents": "Documents",
    "nav.settings.website": "Website Settings",
    "nav.settings.profile": "Profile Settings",
    "nav.info.feedback": "App Feedback",
    "nav.info.community": "Community Feedback",
    "nav.info.faq": "FAQ",
    "nav.info.help": "Help Center",
    "nav.info.about": "About Us",
    "nav.info.privacy": "Privacy Policy",
    "nav.info.terms": "Terms of Service",
    "nav.info.version": "Version v1.0.0",
    "control.fontSize": "Font Size",
    "control.language": "Language",
    "control.notifications": "Notifications",
    "control.lightDark": "Light / Dark",
    "weather.loading": "Loading live weather",
    "weather.unavailable": "Weather unavailable",
    "weather.today": "Today Weather",
    "weather.wind": "Wind",
    "weather.rainfall": "Rainfall",
    "page.home": "Home overview",
    "page.welcome": "Welcome back",
    "page.adminMessage": "Admin message",
    "page.recentSharing": "Recent Sharing",
    "page.yourQuests": "Your Quests",
    "page.acceptedQuests": "Accepted Quest",
  },
  "zh-HK": {
    brand: "To-Link",
    tagline: "連結鄰里生活，細緻而可靠。",
    "auth.login": "登入",
    "auth.register": "建立帳戶",
    "auth.forgot": "忘記或更改密碼",
    "auth.reset": "重設密碼",
    "auth.remember": "記住我",
    "auth.demoNotice": "如已設定 Firebase，電郵登入、註冊及重設密碼已可使用。",
    "nav.home": "主頁",
    "nav.posts": "帖子",
    "nav.nearby": "附近",
    "nav.connections": "連結",
    "nav.activities": "活動",
    "nav.building": "大廈",
    "nav.settings": "設定",
    "nav.info": "資訊",
    "nav.signOut": "登出",
    "nav.posts.all": "全部",
    "nav.posts.sharing": "分享",
    "nav.posts.secondHand": "二手",
    "nav.posts.lostFound": "失物尋回",
    "nav.posts.quests": "任務",
    "nav.nearby.shops": "附近商店",
    "nav.nearby.communities": "附近社區",
    "nav.connections.messages": "訊息",
    "nav.connections.friends": "朋友",
    "nav.activities.events": "活動",
    "nav.activities.calendar": "日曆",
    "nav.activities.booking": "預約狀態",
    "nav.building.facilities": "會所設施",
    "nav.building.ai": "AI 對話",
    "nav.building.documents": "文件",
    "nav.settings.website": "網站設定",
    "nav.settings.profile": "個人設定",
    "nav.info.feedback": "應用程式回饋",
    "nav.info.community": "社區回饋",
    "nav.info.faq": "常見問題",
    "nav.info.help": "幫助中心",
    "nav.info.about": "關於我們",
    "nav.info.privacy": "私隱政策",
    "nav.info.terms": "服務條款",
    "nav.info.version": "版本 v1.0.0",
    "control.fontSize": "字體大小",
    "control.language": "語言",
    "control.notifications": "通知",
    "control.lightDark": "明亮 / 深色",
    "weather.loading": "正在載入即時天氣",
    "weather.unavailable": "未能取得天氣資料",
    "weather.today": "今日天氣",
    "weather.wind": "風速",
    "weather.rainfall": "雨量",
    "page.home": "主頁總覽",
    "page.welcome": "歡迎回來",
    "page.adminMessage": "管理員訊息",
    "page.recentSharing": "最近分享",
    "page.yourQuests": "你的任務",
    "page.acceptedQuests": "已接受任務",
  },
};

export function t(language: Language, key: CopyKey) {
  return copy[language][key] ?? copy.en[key];
}