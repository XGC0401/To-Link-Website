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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { getAdvertisements, homeFeed } from "@/lib/demo-data";
import { formatAppDateTime, formatAppDayLabel } from "@/lib/date";
import { t } from "@/lib/translations";
import { cn, truncate } from "@/lib/utils";
import { useToLink } from "@/lib/app-state";
import { useWeather } from "@/hooks/use-weather";

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
  const { language } = useToLink();
  const weather = useWeather(language);
  const advertisements = getAdvertisements(language);
  const [activeAd, setActiveAd] = useState(0);
  const [currentTimeLabel, setCurrentTimeLabel] = useState("");

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
    () => homeFeed.filter((item) => item.category === "sharing").slice(0, 5),
    [],
  );
  const ownQuests = useMemo(
    () => homeFeed.filter((item) => item.category === "quest" && item.createdByCurrentUser),
    [],
  );
  const acceptedQuests = useMemo(
    () => homeFeed.filter((item) => item.category === "quest" && item.acceptedByCurrentUser),
    [],
  );

  const currentWeatherLabel = weather.current
    ? weather.describeWeather(weather.current.weatherCode)
    : weather.status === "error"
      ? t(language, "weather.unavailable")
      : t(language, "weather.loading");

  const currentWeatherCode = weather.current?.weatherCode ?? -1;

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
              <div className="rounded-3xl border border-border bg-panel-strong px-3.5 py-3">
                <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
                  <span>{t(language, "weather.today")}</span>
                  <WeatherStatusVisual
                    code={currentWeatherCode}
                    description={currentWeatherLabel}
                    size="lg"
                  />
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
                {advertisements[activeAd]?.badge}
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.15rem,2.2vw,1.45rem)] font-semibold text-foreground">
                {advertisements[activeAd]?.title}
              </h2>
              <p className="mt-3 max-w-none text-sm leading-6 text-muted">
                {advertisements[activeAd]?.description}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-panel-strong"
                onClick={() =>
                  setActiveAd((current) =>
                    current === 0 ? advertisements.length - 1 : current - 1,
                  )
                }
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-panel-strong"
                onClick={() => setActiveAd((current) => (current + 1) % advertisements.length)}
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
            <button className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-panel-strong px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent/40 hover:text-accent">
              {t(language, "home.manageAds")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Panel>

        <Panel className="flex min-h-[15.5rem] min-w-0 flex-col overflow-hidden">
          <PanelHeader
            title={t(language, "page.adminMessage")}
            description={t(language, "home.adminBroadcast")}
          />
          <div className="mt-4 flex-1 overflow-y-auto pr-2 text-sm leading-7 text-muted">
            {t(language, "home.adminMessageContent")}
          </div>
        </Panel>
      </div>

      <div className="grid min-h-fit gap-4 grid-cols-[repeat(auto-fit,minmax(19rem,1fr))]">
        <HomeFeedColumn
          items={recentSharing}
          language={language}
          title={t(language, "page.recentSharing")}
          viewMoreHref="/posts/sharing"
        />
        <HomeFeedColumn items={ownQuests} language={language} title={t(language, "page.yourQuests")} viewMoreHref="/posts/quests" />
        <HomeFeedColumn
          items={acceptedQuests}
          language={language}
          title={t(language, "page.acceptedQuests")}
          viewMoreHref="/connections/messages"
          highlightAction
        />
      </div>
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
    <div className="rounded-3xl border border-border bg-panel-strong px-3.5 py-3">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
        <span>{label}</span>
        {visual}
      </div>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
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
  title,
  viewMoreHref,
}: {
  highlightAction?: boolean;
  items: typeof homeFeed;
  language: import("@/lib/types").Language;
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
              <button className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-panel px-3 py-2 font-semibold text-foreground transition hover:border-accent/40 hover:text-accent">
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