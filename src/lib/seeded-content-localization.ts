import { t } from "@/lib/translations";
import type {
  AIConversation,
  BookingItem,
  CalendarEventItem,
  ChatMessage,
  ChatRoom,
  CommunityItem,
  DocumentItem,
  FacilityItem,
  FeedItem,
  FriendCard,
  Language,
  PostCategory,
  ProfileHistoryItem,
  UserProfile,
} from "@/lib/types";

type OverrideMap<T extends { id: string }> = Record<string, Partial<T>>;

const zhPostOverrides: OverrideMap<FeedItem> = {
  "sharing-1": {
    title: "雨天學習筆記分享",
    description: "我整理了大廈安全講座的中英雙語筆記，錯過講座的住戶可向我索取電子版本。",
    tags: ["筆記", "社區", "分享"],
  },
  "sharing-2": {
    title: "週末植物照顧輪值",
    description: "今個月有幾位鄰居外遊，想排一個簡單輪值表，幫手為天台香草角澆水。",
    tags: ["植物", "義工"],
  },
  "quest-1": {
    title: "幫忙代取藥房訂單",
    description: "想找附近住戶在今晚 20:00 前到地下藥房代取處方藥。",
    tags: ["跑腿", "緊急"],
  },
  "quest-2": {
    title: "把兩個箱由大堂搬到 B 座",
    description: "我昨天已接下這個搬運請求，仍需在今晚限期前完成。",
    tags: ["搬運", "幫手"],
  },
  "sharing-3": {
    title: "兒童圖書交換書架",
    description: "想在 C 座大堂設置輪流交換書架，讓家庭住戶分享繪本及初階讀物。",
    tags: ["書籍", "家庭", "共享"],
  },
  "second-1": {
    title: "便攜直立風扇",
    description: "放售輕度使用的直立風扇，高度可調，適合小房間或露台角落。",
    tags: ["家居", "電器"],
  },
  "second-2": {
    title: "免費搬屋紙箱",
    description: "有五個結實的搬屋紙箱可於禮賓部附近自取，今晚能來拿者優先。",
    tags: ["免費", "搬屋"],
  },
  "lost-1": {
    title: "平台花園附近走失虎斑貓",
    description: "昨晚 19:00 後，一隻戴綠色頸圈的橙色虎斑貓在平台花園入口附近失蹤。",
    tags: ["寵物", "緊急", "花園"],
  },
  "lost-2": {
    title: "遺失橙色卡套門禁卡",
    description: "我在升降機大堂與巴士站之間遺失了一張放在橙色卡套內的公司門禁卡。",
    tags: ["門卡", "辦公室"],
  },
  "quest-3": {
    title: "把告示板更新翻譯成英文",
    description: "明早前需要協助把一則維修通告翻譯成英文，方便幾位外籍住戶閱讀。",
    tags: ["翻譯", "語言"],
  },
};

const zhCommunityOverrides: OverrideMap<CommunityItem> = {
  "community-1": {
    name: "海濱住戶網絡",
    description: "每月舉辦社交聚會與互助活動，圍繞家庭活動及學習小組。",
    details: [
      "下次聚會包括家庭桌遊夜及小食分享桌。",
      "現正招募活動佈置與攝影義工。",
      "歡迎雙語參與者及新住戶加入。",
    ],
    eventTitle: "桌遊交流夜",
  },
  "community-2": {
    name: "綠步社區會",
    description: "以可持續生活為主題的社群，定期舉辦交換攤、維修工作坊及清潔活動。",
    details: [
      "本月主題為小家電維修咖啡室。",
      "現招募義工帶領首次參與者。",
      "報名後會直接同步到你的日曆。",
    ],
    eventTitle: "維修咖啡室與交換攤",
  },
};

const zhFacilityOverrides: OverrideMap<FacilityItem> = {
  "facility-1": {
    roomName: "107 自修室",
    category: "自習",
    description: "安靜獨立房間，適合專注溫習或小組補習。",
    pricingRule: "每小時 HK$10",
    pricePreview: "2 小時 x HK$10 = HK$20",
  },
  "facility-2": {
    roomName: "游泳池 B 線道",
    category: "休閒",
    description: "適合家庭使用的泳線預約，按參與人數收費。",
    pricingRule: "每位 HK$25",
    pricePreview: "3 位參加者 x HK$25 = HK$75",
  },
  "facility-3": {
    roomName: "兒童遊戲室 A",
    category: "家庭",
    description: "軟墊遊戲室，適合小組活動及家長聚會。",
    pricingRule: "每節 HK$40",
    pricePreview: "每節固定 HK$40",
  },
};

const zhDocumentOverrides: OverrideMap<DocumentItem> = {
  "doc-1": {
    title: "消防安全及疏散守則",
    category: "消防",
    summary: "列明集合地點、防煙門使用、滅火設備存取及住戶、訪客與職員的疏散安排。",
  },
  "doc-2": {
    title: "寧靜時段及噪音管制守則",
    category: "噪音",
    summary: "說明寧靜時段、擴音設備限制、搬動家具要求及重複滋擾的投訴處理方式。",
  },
  "doc-3": {
    title: "私隱、閉路電視及出入記錄通知",
    category: "私隱",
    summary: "列明閉路電視片段、訪客記錄及出入紀錄的保存、查閱及披露安排。",
  },
  "doc-4": {
    title: "訪客登記及大堂保安守則",
    category: "保安",
    summary: "訂明訪客登記、門禁卡使用、包裹領取及防止尾隨進入的要求。",
  },
  "doc-5": {
    title: "裝修時段及承辦商出入規則",
    category: "裝修",
    summary: "涵蓋施工時間、物料運送、升降機保護及裝修按金條件。",
  },
  "doc-6": {
    title: "廢物棄置及回收守則",
    category: "廢物",
    summary: "列明分類回收、大型垃圾預約、垃圾槽限制及走廊棄置垃圾的處理方式。",
  },
  "doc-7": {
    title: "寵物登記及共用空間守則",
    category: "寵物",
    summary: "說明寵物登記、牽繩要求、清潔責任及共享設施的使用限制。",
  },
  "doc-8": {
    title: "公共空間使用及走廊擺放守則",
    category: "公共空間",
    summary: "規範走廊擺放物品、大堂及升降機使用，以及各公共位置的通道安全要求。",
  },
};

const zhFriendBioTranslations: Record<string, string> = {
  "Organizes weekly jogging meetups and dog-friendly walks.": "組織每週慢跑聚會及寵物友善散步活動。",
  "Food enthusiast who keeps track of nearby lunch deals.": "熱愛美食，經常留意附近午市優惠。",
  "Tech support volunteer for elderly residents.": "為長者住戶提供科技支援義工服務。",
  "Buys and sells second-hand photography gear.": "專門買賣二手攝影器材。",
  "Helps organize language exchange evenings in the clubhouse.": "協助籌辦會所語言交流晚上活動。",
  "Often posts quests for errands and community deliveries.": "經常發布跑腿任務及社區配送請求。",
  "Clubhouse basketball regular and marketplace seller.": "常到會所打籃球，也會在市集出售物品。",
};

const zhChatRoomTitleTranslations: Record<string, string> = {
  "Quest coordination": "任務協調",
  "107 Study Room booking": "107 自修室預約",
};

const zhChatPreviewTranslations: Record<string, string> = {
  "Thanks for the clue on the keys.": "多謝你提供鑰匙線索。",
  "Finish (1/2) confirmed by Daisy.": "Daisy 已確認完成進度（1/2）。",
  "Your booking request is pending review.": "你的預約申請正待審核。",
};

const zhChatMessageTranslations: Record<string, string> = {
  "Thanks for the clue on the keys. Could you meet near the lobby at 19:30?": "多謝你提供鑰匙線索。你今晚 19:30 可以在大堂見面嗎？",
  "I saw the orange holder near the parcel lockers around 17:50.": "我在 17:50 左右於包裹儲物櫃附近看到那個橙色卡套。",
  "Carry two boxes from lobby to tower B. Finish progress: 1/2.": "把兩個箱由大堂搬到 B 座。完成進度：1/2。",
  "I am already downstairs. See you by the concierge desk.": "我已經在樓下，禮賓處見。",
  "Your booking request is pending review.": "你的預約申請正待審核。",
};

const zhChatAccentLabelTranslations: Record<string, string> = {
  "Clue shared": "已分享線索",
  "Quest special message": "任務特別訊息",
  "Booking update": "預約更新",
};

const zhBookingTextTranslations: Record<string, string> = {
  "107 Study Room": "107 自修室",
  "Sky Lounge Terrace": "天空酒廊露台",
  "Playroom A": "遊戲室 A",
  "25 Jun 2026 · 13:00 - 15:00": "2026年6月25日 · 13:00 - 15:00",
  "7 Jul 2026 · 13:00 - 20:00": "2026年7月7日 · 13:00 - 20:00",
  "9 Jun 2026 · 18:00 - 20:00": "2026年6月9日 · 18:00 - 20:00",
  "11 Jun 2026 · 16:00 - 17:00": "2026年6月11日 · 16:00 - 17:00",
  "Requested setup exceeds current terrace safety limit for the selected timeslot.": "所需佈置超出所選時段的露台安全人數限制。",
};

const zhCalendarTextTranslations: Record<string, string> = {
  "Study Room Booking": "自修室預約",
  "Revision session for building committee presentation.": "為大廈委員會簡報進行溫習時段。",
  "Board Game Social Night": "桌遊交流夜",
  "Joined event from Harborfront Residents Network.": "已加入海濱住戶網絡舉辦的活動。",
  "Prepare FAQ content": "整理常見問題內容",
  "Personal work session for admin info panel writing.": "為管理資訊面板撰寫內容的個人工作時段。",
  "Birthday lunch booking": "生日午餐預約",
  "Sunrise Cafe Loft booking synced from nearby shops.": "來自附近商店的 Sunrise Cafe Loft 預約已同步。",
};

const zhAiConversationTitleTranslations: Record<string, string> = {
  "Building meeting summary": "大廈會議摘要",
  "Visitor parking rules": "訪客泊車規則",
};

const zhAiMessageTranslations: Record<string, string> = {
  "Summarize the key points from the last building committee meeting.": "請總結上次大廈委員會會議的重點。",
  "The latest committee meeting focused on clubhouse usage policy updates, lift maintenance scheduling, and a phased noise-control notice rewrite.": "最近一次委員會會議主要討論會所使用政策更新、升降機保養安排，以及分階段重寫噪音管制通知。",
  "What are the current visitor parking rules for weekends?": "週末的訪客泊車規則是什麼？",
  "Weekend visitor parking currently requires registration at the concierge desk and is limited to approved time bands based on lot availability.": "目前週末訪客泊車需要先到禮賓處登記，並會按車位供應情況限制在核准時段內使用。",
};

const zhProfileHistoryTitleTranslations: Record<string, string> = {
  "Free moving boxes": "免費搬屋紙箱",
  "Need printer cable urgently": "急需打印機連接線",
};

const zhAvailableSlotTranslations: Record<string, string> = {
  "Mon 19:00 - 21:00": "週一 19:00 - 21:00",
  "Tue 20:00 - 22:00": "週二 20:00 - 22:00",
  "Sat 10:00 - 13:00": "週六 10:00 - 13:00",
  "Sun 14:00 - 18:00": "週日 14:00 - 18:00",
};

const zhUserFieldTranslations: Record<string, string> = {
  "Hong Kong": "香港",
  "Operations Coordinator": "營運統籌",
  "Community-minded resident who likes helping neighbors get things done quickly.": "關心社區、喜歡迅速協助鄰居解決大小事的住戶。",
};

const currentStateKeyMap = {
  employee: "auth.state.employee",
  jobless: "auth.state.jobless",
  student: "auth.state.student",
  worker: "auth.state.worker",
} as const;

const questStateTranslations: Record<NonNullable<FeedItem["questState"]>, { en: string; "zh-HK": string }> = {
  open: { en: "open", "zh-HK": "進行中" },
  accepted: { en: "accepted", "zh-HK": "已接受" },
  dueSoon: { en: "due soon", "zh-HK": "即將到期" },
  overdue: { en: "overdue", "zh-HK": "已逾期" },
  completed: { en: "completed", "zh-HK": "已完成" },
  failed: { en: "failed", "zh-HK": "失敗" },
};

const postCategoryTranslations: Record<PostCategory, { en: string; "zh-HK": string }> = {
  sharing: { en: "Sharing", "zh-HK": "分享" },
  secondHand: { en: "Second-hand", "zh-HK": "二手" },
  lostFound: { en: "Lost and found", "zh-HK": "失物尋回" },
  quest: { en: "Quest", "zh-HK": "任務" },
};

const calendarEventTypeTranslations: Record<CalendarEventItem["type"], { en: string; "zh-HK": string }> = {
  booking: { en: "Booking", "zh-HK": "預約" },
  joined: { en: "Joined", "zh-HK": "已加入" },
  personal: { en: "Personal", "zh-HK": "個人" },
};

const userStatusTranslations: Record<UserProfile["status"], { en: string; "zh-HK": string }> = {
  online: { en: "online", "zh-HK": "在線" },
  offline: { en: "offline", "zh-HK": "離線" },
  busy: { en: "busy", "zh-HK": "忙碌" },
};

function applyOverrides<T extends { id: string }>(language: Language, items: T[], overrides: OverrideMap<T>) {
  if (language !== "zh-HK") {
    return items;
  }

  return items.map((item) => (overrides[item.id] ? { ...item, ...overrides[item.id] } : item));
}

function translateText(language: Language, value: string, translations: Record<string, string>) {
  if (language !== "zh-HK") {
    return value;
  }

  return translations[value] ?? value;
}

function localizeChatMessages(language: Language, messages: ChatMessage[]) {
  if (language !== "zh-HK") {
    return messages;
  }

  return messages.map((message) => ({
    ...message,
    accentLabel: message.accentLabel
      ? translateText(language, message.accentLabel, zhChatAccentLabelTranslations)
      : message.accentLabel,
    content: translateText(language, message.content, zhChatMessageTranslations),
  }));
}

function localizeAiMessages(language: Language, messages: ChatMessage[]) {
  if (language !== "zh-HK") {
    return messages;
  }

  return messages.map((message) => ({
    ...message,
    content: translateText(language, message.content, zhAiMessageTranslations),
  }));
}

export function localizeSeededUserProfile(language: Language, profile: UserProfile) {
  if (language !== "zh-HK") {
    return profile;
  }

  return {
    ...profile,
    country: translateText(language, profile.country, zhUserFieldTranslations),
    jobTitle: profile.jobTitle ? translateText(language, profile.jobTitle, zhUserFieldTranslations) : profile.jobTitle,
    bio: translateText(language, profile.bio, zhUserFieldTranslations),
  };
}

export function localizeAvailableSlots(language: Language, slots: string[]) {
  if (language !== "zh-HK") {
    return slots;
  }

  return slots.map((slot) => zhAvailableSlotTranslations[slot] ?? slot);
}

export function localizeProfileHistory(language: Language, items: ProfileHistoryItem[]) {
  if (language !== "zh-HK") {
    return items;
  }

  return items.map((item) => ({
    ...item,
    title: zhProfileHistoryTitleTranslations[item.title] ?? item.title,
  }));
}

export function localizeAdminMessage(language: Language, message: string) {
  if (language !== "zh-HK") {
    return message;
  }

  return message === t("en", "home.adminMessageContent") ? t("zh-HK", "home.adminMessageContent") : message;
}

const SEEDED_BUILDING_ANNOUNCEMENT_EN =
  "FORM_NOTICE::{\"title\":\"Fire drill notice\",\"timeLabel\":\"24 Jun 2026 · 10:00\",\"description\":\"Building-wide fire drill on 24 Jun 2026 at 10:00. Please use staircases and gather at the podium assembly point.\"}";

const SEEDED_BUILDING_ANNOUNCEMENT_ZH =
  "FORM_NOTICE::{\"title\":\"消防演習通知\",\"timeLabel\":\"2026年6月24日 · 10:00\",\"description\":\"全棟將於 2026年6月24日 10:00 進行消防演習。請使用樓梯並到平台集合點集合。\"}";

export function localizeBuildingAnnouncement(language: Language, message: string) {
  if (language !== "zh-HK") {
    return message;
  }

  return message === SEEDED_BUILDING_ANNOUNCEMENT_EN ? SEEDED_BUILDING_ANNOUNCEMENT_ZH : message;
}

export function localizeFeedItems(language: Language, items: FeedItem[]) {
  return applyOverrides(language, items, zhPostOverrides);
}

export function localizeCommunityItems(language: Language, items: CommunityItem[]) {
  return applyOverrides(language, items, zhCommunityOverrides);
}

export function localizeFacilities(language: Language, items: FacilityItem[]) {
  return applyOverrides(language, items, zhFacilityOverrides);
}

export function localizeDocuments(language: Language, items: DocumentItem[]) {
  return applyOverrides(language, items, zhDocumentOverrides);
}

export function localizeFriendCards(language: Language, items: FriendCard[]) {
  if (language !== "zh-HK") {
    return items;
  }

  return items.map((item) => ({
    ...item,
    bio: translateText(language, item.bio, zhFriendBioTranslations),
  }));
}

export function localizeChatRooms(language: Language, rooms: ChatRoom[]) {
  if (language !== "zh-HK") {
    return rooms;
  }

  return rooms.map((room) => ({
    ...room,
    title: translateText(language, room.title, zhChatRoomTitleTranslations),
    preview: translateText(language, room.preview, zhChatPreviewTranslations),
    messages: localizeChatMessages(language, room.messages),
  }));
}

export function localizeBookings(language: Language, items: BookingItem[]) {
  if (language !== "zh-HK") {
    return items;
  }

  return items.map((item) => ({
    ...item,
    targetName: translateText(language, item.targetName, zhBookingTextTranslations),
    dateLabel: translateText(language, item.dateLabel, zhBookingTextTranslations),
    reason: item.reason ? translateText(language, item.reason, zhBookingTextTranslations) : item.reason,
  }));
}

export function localizeCalendarEvents(language: Language, items: CalendarEventItem[]) {
  if (language !== "zh-HK") {
    return items;
  }

  return items.map((item) => ({
    ...item,
    title: translateText(language, item.title, zhCalendarTextTranslations),
    description: translateText(language, item.description, zhCalendarTextTranslations),
  }));
}

export function localizeAiConversations(language: Language, conversations: AIConversation[]) {
  if (language !== "zh-HK") {
    return conversations;
  }

  return conversations.map((conversation) => ({
    ...conversation,
    title: translateText(language, conversation.title, zhAiConversationTitleTranslations),
    messages: localizeAiMessages(language, conversation.messages),
  }));
}

export function formatPostCategory(language: Language, category: PostCategory) {
  return postCategoryTranslations[category][language];
}

export function formatQuestState(language: Language, questState: FeedItem["questState"]) {
  if (!questState) {
    return "";
  }

  return questStateTranslations[questState][language];
}

export function formatCalendarEventType(language: Language, eventType: CalendarEventItem["type"]) {
  return calendarEventTypeTranslations[eventType][language];
}

export function formatCurrentState(language: Language, currentState: UserProfile["currentState"]) {
  return t(language, currentStateKeyMap[currentState]);
}

export function formatUserStatus(language: Language, status: UserProfile["status"]) {
  return userStatusTranslations[status][language];
}