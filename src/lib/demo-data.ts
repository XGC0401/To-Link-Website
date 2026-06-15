import type { Language } from "@/lib/types";
import type {
  Advertisement,
  AIConversation,
  BookingItem,
  CalendarEventItem,
  ChatRoom,
  CommunityItem,
  DocumentItem,
  FacilityItem,
  FAQItem,
  FeedItem,
  FriendCard,
  NotificationItem,
  PlaceItem,
  ProfileHistoryItem,
  UserProfile,
} from "@/lib/types";

export const currentUser: UserProfile = {
  id: "user-1",
  firstName: "Bobby",
  lastName: "Lee",
  name: "Bobby Lee",
  username: "bobby_123",
  email: "bobby@example.com",
  phone: "+852 9123 4567",
  country: "Hong Kong",
  currentState: "employee",
  jobTitle: "Operations Coordinator",
  avatar: "BL",
  bio: "Community-minded resident who likes helping neighbors get things done quickly.",
  role: "resident",
  status: "busy",
};

// Admin account - automatically created and synced to new users
export const adminUser: UserProfile = {
  id: "admin-user",
  firstName: "Admin",
  lastName: "System",
  name: "System Admin",
  username: "admin",
  email: "admin@admin.com",
  phone: "+852 0000 0000",
  country: "Hong Kong",
  currentState: "employee",
  jobTitle: "System Administrator",
  avatar: "SA",
  bio: "System administrator account. Contact for support and issues.",
  role: "admin",
  status: "online",
};

export const notifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Quest reminder",
    description: "Your accepted grocery delivery quest reaches its deadline in 22 hours.",
    level: "critical",
    timeLabel: "2m ago",
    critical: true,
  },
  {
    id: "notif-2",
    title: "Booking accepted",
    description: "Sky Lounge birthday booking was approved for Friday 19:00 to 21:00.",
    level: "success",
    timeLabel: "14m ago",
    critical: true,
  },
  {
    id: "notif-3",
    title: "New message",
    description: "May Chan replied about the lost keys report.",
    level: "info",
    timeLabel: "31m ago",
    critical: false,
  },
];

export const advertisements: Advertisement[] = [
  {
    id: "ad-1",
    title: "Summer courtyard gathering",
    description: "Register early for the rooftop acoustic night and food sharing evening.",
    badge: "Community Event",
  },
  {
    id: "ad-2",
    title: "Residents exclusive gym renewal",
    description: "Save 15% when renewing clubhouse fitness access before Friday.",
    badge: "Limited Offer",
  },
  {
    id: "ad-3",
    title: "Fresh market collaboration",
    description: "Partner stores now offer neighbor bundles for same-day pickup.",
    badge: "Nearby Shops",
  },
];

export const adminMessage =
  "Welcome to the upgraded To-Link experience. Please keep feedback constructive, complete pending quest handovers before midnight, and remember that confirmed bookings now sync directly into your calendar overview.";

export const homeFeed: FeedItem[] = [
  {
    id: "sharing-1",
    category: "sharing",
    title: "Rainy-day study notes to share",
    description:
      "I organized bilingual notes for the building safety seminar and can share digital copies with anyone who missed the session.",
    tags: ["notes", "community", "sharing"],
    authorId: "bobby-lee",
    authorName: "Bobby Lee",
    authorAvatar: "BL",
    createdAt: "2026-06-03T09:20:00+08:00",
    edited: false,
    likes: 18,
    comments: 6,
    owner: true,
  },
  {
    id: "sharing-2",
    category: "sharing",
    title: "Weekend plant care rota",
    description:
      "Putting together a simple rota to water the rooftop herb corner while some neighbors travel this month.",
    tags: ["plants", "volunteer"],
    authorId: "bobby-lee",
    authorName: "Bobby Lee",
    authorAvatar: "BL",
    createdAt: "2026-06-02T16:10:00+08:00",
    edited: true,
    likes: 12,
    comments: 3,
    owner: true,
  },
  {
    id: "quest-1",
    category: "quest",
    title: "Need help picking up pharmacy order",
    description:
      "Looking for someone nearby to collect a prescription from the ground-floor pharmacy before 20:00 today.",
    tags: ["errand", "urgent"],
    authorId: "bobby-lee",
    authorName: "Bobby Lee",
    authorAvatar: "BL",
    createdAt: "2026-06-03T10:00:00+08:00",
    edited: false,
    likes: 0,
    comments: 2,
    owner: true,
    reward: 80,
    expiresAt: "2026-06-03T20:00:00+08:00",
    questState: "open",
    createdByCurrentUser: true,
  },
  {
    id: "quest-2",
    category: "quest",
    title: "Carry two boxes from lobby to tower B",
    description:
      "I accepted this move-in assistance request yesterday and still need to complete it before the evening deadline.",
    tags: ["moving", "help"],
    authorId: "daisy-wong",
    authorName: "Daisy Wong",
    authorAvatar: "DW",
    createdAt: "2026-06-02T18:30:00+08:00",
    edited: false,
    likes: 0,
    comments: 0,
    owner: false,
    reward: 120,
    expiresAt: "2026-06-04T19:00:00+08:00",
    questState: "accepted",
    acceptedByCurrentUser: true,
  },
];

export const faqItems: FAQItem[] = [
  {
    id: "faq-1",
    question: "How do I report a suspicious or inappropriate post?",
    answer:
      "Open the three-dot menu on the post, choose Report User, pick a reason, and submit. Admin review logs the case for warning or ban decisions.",
  },
  {
    id: "faq-2",
    question: "What happens when a quest deadline is close?",
    answer:
      "Quest assignees and owners receive a reminder 24 hours before the deadline, and overdue notices are sent if the task remains unfinished.",
  },
  {
    id: "faq-3",
    question: "Can I hide my own posts while browsing?",
    answer:
      "Yes. Each posts sub-page includes a toggle that switches between your own items and other residents’ items.",
  },
  {
    id: "faq-4",
    question: "Where do deleted posts go?",
    answer:
      "Deleted items move into your Profile Settings history area so your account still keeps an audit trail.",
  },
  {
    id: "faq-5",
    question: "How many files can I upload to a post?",
    answer:
      "Each post supports up to 5 images and 3 videos, with image and video size limits enforced before upload.",
  },
  {
    id: "faq-6",
    question: "Can critical notifications be disabled?",
    answer:
      "No. Critical notices such as quest completion, booking status changes, and system alerts always remain enabled.",
  },
  {
    id: "faq-7",
    question: "How do group chats work?",
    answer:
      "You can create a group chat by adding at least 3 people including yourself from your friends list or username search.",
  },
  {
    id: "faq-8",
    question: "Will booking approvals appear on the calendar?",
    answer:
      "Yes. Accepted bookings are automatically added to the Calendar page and grouped with joined and personal events.",
  },
  {
    id: "faq-9",
    question: "What happens if I block another user?",
    answer:
      "Future interactions are blocked across messages, posts, quests, and requests, while older history remains preserved.",
  },
  {
    id: "faq-10",
    question: "How many AI questions can I ask each day?",
    answer:
      "Each account is limited to 20 AI queries per day, and the AI Chat page shows the remaining quota clearly.",
  },
];

export const aboutUsCopy =
  "To-Link is designed as a refined neighborhood operating system: one place for residents to share resources, request help, coordinate activities, book facilities, discover nearby services, and maintain stronger local trust through clear, respectful interaction design.";

const notificationsZhHK: NotificationItem[] = [
  {
    id: "notif-1",
    title: "任務提醒",
    description: "您已接受的雜貨配送任務將在 22 小時後截止。",
    level: "critical",
    timeLabel: "2分鐘前",
    critical: true,
  },
  {
    id: "notif-2",
    title: "預約已批准",
    description: "天空花園生日派對預約已獲批准，週五 19:00 至 21:00。",
    level: "success",
    timeLabel: "14分鐘前",
    critical: true,
  },
  {
    id: "notif-3",
    title: "新訊息",
    description: "陳小美就失鑰匙報告作出了回覆。",
    level: "info",
    timeLabel: "31分鐘前",
    critical: false,
  },
];

const advertisementsZhHK: Advertisement[] = [
  {
    id: "ad-1",
    title: "夏日庭院聚會",
    description: "盡早報名參加天台原聲音樂夜及食物分享晚會。",
    badge: "社區活動",
  },
  {
    id: "ad-2",
    title: "住戶專屬健身室續費優惠",
    description: "週五前續費會所健身套餐可享 85 折優惠。",
    badge: "限時優惠",
  },
  {
    id: "ad-3",
    title: "新鮮市集合作計劃",
    description: "合作商店現提供鄰里套餐，支援即日自取服務。",
    badge: "附近商店",
  },
];

const faqItemsZhHK: FAQItem[] = [
  {
    id: "faq-1",
    question: "如何舉報可疑或不當帖文？",
    answer:
      "點擊帖文右上角的三點選單，選擇「舉報用戶」，選取原因後提交。管理員審核後將記錄案件，以作警告或封禁處理。",
  },
  {
    id: "faq-2",
    question: "任務截止日期臨近時會發生什麼？",
    answer:
      "任務受讓人及發布者將在截止前 24 小時收到提醒，若任務逾期未完成亦會收到通知。",
  },
  {
    id: "faq-3",
    question: "瀏覽時可以隱藏自己的帖文嗎？",
    answer:
      "可以。每個帖文子頁面設有切換按鈕，可在查看自己的帖文與其他住戶帖文之間切換。",
  },
  {
    id: "faq-4",
    question: "已刪除的帖文去哪裡了？",
    answer:
      "已刪除的帖文會移至個人資料設定的歷史記錄區域，帳戶仍保留完整的操作記錄。",
  },
  {
    id: "faq-5",
    question: "每個帖文可以上載多少檔案？",
    answer:
      "每個帖文最多可上載 5 張圖片及 3 段影片，上載前系統會自動檢查檔案大小限制。",
  },
  {
    id: "faq-6",
    question: "可以停用重要通知嗎？",
    answer:
      "不可以。任務完成、預約狀態變更及系統提示等重要通知將始終保持啟用。",
  },
  {
    id: "faq-7",
    question: "群組對話如何運作？",
    answer:
      "您可以從好友列表或用戶名搜尋中新增至少 3 人（包括自己）以建立群組對話。",
  },
  {
    id: "faq-8",
    question: "預約獲批後會出現在日曆嗎？",
    answer:
      "是的。已接受的預約會自動新增至日曆頁面，並與已參加及個人活動歸類在一起。",
  },
  {
    id: "faq-9",
    question: "封鎖另一位用戶後會發生什麼？",
    answer:
      "未來的訊息、帖文、任務及請求互動均會被封鎖，但舊有歷史記錄仍會保留。",
  },
  {
    id: "faq-10",
    question: "每天可以問多少條 AI 問題？",
    answer:
      "每個帳戶每天限制 20 條 AI 查詢，AI 對話頁面會清楚顯示剩餘次數。",
  },
];

export function getNotifications(language: Language): NotificationItem[] {
  return language === "zh-HK" ? notificationsZhHK : notifications;
}

export function getAdvertisements(language: Language): Advertisement[] {
  return language === "zh-HK" ? advertisementsZhHK : advertisements;
}

export function getFaqItems(language: Language): FAQItem[] {
  return language === "zh-HK" ? faqItemsZhHK : faqItems;
}

export const postFeed: FeedItem[] = [
  ...homeFeed,
  {
    id: "sharing-3",
    category: "sharing",
    title: "Childrens book exchange shelf",
    description:
      "Starting a rotating bookshelf in tower C lobby for families who want to share picture books and beginner readers.",
    tags: ["books", "families", "sharing"],
    authorId: "mabel-chan",
    authorName: "Mabel Chan",
    authorAvatar: "MC",
    createdAt: "2026-06-01T10:00:00+08:00",
    edited: false,
    likes: 26,
    comments: 7,
    owner: false,
  },
  {
    id: "second-1",
    category: "secondHand",
    title: "Portable standing fan",
    description:
      "Selling a lightly used standing fan with adjustable height, ideal for small rooms and balcony corners.",
    tags: ["home", "appliance"],
    authorId: "adrian-mok",
    authorName: "Adrian Mok",
    authorAvatar: "AM",
    createdAt: "2026-06-02T08:00:00+08:00",
    edited: false,
    likes: 2,
    comments: 1,
    owner: false,
    price: 160,
    expiresAt: "2026-06-08T20:00:00+08:00",
  },
  {
    id: "second-2",
    category: "secondHand",
    title: "Free moving boxes",
    description:
      "Five sturdy moving boxes available for pickup near concierge. Free to anyone who can collect tonight.",
    tags: ["free", "moving"],
    authorId: "bobby-lee",
    authorName: "Bobby Lee",
    authorAvatar: "BL",
    createdAt: "2026-06-01T19:40:00+08:00",
    edited: true,
    likes: 4,
    comments: 0,
    owner: true,
    price: 0,
    expiresAt: "2026-06-04T21:00:00+08:00",
  },
  {
    id: "lost-1",
    category: "lostFound",
    title: "Missing tabby cat near podium garden",
    description:
      "Orange tabby wearing a green collar disappeared after 19:00 yesterday near the podium garden entrance.",
    tags: ["pet", "urgent", "garden"],
    authorId: "sonia-ho",
    authorName: "Sonia Ho",
    authorAvatar: "SH",
    createdAt: "2026-06-03T07:45:00+08:00",
    edited: false,
    likes: 0,
    comments: 3,
    owner: false,
    price: 300,
    expiresAt: "2026-06-10T18:00:00+08:00",
  },
  {
    id: "lost-2",
    category: "lostFound",
    title: "Lost access card with orange holder",
    description:
      "I lost an office access card in an orange card holder somewhere between the lift lobby and the bus stop.",
    tags: ["card", "office"],
    authorId: "bobby-lee",
    authorName: "Bobby Lee",
    authorAvatar: "BL",
    createdAt: "2026-06-02T11:15:00+08:00",
    edited: false,
    likes: 0,
    comments: 2,
    owner: true,
    price: 150,
    expiresAt: "2026-06-07T22:00:00+08:00",
  },
  {
    id: "quest-3",
    category: "quest",
    title: "Translate notice board update to English",
    description:
      "Need help translating a maintenance announcement for several expatriate residents before tomorrow morning.",
    tags: ["translation", "language"],
    authorId: "may-chan",
    authorName: "May Chan",
    authorAvatar: "MC",
    createdAt: "2026-06-03T06:30:00+08:00",
    edited: false,
    likes: 0,
    comments: 1,
    owner: false,
    reward: 90,
    expiresAt: "2026-06-04T08:00:00+08:00",
    questState: "dueSoon",
  },
];

export const chatRooms: ChatRoom[] = [
  {
    id: "room-1",
    title: "May Chan",
    members: ["Bobby Lee", "May Chan"],
    preview: "Thanks for the clue on the keys.",
    unreadCount: 2,
    online: true,
    group: false,
    messages: [
      {
        id: "msg-1",
        senderName: "May Chan",
        senderAvatar: "MC",
        kind: "text",
        content: "Thanks for the clue on the keys. Could you meet near the lobby at 19:30?",
        sentAt: "18:24",
        inbound: true,
      },
      {
        id: "msg-2",
        senderName: "Bobby Lee",
        senderAvatar: "BL",
        kind: "clue",
        content: "I saw the orange holder near the parcel lockers around 17:50.",
        sentAt: "18:27",
        inbound: false,
        accentLabel: "Clue shared",
      },
    ],
  },
  {
    id: "room-2",
    title: "Quest coordination",
    members: ["Bobby Lee", "Daisy Wong", "Phil Yeung"],
    preview: "Finish (1/2) confirmed by Daisy.",
    unreadCount: 0,
    online: true,
    group: true,
    messages: [
      {
        id: "msg-3",
        senderName: "System",
        senderAvatar: "TL",
        kind: "questRequest",
        content: "Carry two boxes from lobby to tower B. Finish progress: 1/2.",
        sentAt: "14:05",
        inbound: true,
        accentLabel: "Quest special message",
      },
      {
        id: "msg-4",
        senderName: "Daisy Wong",
        senderAvatar: "DW",
        kind: "text",
        content: "I am already downstairs. See you by the concierge desk.",
        sentAt: "14:08",
        inbound: true,
      },
    ],
  },
  {
    id: "room-3",
    title: "107 Study Room booking",
    members: ["Bobby Lee", "Clubhouse Desk"],
    preview: "Your booking request is pending review.",
    unreadCount: 1,
    online: false,
    group: false,
    messages: [
      {
        id: "msg-5",
        senderName: "Clubhouse Desk",
        senderAvatar: "CD",
        kind: "system",
        content: "Your booking request is pending review.",
        sentAt: "09:15",
        inbound: true,
        accentLabel: "Booking update",
      },
    ],
  },
];

export const friendSuggestions: FriendCard[] = [
  {
    id: "friend-1",
    name: "Bobo Wong",
    username: "bobo_w",
    avatar: "BW",
    bio: "Organizes weekly jogging meetups and dog-friendly walks.",
    status: "online",
  },
  {
    id: "friend-2",
    name: "Lobster Ho",
    username: "lobster",
    avatar: "LH",
    bio: "Food enthusiast who keeps track of nearby lunch deals.",
    status: "offline",
  },
  {
    id: "friend-3",
    name: "Phil Yeung",
    username: "modboom",
    avatar: "PY",
    bio: "Tech support volunteer for elderly residents.",
    status: "busy",
  },
  {
    id: "friend-4",
    name: "Bobby Tang",
    username: "bobbyt",
    avatar: "BT",
    bio: "Buys and sells second-hand photography gear.",
    status: "online",
  },
];

export const friendList: FriendCard[] = [
  {
    id: "friend-5",
    name: "May Chan",
    username: "maychan",
    avatar: "MC",
    bio: "Helps organize language exchange evenings in the clubhouse.",
    status: "online",
  },
  {
    id: "friend-6",
    name: "Daisy Wong",
    username: "daisyw",
    avatar: "DW",
    bio: "Often posts quests for errands and community deliveries.",
    status: "busy",
  },
  {
    id: "friend-7",
    name: "Adrian Mok",
    username: "adrianm",
    avatar: "AM",
    bio: "Clubhouse basketball regular and marketplace seller.",
    status: "offline",
  },
];

export const nearbyShops: PlaceItem[] = [
  {
    id: "shop-1",
    name: "Harbor Fresh Market",
    description: "Local grocer with same-day fruit, pantry, and floral bundles.",
    details: [
      "Resident bundle pickup available from 17:00 to 21:00.",
      "This week: HK$35 fruit cup add-on for any family order.",
      "Booking supported for tasting corner and mini workshops.",
    ],
    phone: "+852 2456 7821",
    website: "https://example.com/harbor-fresh",
    lat: 22.2853,
    lng: 114.1549,
    updatedAt: "2026-06-03T09:00:00+08:00",
  },
  {
    id: "shop-2",
    name: "Sunrise Cafe Loft",
    description: "Casual all-day cafe with private corner booking for small celebrations.",
    details: [
      "Current promotion: buy 4 brunch sets, get dessert platter 50% off.",
      "Updated menu includes vegetarian set and kid-friendly brunch board.",
      "Accepts event bookings up to 25 people.",
    ],
    phone: "+852 2890 1432",
    website: "https://example.com/sunrise-cafe",
    lat: 22.2821,
    lng: 114.1586,
    updatedAt: "2026-06-02T14:00:00+08:00",
  },
  {
    id: "shop-3",
    name: "WellNest Pharmacy",
    description: "Late-closing neighborhood pharmacy and wellness consultation counter.",
    details: [
      "Residents can reserve medicine collection before 22:00.",
      "Free blood pressure checks every Saturday afternoon.",
      "Community wellness notices rotate weekly on the digital screen.",
    ],
    phone: "+852 2788 6543",
    website: "N/A",
    lat: 22.2838,
    lng: 114.1518,
    updatedAt: "2026-06-01T12:20:00+08:00",
  },
];

export const nearbyCommunities: CommunityItem[] = [
  {
    id: "community-1",
    name: "Harborfront Residents Network",
    description: "Monthly social and mutual-help meetups around family activities and learning circles.",
    details: [
      "Next meetup includes a family board-game evening and snack table.",
      "Volunteer sign-up available for event setup and photography.",
      "Group welcomes bilingual participation and new residents.",
    ],
    phone: "+852 6112 4300",
    website: "https://example.com/harborfront-network",
    lat: 22.2868,
    lng: 114.1604,
    updatedAt: "2026-06-03T08:00:00+08:00",
    eventTitle: "Board Game Social Night",
    eventDate: "2026-06-07 18:30",
  },
  {
    id: "community-2",
    name: "Green Steps Community Club",
    description: "Sustainability-focused group hosting swap tables, repair workshops, and cleanups.",
    details: [
      "This month features a repair cafe for small appliances.",
      "Looking for volunteers to guide first-time participants.",
      "Sign-ups add directly into your calendar feed.",
    ],
    phone: "+852 6770 1882",
    website: "N/A",
    lat: 22.2804,
    lng: 114.1564,
    updatedAt: "2026-06-01T16:40:00+08:00",
    eventTitle: "Repair Cafe & Swap Table",
    eventDate: "2026-06-09 15:00",
  },
];

export const bookings: BookingItem[] = [
  {
    id: "booking-1",
    targetName: "107 Study Room",
    organizer: "Bobby Lee",
    participantCount: 3,
    dateLabel: "25 Jun 2026 · 13:00 - 15:00",
    status: "pending",
  },
  {
    id: "booking-2",
    targetName: "Sunrise Cafe Loft",
    organizer: "Bobby Lee",
    participantCount: 12,
    dateLabel: "7 Jul 2026 · 13:00 - 20:00",
    status: "accepted",
  },
  {
    id: "booking-3",
    targetName: "Sky Lounge Terrace",
    organizer: "Mabel Chan",
    participantCount: 18,
    dateLabel: "9 Jun 2026 · 18:00 - 20:00",
    status: "denied",
    reason: "Requested setup exceeds current terrace safety limit for the selected timeslot.",
  },
  {
    id: "booking-4",
    targetName: "Playroom A",
    organizer: "Bobby Lee",
    participantCount: 7,
    dateLabel: "11 Jun 2026 · 16:00 - 17:00",
    status: "canceled",
  },
];

export const calendarEvents: CalendarEventItem[] = [
  {
    id: "event-1",
    title: "Study Room Booking",
    description: "Revision session for building committee presentation.",
    date: "2026-06-25",
    timeLabel: "13:00 - 15:00",
    type: "booking",
  },
  {
    id: "event-2",
    title: "Board Game Social Night",
    description: "Joined event from Harborfront Residents Network.",
    date: "2026-06-07",
    timeLabel: "18:30 - 21:00",
    type: "joined",
  },
  {
    id: "event-3",
    title: "Prepare FAQ content",
    description: "Personal work session for admin info panel writing.",
    date: "2026-06-04",
    timeLabel: "20:00 - 21:00",
    type: "personal",
  },
  {
    id: "event-4",
    title: "Birthday lunch booking",
    description: "Sunrise Cafe Loft booking synced from nearby shops.",
    date: "2026-07-07",
    timeLabel: "13:00 - 20:00",
    type: "booking",
  },
];

export const facilities: FacilityItem[] = [
  {
    id: "facility-1",
    roomName: "107 Study Room",
    category: "Study",
    description: "Quiet enclosed room for focused study or small tutoring groups.",
    pricingRule: "HK$10 per hour",
    pricePreview: "$10 * 2 Hour(s) = $20",
    availability: ["09:00 - 11:00", "13:00 - 15:00", "19:00 - 21:00"],
  },
  {
    id: "facility-2",
    roomName: "Swimming Pool Lane B",
    category: "Leisure",
    description: "Family-friendly pool lane reservation with participant-based pricing.",
    pricingRule: "HK$25 per participant",
    pricePreview: "$25 * 3 People = $75",
    availability: ["08:00 - 09:00", "10:00 - 11:00", "15:00 - 16:00"],
  },
  {
    id: "facility-3",
    roomName: "Child Playroom A",
    category: "Family",
    description: "Soft-play room for small group sessions and parent meetups.",
    pricingRule: "HK$40 per slot",
    pricePreview: "$40 flat slot rate",
    availability: ["11:00 - 12:00", "14:00 - 15:00", "16:00 - 17:00"],
  },
];

export const documents: DocumentItem[] = [
  {
    id: "doc-1",
    title: "Fire Safety and Evacuation Regulations",
    category: "Fire",
    updatedAt: "2026-06-04",
    summary: "Assembly points, smoke-stop doors, extinguisher access, and evacuation conduct for residents, guests, and staff.",
  },
  {
    id: "doc-2",
    title: "Quiet Hours and Noise Control Regulations",
    category: "Noise",
    updatedAt: "2026-06-02",
    summary: "Quiet hours, amplified sound limits, furniture-moving restrictions, and complaint handling for repeated disturbance.",
  },
  {
    id: "doc-3",
    title: "Privacy, CCTV, and Access Log Notice",
    category: "Privacy",
    updatedAt: "2026-05-30",
    summary: "How CCTV footage, visitor records, and access logs are retained, reviewed, and disclosed within the building.",
  },
  {
    id: "doc-4",
    title: "Visitor Registration and Lobby Security Rules",
    category: "Security",
    updatedAt: "2026-05-27",
    summary: "Requirements for guest registration, access cards, parcel release, and tailgating prevention in common entrances.",
  },
  {
    id: "doc-5",
    title: "Renovation Hours and Contractor Access Rules",
    category: "Renovation",
    updatedAt: "2026-05-24",
    summary: "Approved work windows, material delivery limits, lift protection, and deposit conditions for renovation works.",
  },
  {
    id: "doc-6",
    title: "Waste Disposal and Recycling Regulations",
    category: "Waste",
    updatedAt: "2026-05-18",
    summary: "Sorting rules, bulky-item disposal bookings, chute restrictions, and penalties for leaving refuse in corridors.",
  },
  {
    id: "doc-7",
    title: "Pet Registration and Shared Area Etiquette",
    category: "Pets",
    updatedAt: "2026-05-12",
    summary: "Registration expectations, leash requirements, cleaning obligations, and pet access limits in shared facilities.",
  },
  {
    id: "doc-8",
    title: "Common Area Use and Corridor Storage Rules",
    category: "Common Areas",
    updatedAt: "2026-05-08",
    summary: "Rules on leaving items in corridors, use of lobbies and lifts, and safe access through all shared areas.",
  },
];

export const aiConversations: AIConversation[] = [
  {
    id: "ai-1",
    title: "Building meeting summary",
    createdAt: "2026-06-03T09:10:00+08:00",
    messages: [
      {
        id: "ai-msg-1",
        senderName: "Bobby Lee",
        senderAvatar: "BL",
        kind: "text",
        content: "Summarize the key points from the last building committee meeting.",
        sentAt: "09:10",
        inbound: false,
      },
      {
        id: "ai-msg-2",
        senderName: "To-Link AI",
        senderAvatar: "AI",
        kind: "text",
        content: "The latest committee meeting focused on clubhouse usage policy updates, lift maintenance scheduling, and a phased noise-control notice rewrite.",
        sentAt: "09:10",
        inbound: true,
      },
    ],
  },
  {
    id: "ai-2",
    title: "Visitor parking rules",
    createdAt: "2026-06-02T19:15:00+08:00",
    messages: [
      {
        id: "ai-msg-3",
        senderName: "Bobby Lee",
        senderAvatar: "BL",
        kind: "text",
        content: "What are the current visitor parking rules for weekends?",
        sentAt: "19:15",
        inbound: false,
      },
      {
        id: "ai-msg-4",
        senderName: "To-Link AI",
        senderAvatar: "AI",
        kind: "text",
        content: "Weekend visitor parking currently requires registration at the concierge desk and is limited to approved time bands based on lot availability.",
        sentAt: "19:16",
        inbound: true,
      },
    ],
  },
];

export const profileHistory: ProfileHistoryItem[] = [
  {
    id: "history-1",
    title: "Free moving boxes",
    category: "secondHand",
    deletedAt: "2026-05-25T21:15:00+08:00",
  },
  {
    id: "history-2",
    title: "Need printer cable urgently",
    category: "quest",
    deletedAt: "2026-05-21T12:10:00+08:00",
  },
];