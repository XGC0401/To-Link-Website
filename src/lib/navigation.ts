import type { CopyKey } from "@/lib/translations";
import type { InfoPanelId } from "@/lib/types";

export type NavigationIcon =
  | "home"
  | "posts"
  | "nearby"
  | "connections"
  | "activities"
  | "building"
  | "settings"
  | "info"
  | "logout"
  | "sharing"
  | "secondHand"
  | "lostFound"
  | "quest"
  | "shop"
  | "community"
  | "message"
  | "friends"
  | "event"
  | "calendar"
  | "booking"
  | "ai"
  | "document";

export interface RouteNavItem {
  kind: "route";
  labelKey: CopyKey;
  href: string;
  icon: NavigationIcon;
}

export interface GroupNavItem {
  kind: "group";
  labelKey: CopyKey;
  icon: NavigationIcon;
  children: RouteNavItem[];
}

export interface ActionNavItem {
  kind: "action";
  labelKey: CopyKey;
  icon: NavigationIcon;
  action:
    | { type: "signOut" }
    | { type: "infoModal"; panelId: InfoPanelId }
    | { type: "infoToast"; message: string };
}

export interface SeparatorNavItem {
  kind: "separator";
}

export type SidebarNavItem =
  | RouteNavItem
  | GroupNavItem
  | ActionNavItem
  | SeparatorNavItem;

export const sidebarNavigation: SidebarNavItem[] = [
  { kind: "route", labelKey: "nav.home", href: "/home", icon: "home" },
  {
    kind: "group",
    labelKey: "nav.posts",
    icon: "posts",
    children: [
      { kind: "route", labelKey: "nav.posts.all", href: "/posts", icon: "posts" },
      {
        kind: "route",
        labelKey: "nav.posts.quests",
        href: "/posts/quests",
        icon: "quest",
      },
      {
        kind: "route",
        labelKey: "nav.posts.sharing",
        href: "/posts/sharing",
        icon: "sharing",
      },
      {
        kind: "route",
        labelKey: "nav.posts.secondHand",
        href: "/posts/second-hand",
        icon: "secondHand",
      },
      {
        kind: "route",
        labelKey: "nav.posts.lostFound",
        href: "/posts/lost-found",
        icon: "lostFound",
      },
    ],
  },
  {
    kind: "group",
    labelKey: "nav.nearby",
    icon: "nearby",
    children: [
      {
        kind: "route",
        labelKey: "nav.nearby.shops",
        href: "/nearby/shops",
        icon: "shop",
      },
      {
        kind: "route",
        labelKey: "nav.nearby.communities",
        href: "/nearby/communities",
        icon: "community",
      },
    ],
  },
  {
    kind: "group",
    labelKey: "nav.connections",
    icon: "connections",
    children: [
      {
        kind: "route",
        labelKey: "nav.connections.messages",
        href: "/connections/messages",
        icon: "message",
      },
      {
        kind: "route",
        labelKey: "nav.connections.friends",
        href: "/connections/friends",
        icon: "friends",
      },
    ],
  },
  {
    kind: "group",
    labelKey: "nav.activities",
    icon: "activities",
    children: [
      {
        kind: "route",
        labelKey: "nav.activities.events",
        href: "/activities/events",
        icon: "event",
      },
      {
        kind: "route",
        labelKey: "nav.activities.calendar",
        href: "/activities/calendar",
        icon: "calendar",
      },
      {
        kind: "route",
        labelKey: "nav.activities.booking",
        href: "/activities/booking-status",
        icon: "booking",
      },
    ],
  },
  {
    kind: "group",
    labelKey: "nav.building",
    icon: "building",
    children: [
      {
        kind: "route",
        labelKey: "nav.building.facilities",
        href: "/building/facilities",
        icon: "building",
      },
      {
        kind: "route",
        labelKey: "nav.building.ai",
        href: "/building/ai-chat",
        icon: "ai",
      },
      {
        kind: "route",
        labelKey: "nav.building.documents",
        href: "/building/documents",
        icon: "document",
      },
    ],
  },
  { kind: "separator" },
  {
    kind: "group",
    labelKey: "nav.settings",
    icon: "settings",
    children: [
      {
        kind: "route",
        labelKey: "nav.settings.website",
        href: "/settings/website",
        icon: "settings",
      },
      {
        kind: "route",
        labelKey: "nav.settings.profile",
        href: "/settings/profile",
        icon: "friends",
      },
      {
        kind: "route",
        labelKey: "nav.settings.userList",
        href: "/settings/user-list",
        icon: "friends",
      },
    ],
  },
];

export const infoNavigation: ActionNavItem[] = [
  {
    kind: "action",
    labelKey: "nav.info.feedback",
    icon: "info",
    action: { type: "infoModal", panelId: "appFeedback" },
  },
  {
    kind: "action",
    labelKey: "nav.info.community",
    icon: "info",
    action: { type: "infoModal", panelId: "communityFeedback" },
  },
  {
    kind: "action",
    labelKey: "nav.info.faq",
    icon: "info",
    action: { type: "infoModal", panelId: "faq" },
  },
  {
    kind: "action",
    labelKey: "nav.info.about",
    icon: "info",
    action: { type: "infoModal", panelId: "aboutUs" },
  },
  {
    kind: "action",
    labelKey: "nav.info.privacy",
    icon: "info",
    action: { type: "infoModal", panelId: "privacyPolicy" },
  },
  {
    kind: "action",
    labelKey: "nav.info.terms",
    icon: "info",
    action: { type: "infoModal", panelId: "termsOfService" },
  },
  {
    kind: "action",
    labelKey: "nav.info.version",
    icon: "info",
    action: { type: "infoToast", message: "To-Link Version 1.0.0" },
  },
  {
    kind: "action",
    labelKey: "nav.signOut",
    icon: "logout",
    action: { type: "signOut" },
  },
];

export function getPageTitle(pathname: string) {
  const orderedRoutes: Array<{ startsWith: string; titleKey: CopyKey }> = [
    { startsWith: "/home", titleKey: "nav.home" },
    { startsWith: "/posts/sharing", titleKey: "nav.posts.sharing" },
    { startsWith: "/posts/second-hand", titleKey: "nav.posts.secondHand" },
    { startsWith: "/posts/lost-found", titleKey: "nav.posts.lostFound" },
    { startsWith: "/posts/quests", titleKey: "nav.posts.quests" },
    { startsWith: "/posts", titleKey: "nav.posts.all" },
    { startsWith: "/nearby/shops", titleKey: "nav.nearby.shops" },
    { startsWith: "/nearby/communities", titleKey: "nav.nearby.communities" },
    { startsWith: "/connections/messages", titleKey: "nav.connections.messages" },
    { startsWith: "/connections/friends", titleKey: "nav.connections.friends" },
    { startsWith: "/activities/events", titleKey: "nav.activities.events" },
    { startsWith: "/activities/calendar", titleKey: "nav.activities.calendar" },
    { startsWith: "/activities/booking-status", titleKey: "nav.activities.booking" },
    { startsWith: "/building/facilities", titleKey: "nav.building.facilities" },
    { startsWith: "/building/ai-chat", titleKey: "nav.building.ai" },
    { startsWith: "/building/documents", titleKey: "nav.building.documents" },
    { startsWith: "/settings/website", titleKey: "nav.settings.website" },
    { startsWith: "/settings/profile", titleKey: "nav.settings.profile" },
  ];

  return orderedRoutes.find((route) => pathname.startsWith(route.startsWith))?.titleKey ?? "nav.home";
}

export function getPageDescription(pathname: string): CopyKey | null {
  const orderedRoutes: Array<{ startsWith: string; descriptionKey: CopyKey }> = [
    { startsWith: "/home", descriptionKey: "home.pageDesc" },
    { startsWith: "/posts", descriptionKey: "posts.pageDesc" },
    { startsWith: "/nearby", descriptionKey: "nearby.pageDesc" },
    { startsWith: "/connections/messages", descriptionKey: "messages.pageDesc" },
    { startsWith: "/connections/friends", descriptionKey: "friends.pageDesc" },
    { startsWith: "/activities/events", descriptionKey: "events.pageDesc" },
    { startsWith: "/activities/calendar", descriptionKey: "calendar.pageDesc" },
    { startsWith: "/activities/booking-status", descriptionKey: "booking.pageDesc" },
    { startsWith: "/building/facilities", descriptionKey: "facilities.pageDesc" },
    { startsWith: "/building/ai-chat", descriptionKey: "ai.pageDesc" },
    { startsWith: "/building/documents", descriptionKey: "documents.pageDesc" },
    { startsWith: "/settings/website", descriptionKey: "settings.description" },
    { startsWith: "/settings/profile", descriptionKey: "profile.description" },
  ];

  return orderedRoutes.find((route) => pathname.startsWith(route.startsWith))?.descriptionKey ?? null;
}