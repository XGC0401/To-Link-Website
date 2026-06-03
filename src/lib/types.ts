export type Language = "en" | "zh-HK";

export type ThemeMode = "light" | "dark";

export type FontScale = "s" | "m" | "b" | "l";

export type InfoPanelId =
  | "appFeedback"
  | "communityFeedback"
  | "faq"
  | "aboutUs";

export type NotificationLevel = "critical" | "info" | "success" | "warning";

export type PostCategory = "sharing" | "secondHand" | "lostFound" | "quest";

export type QuestState =
  | "open"
  | "accepted"
  | "dueSoon"
  | "overdue"
  | "completed"
  | "failed";

export type BookingStatus = "pending" | "accepted" | "denied" | "canceled";

export type CalendarEventType = "booking" | "joined" | "personal";

export type MessageKind = "text" | "questRequest" | "tradeIntent" | "clue" | "system";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  currentState: "worker" | "employee" | "jobless" | "student";
  jobTitle?: string;
  avatar: string;
  bio: string;
  role: "admin" | "resident";
  status: "online" | "offline" | "busy";
  points: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  level: NotificationLevel;
  timeLabel: string;
  critical: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  badge: string;
}

export interface FeedItem {
  id: string;
  category: PostCategory;
  title: string;
  description: string;
  tags: string[];
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  edited: boolean;
  likes: number;
  comments: number;
  owner: boolean;
  price?: number;
  reward?: number;
  expiresAt?: string;
  questState?: QuestState;
  acceptedByCurrentUser?: boolean;
  createdByCurrentUser?: boolean;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  kind: MessageKind;
  content: string;
  sentAt: string;
  inbound: boolean;
  accentLabel?: string;
}

export interface ChatRoom {
  id: string;
  title: string;
  members: string[];
  preview: string;
  unreadCount: number;
  online: boolean;
  group: boolean;
  messages: ChatMessage[];
}

export interface FriendCard {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  status: "online" | "offline" | "busy";
}

export interface PlaceItem {
  id: string;
  name: string;
  description: string;
  details: string[];
  phone: string;
  website: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface CommunityItem extends PlaceItem {
  eventTitle: string;
  eventDate: string;
}

export interface BookingItem {
  id: string;
  targetName: string;
  organizer: string;
  participantCount: number;
  dateLabel: string;
  status: BookingStatus;
  reason?: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  timeLabel: string;
  type: CalendarEventType;
}

export interface FacilityItem {
  id: string;
  roomName: string;
  category: string;
  description: string;
  pricingRule: string;
  pricePreview: string;
  availability: string[];
}

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  updatedAt: string;
  summary: string;
}

export interface AIConversation {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface ProfileHistoryItem {
  id: string;
  title: string;
  category: PostCategory;
  deletedAt: string;
}