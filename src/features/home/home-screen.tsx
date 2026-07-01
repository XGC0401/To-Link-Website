"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  MessagesSquare,
  Thermometer,
  type LucideIcon,
  SunMedium,
  Wind,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Modal } from "@/components/ui/modal";
import { openPersistedDirectChat, usePersistedCurrentUserProfile, usePersistedPosts, usePersistedSharedContent, savePersistedAdvertisements, savePersistedAdminAnnouncement, savePersistedBuildingAnnouncement } from "@/hooks/use-persisted-app-data";
import { formatAppDateTime, formatAppDayLabel } from "@/lib/date";
import { uploadFilesToCloudinary, validateMediaSelection } from "@/lib/media-upload";
import { parseBuildingAnnouncement, serializeFormBuildingAnnouncement, serializeImageBuildingAnnouncement, type BuildingAnnouncementMode } from "@/lib/building-announcement";
import { t } from "@/lib/translations";
import type { FeedItem, Language, Advertisement } from "@/lib/types";
import { cn, truncate } from "@/lib/utils";
import { useToLink } from "@/lib/app-state";
import { useWeather } from "@/hooks/use-weather";

type BuildingNoticeMode = "form" | "image";

function getWeatherVisual(code: number) {
  if (code === 0 || code === 1) {
    return {
      icon: SunMedium,
      className: "bg-amber-100 text-amber-600",
    };
  }

  if (code === 2) {
    return {
      icon: CloudSun,
      className: "bg-sky-100 text-sky-600",
    };
  }

  if (code === 3) {
    return {
      icon: Cloud,
      className: "bg-slate-100 text-slate-600",
    };
  }

  if (code === 45 || code === 48) {
    return {
      icon: CloudFog,
      className: "bg-slate-100 text-slate-500",
    };
  }

  if (code === 51 || code === 53) {
    return {
      icon: CloudDrizzle,
      className: "bg-cyan-100 text-cyan-600",
    };
  }

  if (code === 61 || code === 63 || code === 65 || code === 80) {
    return {
      icon: CloudRain,
      className: "bg-blue-100 text-blue-600",
    };
  }

  if (code === 71) {
    return {
      icon: CloudSnow,
      className: "bg-sky-100 text-sky-500",
    };
  }

  if (code === 95) {
    return {
      icon: CloudLightning,
      className: "bg-violet-100 text-violet-600",
    };
  }

  return {
    icon: CloudSun,
    className: "bg-accent-soft text-accent-strong",
  };
}

export function HomeScreen() {
  const router = useRouter();
  const { language } = useToLink();
  const weather = useWeather(language);
  const sharedContent = usePersistedSharedContent();
  const posts = usePersistedPosts();
  const { profile } = usePersistedCurrentUserProfile();
  const [activeAd, setActiveAd] = useState(0);
  const [currentTimeLabel, setCurrentTimeLabel] = useState("");
  const [editAnnouncementOpen, setEditAnnouncementOpen] = useState(false);
  const [editBuildingAnnouncementMode, setEditBuildingAnnouncementMode] = useState<BuildingAnnouncementMode>("form");
  const [editBuildingAnnouncementTitle, setEditBuildingAnnouncementTitle] = useState("");
  const [editBuildingAnnouncementTimeLabel, setEditBuildingAnnouncementTimeLabel] = useState("");
  const [editBuildingAnnouncementDescription, setEditBuildingAnnouncementDescription] = useState("");
  const [editBuildingAnnouncementImageFile, setEditBuildingAnnouncementImageFile] = useState<File | null>(null);
  const [editBuildingAnnouncementImagePreview, setEditBuildingAnnouncementImagePreview] = useState("");
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [editAdsOpen, setEditAdsOpen] = useState(false);
  const [adsDraft, setAdsDraft] = useState<Advertisement[]>([]);
  const [savingAds, setSavingAds] = useState(false);
  const [editAdminMessageOpen, setEditAdminMessageOpen] = useState(false);
  const [adminMessageDraft, setAdminMessageDraft] = useState("");
  const [savingAdminMessage, setSavingAdminMessage] = useState(false);
  const advertisements = sharedContent.advertisementsByLanguage[language] ?? [];
  const parsedBuildingAnnouncement = useMemo(
    () => parseBuildingAnnouncement(sharedContent.buildingAnnouncement || ""),
    [sharedContent.buildingAnnouncement],
  );
  const activeAdvertisement = advertisements[activeAd] ?? advertisements[0];
  const isAdmin = profile.role === "admin";
  const canEditBuildingNotice =
    isAdmin && profile.email.toLowerCase() === "admin@admin.com";

  useEffect(() => {
    const updateCurrentTimeLabel = () => {
      setCurrentTimeLabel(
        formatAppDateTime(new Date(), language, {
          month: "long",
          weekday: "long",
        }),
      );
    };

    updateCurrentTimeLabel();

    const timer = window.setInterval(updateCurrentTimeLabel, 60_000);

    return () => window.clearInterval(timer);
  }, [language]);

  const recentSharing = useMemo(
    () => posts.items.filter((item) => item.category === "sharing").slice(0, 5),
    [posts.items],
  );
  const ownQuests = useMemo(
    () => posts.items.filter((item) => item.category === "quest" && item.createdByCurrentUser),
    [posts.items],
  );
  const acceptedQuests = useMemo(
    () => posts.items.filter((item) => item.category === "quest" && item.acceptedByCurrentUser),
    [posts.items],
  );

  const currentWeatherLabel = weather.current
    ? weather.describeWeather(weather.current.weatherCode)
    : weather.status === "error"
      ? t(language, "weather.unavailable")
      : t(language, "weather.loading");

  const currentWeatherCode = weather.current?.weatherCode ?? -1;

  function openPostFromHome(item: FeedItem) {
    const targetRoute = item.category === "quest" ? "/posts/quests" : "/posts/sharing";
    router.push(`${targetRoute}?item=${encodeURIComponent(item.id)}`);
  }

  async function openRequesterConversation(item: FeedItem) {
    const roomId = await openPersistedDirectChat({
      members: [profile.name, item.authorName],
      title: item.authorName,
    });

    if (!roomId) {
      toast.error(language === "zh-HK" ? "暫時無法開啟對話。" : "Unable to open the conversation right now.");
      return;
    }

    router.push(`/connections/messages?room=${encodeURIComponent(roomId)}`);
  }

  async function handleSaveAnnouncement() {
    setSavingAnnouncement(true);
    try {
      if (!canEditBuildingNotice) {
        toast.error(language === "zh-HK" ? "只有 admin@admin.com 可編輯大廈通告。" : "Only admin@admin.com can edit the building announcement.");
        return;
      }

      let payload = "";

      if (editBuildingAnnouncementMode === "form") {
        if (!editBuildingAnnouncementTitle.trim() || !editBuildingAnnouncementTimeLabel.trim() || !editBuildingAnnouncementDescription.trim()) {
          toast.error(
            language === "zh-HK"
              ? "請填寫完整的大廈通告標題、時間及內容。"
              : "Please complete title, time label, and description.",
          );
          return;
        }

        payload = serializeFormBuildingAnnouncement({
          description: editBuildingAnnouncementDescription.trim(),
          timeLabel: editBuildingAnnouncementTimeLabel.trim(),
          title: editBuildingAnnouncementTitle.trim(),
        });
      } else {
        let imageUrl = editBuildingAnnouncementImagePreview.trim();

        if (editBuildingAnnouncementImageFile) {
          const [upload] = await uploadFilesToCloudinary([editBuildingAnnouncementImageFile]);
          imageUrl = upload?.secureUrl ?? "";
        }

        if (!imageUrl) {
          toast.error(language === "zh-HK" ? "請先上載大廈通告圖片。" : "Please upload a building announcement image first.");
          return;
        }

        payload = serializeImageBuildingAnnouncement(imageUrl);
      }

      await savePersistedBuildingAnnouncement(payload);
      setEditAnnouncementOpen(false);
      toast.success(language === "zh-HK" ? "大廈通告已更新" : "Building announcement updated");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : language === "zh-HK"
            ? "無法保存大廈通告"
            : "Unable to save the building announcement",
      );
    } finally {
      setSavingAnnouncement(false);
    }
  }

  function openEditAnnouncement() {
    const parsed = parsedBuildingAnnouncement;

    if (parsed.mode === "image") {
      setEditBuildingAnnouncementMode("image");
      setEditBuildingAnnouncementImagePreview(parsed.imageUrl);
      setEditBuildingAnnouncementImageFile(null);
      setEditBuildingAnnouncementTitle("");
      setEditBuildingAnnouncementTimeLabel("");
      setEditBuildingAnnouncementDescription("");
    } else {
      setEditBuildingAnnouncementMode("form");
      setEditBuildingAnnouncementTitle(parsed.title);
      setEditBuildingAnnouncementTimeLabel(parsed.timeLabel);
      setEditBuildingAnnouncementDescription(parsed.description);
      setEditBuildingAnnouncementImagePreview("");
      setEditBuildingAnnouncementImageFile(null);
    }

    setEditAnnouncementOpen(true);
  }

  function handleNoticeImageSelection(fileList: FileList | null) {
    if (!fileList?.length) {
      return;
    }

    const validation = validateMediaSelection(fileList);

    if (!validation.valid) {
      toast.error(validation.errors[0] ?? (language === "zh-HK" ? "無效圖片檔案。" : "Invalid image file."));
      return;
    }

    const imageFile = validation.images[0];

    if (!imageFile) {
      toast.error(language === "zh-HK" ? "請選擇圖片檔案。" : "Please select an image file.");
      return;
    }

    setEditBuildingAnnouncementImageFile(imageFile);
    setEditBuildingAnnouncementImagePreview(URL.createObjectURL(imageFile));
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4 overflow-y-auto pr-1">
      <div className="grid min-h-fit gap-4 grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]">
        <Panel className="flex min-h-[15.5rem] min-w-0 flex-col">
          <PanelHeader
            action={
              <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-panel-strong px-3 py-2 text-foreground">
                <Thermometer className="h-4 w-4 text-accent-strong" />
                <span className="text-[clamp(1rem,2vw,1.35rem)] font-semibold">
                  {weather.current ? `${Math.round(weather.current.temperature)}°` : "--°"}
                </span>
              </div>
            }
            eyebrow={t(language, "page.home")}
            title={weather.locationLabel}
            description={currentTimeLabel || undefined}
          />
          <div className="mt-4 flex flex-1 flex-col justify-between gap-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="min-w-0 rounded-3xl border border-border bg-panel-strong px-3.5 py-3">
                <div className="flex min-w-0 min-h-[4.25rem] flex-col items-center justify-between gap-2 text-center text-[11px] font-semibold uppercase leading-4 tracking-[0.14em] text-accent-strong">
                  <span className="min-w-0">{t(language, "weather.today")}</span>
                  <div className="shrink-0 self-center">
                    <WeatherStatusVisual
                      code={currentWeatherCode}
                      description={currentWeatherLabel}
                      size="md"
                    />
                  </div>
                </div>
              </div>
              <WeatherMetric
                label={t(language, "weather.wind")}
                value={weather.current ? `${Math.round(weather.current.windSpeed)} km/h` : "--"}
                visual={<MetricIconBadge icon={Wind} />}
              />
              <WeatherMetric
                label={t(language, "weather.rainfall")}
                value={
                  typeof weather.current?.precipitation === "number"
                    ? `${weather.current.precipitation.toFixed(1)} mm`
                    : "--"
                }
                visual={<MetricIconBadge icon={Droplets} />}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {weather.forecast.slice(0, 3).map((day) => (
                <div key={day.date} className="rounded-3xl border border-border bg-panel-strong px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">
                      {formatAppDayLabel(day.date, language)}
                    </p>
                    <WeatherStatusVisual
                      code={day.weatherCode}
                      description={weather.describeWeather(day.weatherCode)}
                    />
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    {Math.round(day.tempMin)}° / {Math.round(day.tempMax)}°
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className="relative flex min-h-[15.5rem] min-w-0 flex-col overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,197,165,0.5),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.18),transparent)]" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">
                {activeAdvertisement?.badge}
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.15rem,2.2vw,1.45rem)] font-semibold text-foreground">
                {activeAdvertisement?.title}
              </h2>
              <p className="mt-3 max-w-none text-sm leading-6 text-muted">
                {activeAdvertisement?.description}
              </p>
            </div>
            {activeAdvertisement?.imageUrl ? (
              <img
                alt={activeAdvertisement.title}
                className="h-24 w-32 shrink-0 rounded-2xl object-cover shadow-sm"
                src={activeAdvertisement.imageUrl}
              />
            ) : null}
            <div className="flex shrink-0 gap-2">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-panel-strong"
                onClick={() =>
                  advertisements.length
                    ? setActiveAd((current) =>
                        current === 0 ? advertisements.length - 1 : current - 1,
                      )
                    : undefined
                }
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-panel-strong"
                onClick={() =>
                  advertisements.length
                    ? setActiveAd((current) => (current + 1) % advertisements.length)
                    : undefined
                }
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="relative mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
            <div className="flex gap-2">
              {advertisements.map((item, index) => (
                <button
                  key={item.id}
                  className={index === activeAd ? "h-2 w-10 rounded-full bg-accent" : "h-2 w-2 rounded-full bg-accent/30"}
                  onClick={() => setActiveAd(index)}
                  type="button"
                />
              ))}
            </div>
            {isAdmin ? (
              <button
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-accent bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
                onClick={() => { setAdsDraft(advertisements); setEditAdsOpen(true); }}
                type="button"
              >
                {t(language, "home.manageAds")}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </Panel>

        <Panel className="flex min-h-[15.5rem] min-w-0 flex-col overflow-hidden">
          <PanelHeader
            title={t(language, "page.adminMessage")}
            description={language === "zh-HK" ? "管理處訊息。" : "Management message."}
            action={canEditBuildingNotice ? (
              <button
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-panel-strong px-3 py-2 text-foreground transition hover:border-accent/40 hover:text-accent"
                onClick={() => { setAdminMessageDraft(sharedContent.adminMessage ?? ""); setEditAdminMessageOpen(true); }}
                type="button"
                title={language === "zh-HK" ? "編輯管理處訊息" : "Edit admin message"}
              >
                <Edit2 className="h-4 w-4" />
              </button>
            ) : undefined}
          />
          <div className="mt-4 flex-1 overflow-y-auto pr-2 text-sm leading-7 text-muted">
            <p>{sharedContent.adminMessage}</p>
          </div>
        </Panel>

        <Panel className="flex min-h-[15.5rem] min-w-0 flex-col overflow-hidden">
          <PanelHeader
            title={language === "zh-HK" ? "大廈通告" : "Building Announcement"}
            description={language === "zh-HK" ? "可編輯表單或圖片形式的通告。" : "Editable as a form or image notice."}
            action={canEditBuildingNotice ? (
              <button
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-panel-strong px-3 py-2 text-foreground transition hover:border-accent/40 hover:text-accent"
                onClick={openEditAnnouncement}
                type="button"
                title={language === "zh-HK" ? "編輯大廈通告" : "Edit building announcement"}
              >
                <Edit2 className="h-4 w-4" />
              </button>
            ) : undefined}
          />
          <div className="mt-4 flex-1 overflow-y-auto pr-2 text-sm leading-7 text-muted">
            {parsedBuildingAnnouncement.mode === "image" ? (
              <img
                alt={language === "zh-HK" ? "大廈通告圖片" : "Building announcement image"}
                className="max-h-72 w-full rounded-2xl object-cover"
                src={parsedBuildingAnnouncement.imageUrl}
              />
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">{parsedBuildingAnnouncement.title}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong">
                  {parsedBuildingAnnouncement.timeLabel}
                </p>
                <p>{parsedBuildingAnnouncement.description}</p>
              </div>
            )}
          </div>
        </Panel>

        {/* Best of the Month card removed — now accessible via Trophy button in top bar */}
      </div>

      <div className="grid min-h-fit gap-4 grid-cols-[repeat(auto-fit,minmax(19rem,1fr))]">
        <HomeFeedColumn
          items={recentSharing}
          language={language}
          onAction={openPostFromHome}
          title={t(language, "page.recentSharing")}
          viewMoreHref="/posts/sharing"
        />
        <HomeFeedColumn items={ownQuests} language={language} onAction={openPostFromHome} title={t(language, "page.yourQuests")} viewMoreHref="/posts/quests" />
        <HomeFeedColumn
          items={acceptedQuests}
          language={language}
          onAction={openRequesterConversation}
          title={t(language, "page.acceptedQuests")}
          viewMoreHref="/connections/messages"
          highlightAction
        />
      </div>

      <Modal
        open={editAnnouncementOpen}
        onClose={() => setEditAnnouncementOpen(false)}
        title={language === "zh-HK" ? "編輯大廈通告" : "Edit Building Announcement"}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              className={editBuildingAnnouncementMode === "form" ? "flex-1 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white" : "flex-1 rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground"}
              onClick={() => setEditBuildingAnnouncementMode("form")}
              type="button"
            >
              {language === "zh-HK" ? "表單通告" : "Form Notice"}
            </button>
            <button
              className={editBuildingAnnouncementMode === "image" ? "flex-1 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white" : "flex-1 rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground"}
              onClick={() => setEditBuildingAnnouncementMode("image")}
              type="button"
            >
              {language === "zh-HK" ? "圖片通告" : "Image Notice"}
            </button>
          </div>

          {editBuildingAnnouncementMode === "form" ? (
            <div className="space-y-3">
              <input
                className="app-input w-full rounded-lg px-4 py-3 text-sm"
                onChange={(e) => setEditBuildingAnnouncementTitle(e.target.value)}
                placeholder={language === "zh-HK" ? "通告標題" : "Announcement title"}
                value={editBuildingAnnouncementTitle}
              />
              <input
                className="app-input w-full rounded-lg px-4 py-3 text-sm"
                onChange={(e) => setEditBuildingAnnouncementTimeLabel(e.target.value)}
                placeholder={language === "zh-HK" ? "日期 / 時間" : "Date / Time"}
                value={editBuildingAnnouncementTimeLabel}
              />
              <textarea
                className="app-input min-h-[160px] w-full rounded-lg px-4 py-3 text-sm"
                onChange={(e) => setEditBuildingAnnouncementDescription(e.target.value)}
                placeholder={language === "zh-HK" ? "通告內容" : "Announcement description"}
                value={editBuildingAnnouncementDescription}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <input
                accept="image/*"
                className="app-input w-full rounded-lg px-4 py-3 text-sm"
                onChange={(event) => handleNoticeImageSelection(event.target.files)}
                type="file"
              />
              {editBuildingAnnouncementImagePreview ? (
                <img
                  alt={language === "zh-HK" ? "通告預覽" : "Announcement preview"}
                  className="max-h-72 w-full rounded-2xl object-cover"
                  src={editBuildingAnnouncementImagePreview}
                />
              ) : (
                <p className="text-sm text-muted">
                  {language === "zh-HK" ? "請上載通告圖片。" : "Upload an announcement image."}
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-muted">
              {language === "zh-HK"
              ? "大廈通告只支援「表單通告」或「圖片通告」。"
              : "Building announcement content supports only Form Notice or Image Notice."}
          </p>

          <div className="flex gap-3">
            <button
              className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-50"
              disabled={savingAnnouncement}
              onClick={handleSaveAnnouncement}
              type="button"
            >
              {savingAnnouncement ? (language === "zh-HK" ? "保存中..." : "Saving...") : (language === "zh-HK" ? "保存" : "Save")}
            </button>
            <button
              className="flex-1 rounded-full border border-border bg-panel-strong px-4 py-3 text-sm font-semibold text-foreground transition hover:border-accent/40"
              onClick={() => setEditAnnouncementOpen(false)}
              type="button"
            >
              {language === "zh-HK" ? "取消" : "Cancel"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={editAdsOpen}
        onClose={() => setEditAdsOpen(false)}
        title={language === "zh-HK" ? "管理廣告" : "Manage Advertisements"}
      >
        <div className="space-y-4">
          {adsDraft.map((ad, idx) => (
            <div key={ad.id} className="space-y-2">
              <input
                className="app-input w-full rounded-[20px] px-4 py-2"
                value={ad.title}
                onChange={(e) =>
                  setAdsDraft((current) => current.map((item, i) => (i === idx ? { ...item, title: e.target.value } : item)))
                }
                placeholder={language === "zh-HK" ? "標題" : "Title"}
              />
              <input
                className="app-input w-full rounded-[20px] px-4 py-2"
                value={ad.badge ?? ""}
                onChange={(e) =>
                  setAdsDraft((current) => current.map((item, i) => (i === idx ? { ...item, badge: e.target.value } : item)))
                }
                placeholder={language === "zh-HK" ? "標籤" : "Badge"}
              />
              <textarea
                className="app-input w-full rounded-[12px] px-4 py-2"
                value={ad.description ?? ""}
                onChange={(e) =>
                  setAdsDraft((current) => current.map((item, i) => (i === idx ? { ...item, description: e.target.value } : item)))
                }
                placeholder={language === "zh-HK" ? "描述" : "Description"}
              />
              <input
                className="app-input w-full rounded-[20px] px-4 py-2"
                value={ad.imageUrl ?? ""}
                onChange={(e) =>
                  setAdsDraft((current) => current.map((item, i) => (i === idx ? { ...item, imageUrl: e.target.value } : item)))
                }
                placeholder={language === "zh-HK" ? "圖片連結（可選）" : "Image URL (optional)"}
              />
              {ad.imageUrl ? (
                <img
                  alt={ad.title}
                  className="h-24 w-full rounded-[14px] object-cover"
                  src={ad.imageUrl}
                />
              ) : null}
              <div className="flex gap-2">
                <button
                  className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
                  type="button"
                  onClick={() => setAdsDraft((current) => current.filter((_, i) => i !== idx))}
                >
                  {language === "zh-HK" ? "刪除" : "Delete"}
                </button>
              </div>
              <hr />
            </div>
          ))}

          <div className="flex gap-3">
            <button
              className="flex-1 rounded-full border border-border bg-panel-strong px-4 py-3 text-sm font-semibold text-foreground"
              type="button"
              onClick={() =>
                setAdsDraft((current) => [
                  ...current,
                  { id: `ad-${Date.now()}`, title: "", description: "", badge: "" },
                ])
              }
            >
              {language === "zh-HK" ? "新增廣告" : "Add Advertisement"}
            </button>
            <button
              className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white"
              disabled={savingAds}
              onClick={async () => {
                setSavingAds(true);
                try {
                  await savePersistedAdvertisements(adsDraft, language);
                  setEditAdsOpen(false);
                  toast.success(language === "zh-HK" ? "廣告已更新" : "Advertisements updated");
                } catch (error) {
                  toast.error(language === "zh-HK" ? "無法保存廣告" : "Unable to save advertisements");
                } finally {
                  setSavingAds(false);
                }
              }}
              type="button"
            >
              {savingAds ? (language === "zh-HK" ? "保存中..." : "Saving...") : (language === "zh-HK" ? "保存" : "Save")}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={editAdminMessageOpen} onClose={() => setEditAdminMessageOpen(false)} title={language === "zh-HK" ? "編輯管理處訊息" : "Edit Admin Message"}>
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {language === "zh-HK" ? "編輯管理處訊息" : "Edit Admin Message"}
          </h2>
          <textarea
            className="app-input min-h-[10rem] w-full rounded-[12px] px-4 py-3 text-sm"
            value={adminMessageDraft}
            onChange={(e) => setAdminMessageDraft(e.target.value)}
            placeholder={language === "zh-HK" ? "管理處訊息..." : "Admin message..."}
          />
          <div className="flex gap-3">
            <button
              className="flex-1 rounded-full border border-border bg-panel-strong px-4 py-3 text-sm font-semibold text-foreground"
              onClick={() => setEditAdminMessageOpen(false)}
              type="button"
            >
              {language === "zh-HK" ? "取消" : "Cancel"}
            </button>
            <button
              className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white"
              disabled={savingAdminMessage}
              onClick={async () => {
                setSavingAdminMessage(true);
                try {
                  await savePersistedAdminAnnouncement(adminMessageDraft);
                  setEditAdminMessageOpen(false);
                  toast.success(language === "zh-HK" ? "訊息已更新" : "Message updated");
                } catch (error) {
                  toast.error(language === "zh-HK" ? "無法保存訊息" : "Unable to save message");
                } finally {
                  setSavingAdminMessage(false);
                }
              }}
              type="button"
            >
              {savingAdminMessage ? (language === "zh-HK" ? "保存中..." : "Saving...") : (language === "zh-HK" ? "保存" : "Save")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function WeatherStatusVisual({
  code,
  description,
  size = "md",
}: {
  code: number;
  description: string;
  size?: "md" | "lg";
}) {
  const visual = getWeatherVisual(code);
  const Icon = visual.icon as LucideIcon;

  return (
    <div className="group relative inline-flex" tabIndex={0}>
      <div
        aria-label={description}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl border border-white/40 shadow-sm",
          size === "lg" ? "h-10 w-10" : "h-8 w-8",
          visual.className,
        )}
        title={description}
      >
        <Icon className={size === "lg" ? "h-5.5 w-5.5" : "h-4 w-4"} />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
        {description}
      </div>
    </div>
  );
}

function WeatherMetric({
  label,
  value,
  visual,
}: {
  label: string;
  value: string;
  visual: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-3xl border border-border bg-panel-strong px-3.5 py-3">
      <div className="flex min-w-0 items-start justify-between gap-2 text-[11px] font-semibold uppercase leading-4 tracking-[0.14em] text-accent-strong">
        <span className="min-w-0 flex-1">{label}</span>
        <div className="shrink-0 pt-0.5">{visual}</div>
      </div>
      <p className="mt-3 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MetricIconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-white/40 bg-accent-soft text-accent-strong shadow-sm">
      <Icon className="h-4 w-4" />
    </div>
  );
}

function HomeFeedColumn({
  highlightAction,
  items,
  language,
  onAction,
  title,
  viewMoreHref,
}: {
  highlightAction?: boolean;
  items: FeedItem[];
  language: Language;
  onAction: (item: FeedItem) => void | Promise<void>;
  title: string;
  viewMoreHref: string;
}) {
  return (
    <Panel className="flex min-h-[22rem] min-w-0 flex-col overflow-hidden">
      <PanelHeader title={title} />
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <article key={item.id} className="rounded-[26px] border border-border bg-panel-strong px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{truncate(item.description, 110)}</p>
              </div>
              {item.edited ? (
                <span className="rounded-full bg-panel px-3 py-1 text-[11px] font-medium text-muted">
                  {t(language, "common.edited")}
                </span>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span>{item.likes} {t(language, "home.likes")}</span>
                <span>{item.comments} {t(language, "home.comments")}</span>
              </div>
              <button className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-panel px-3 py-2 font-semibold text-foreground transition hover:border-accent/40 hover:text-accent" onClick={() => { void onAction(item); }} type="button">
                {highlightAction ? t(language, "home.contactRequester") : t(language, "common.view")}
                {highlightAction ? <MessagesSquare className="h-3.5 w-3.5" /> : null}
              </button>
            </div>
          </article>
        ))}
      </div>
      <a className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent-strong" href={viewMoreHref}>
        {t(language, "common.viewMore")}
        <ArrowRight className="h-4 w-4" />
      </a>
    </Panel>
  );
}