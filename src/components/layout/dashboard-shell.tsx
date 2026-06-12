"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImageUp, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useDashboardData } from "@/lib/dashboard-data-context";
import {
  cloudinarySetupHint,
  uploadFilesToCloudinary,
  validateMediaSelection,
} from "@/lib/media-upload";
import { t } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useToLink } from "@/lib/app-state";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const {
    activeInfoPanel,
    closeInfoPanel,
    language,
    notificationsOpen,
    setNotificationsOpen,
  } = useToLink();
  const { dashboardData, sharedContent } = useDashboardData();
  const [feedbackFiles, setFeedbackFiles] = useState<File[]>([]);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const notifications = dashboardData.notificationsByLanguage[language] ?? [];
  const faqItems = sharedContent.faqItemsByLanguage[language] ?? [];

  function closeInfoPanelWithReset() {
    setFeedbackFiles([]);
    closeInfoPanel();
  }

  function handleFeedbackFileSelection(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const validation = validateMediaSelection(fileList);

    if (!validation.valid) {
      toast.error(validation.errors[0] ?? "Invalid file selection.");
      return;
    }

    setFeedbackFiles(validation.files);
    toast.success(`${validation.files.length} media file(s) ready for upload.`);
  }

  async function handleFeedbackSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackSubmitting(true);

    try {
      const uploads = feedbackFiles.length
        ? await uploadFilesToCloudinary(feedbackFiles)
        : [];

      toast.success(
        uploads.length
          ? t(language, "toast.feedbackWithFiles").replace("{n}", String(uploads.length))
          : t(language, "toast.feedbackSubmitted"),
      );
      closeInfoPanelWithReset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : cloudinarySetupHint);
    } finally {
      setFeedbackSubmitting(false);
    }
  }

  return (
    <div className="surface-dot flex h-dvh w-full overflow-hidden p-3 md:p-4">
      <div className="relative flex w-full overflow-hidden rounded-[36px] border border-white/40 bg-white/25 shadow-[0_30px_80px_rgba(146,72,8,0.16)] backdrop-blur-xl">
        <Sidebar />

        <div className="relative flex min-w-0 flex-1 flex-col p-3 md:p-4">
          <TopBar />
          <main className="relative z-10 mt-4 flex min-h-0 flex-1 overflow-hidden">{children}</main>

          <AnimatePresence>
            {notificationsOpen ? (
              <motion.aside
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-4 top-[5.6rem] z-30 w-[24rem] max-w-[calc(100%-2rem)]"
                exit={{ opacity: 0, x: 16 }}
                initial={{ opacity: 0, x: 16 }}
              >
                <Panel className="space-y-4">
                  <PanelHeader
                    eyebrow={t(language, "control.notifications")}
                    title={t(language, "notif.priorityInbox")}
                    action={
                      <button
                        className="rounded-full p-2 text-muted transition hover:bg-panel-strong hover:text-foreground"
                        onClick={() => setNotificationsOpen(false)}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    }
                  />
                  <div className="space-y-3">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "rounded-3xl border p-4",
                          item.critical
                            ? "border-accent/35 bg-accent-soft/80"
                            : "border-border bg-panel-strong",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-foreground">{item.title}</p>
                          <span className="text-xs text-muted">{item.timeLabel}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </Panel>
              </motion.aside>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {activeInfoPanel ? (
              <motion.div
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 px-4 py-8 backdrop-blur-sm"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              >
                <motion.div
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="w-full max-w-3xl"
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                >
                  <Panel className="max-h-[80vh] overflow-hidden">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-strong">
                          {t(language, "nav.info")}
                        </p>
                        <h2 className="font-display text-2xl font-semibold text-foreground">
                          {activeInfoPanel === "faq"
                            ? t(language, "nav.info.faq")
                            : activeInfoPanel === "aboutUs"
                              ? t(language, "nav.info.about")
                              : activeInfoPanel === "privacyPolicy"
                                ? t(language, "nav.info.privacy")
                                : activeInfoPanel === "termsOfService"
                                  ? t(language, "nav.info.terms")
                              : activeInfoPanel === "appFeedback"
                                ? t(language, "nav.info.feedback")
                                : t(language, "nav.info.community")}
                        </h2>
                      </div>
                      <button
                        className="rounded-full p-2 text-muted transition hover:bg-panel-strong hover:text-foreground"
                        onClick={closeInfoPanelWithReset}
                        type="button"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {activeInfoPanel === "faq" ? (
                      <div className="max-h-[62vh] space-y-5 overflow-y-auto pr-2">
                        {faqItems.map((item, index) => (
                          <div key={item.id} className="space-y-3">
                            <div className="rounded-3xl bg-rose-500/90 px-5 py-4 text-sm font-semibold text-white">
                              {`Q${index + 1}. ${item.question}`}
                            </div>
                            <div className="rounded-3xl bg-emerald-500/16 px-5 py-4 text-sm leading-6 text-foreground">
                              {`A${index + 1}. ${item.answer}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {activeInfoPanel === "aboutUs" ? (
                      <div className="space-y-4 text-sm leading-7 text-muted">
                        <p>{t(language, "about.description")}</p>
                        <p>{t(language, "about.platformNote")}</p>
                      </div>
                    ) : null}

                    {activeInfoPanel === "privacyPolicy" ? (
                      <div className="max-h-[62vh] space-y-4 overflow-y-auto pr-2 text-sm leading-7 text-muted">
                        <p>
                          {language === "zh-HK"
                            ? "此私隱政策為示範版本，說明平台如何收集、使用及保護住戶資料。"
                            : "This Privacy Policy is a mock document describing how the platform collects, uses, and protects resident data."}
                        </p>
                        <div className="rounded-[24px] border border-border bg-panel-strong px-5 py-4">
                          <p className="font-semibold text-foreground">{language === "zh-HK" ? "1. 收集資料" : "1. Data We Collect"}</p>
                          <p className="mt-2">
                            {language === "zh-HK"
                              ? "我們可能收集註冊資料、聯絡方式、帖子互動、預約紀錄及你主動提交的回饋內容。"
                              : "We may collect registration details, contact information, post interactions, booking records, and feedback you voluntarily submit."}
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-border bg-panel-strong px-5 py-4">
                          <p className="font-semibold text-foreground">{language === "zh-HK" ? "2. 使用方式" : "2. How We Use It"}</p>
                          <p className="mt-2">
                            {language === "zh-HK"
                              ? "資料會用於帳戶登入、社區互動、預約服務、通知推送及改善平台體驗。"
                              : "Data is used for account access, community interactions, booking services, notifications, and improving the platform experience."}
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-border bg-panel-strong px-5 py-4">
                          <p className="font-semibold text-foreground">{language === "zh-HK" ? "3. 保留與保護" : "3. Retention and Protection"}</p>
                          <p className="mt-2">
                            {language === "zh-HK"
                              ? "平台會以合理安全措施保護資料，並只在營運、法規或稽核需要時保留必要紀錄。"
                              : "The platform applies reasonable safeguards and retains only the records needed for operations, compliance, or audit purposes."}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {activeInfoPanel === "termsOfService" ? (
                      <div className="max-h-[62vh] space-y-4 overflow-y-auto pr-2 text-sm leading-7 text-muted">
                        <p>
                          {language === "zh-HK"
                            ? "此服務條款為示範版本，用於展示日後正式條款的版面與內容結構。"
                            : "This Terms of Service panel is a mock document showing the future layout and structure of the formal terms."}
                        </p>
                        <div className="rounded-[24px] border border-border bg-panel-strong px-5 py-4">
                          <p className="font-semibold text-foreground">{language === "zh-HK" ? "1. 帳戶責任" : "1. Account Responsibility"}</p>
                          <p className="mt-2">
                            {language === "zh-HK"
                              ? "你需要確保帳戶資料真實、密碼安全，並對帳戶中的活動負責。"
                              : "You are responsible for providing accurate account information, keeping your password secure, and managing activity under your account."}
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-border bg-panel-strong px-5 py-4">
                          <p className="font-semibold text-foreground">{language === "zh-HK" ? "2. 社區使用規則" : "2. Community Use Rules"}</p>
                          <p className="mt-2">
                            {language === "zh-HK"
                              ? "用戶不得發布違規、騷擾、欺詐或危害他人的內容，平台可依情況限制相關功能。"
                              : "Users must not post abusive, fraudulent, or harmful content, and the platform may restrict features when misuse is detected."}
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-border bg-panel-strong px-5 py-4">
                          <p className="font-semibold text-foreground">{language === "zh-HK" ? "3. 服務調整" : "3. Service Changes"}</p>
                          <p className="mt-2">
                            {language === "zh-HK"
                              ? "平台可因維護、更新或合規需要調整功能、內容或可用性。"
                              : "The platform may adjust features, content, or availability for maintenance, updates, or compliance needs."}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {activeInfoPanel === "appFeedback" || activeInfoPanel === "communityFeedback" ? (
                      <form
                        className="space-y-4"
                        onSubmit={handleFeedbackSubmit}
                      >
                        <textarea
                          className="app-input min-h-36 w-full rounded-[28px] px-4 py-4 text-sm"
                          id="feedback-textarea"
                          name="feedback-message"
                          maxLength={2000}
                          placeholder={t(language, "feedback.placeholder")}
                        />
                        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-border bg-panel-strong px-6 py-8 text-center text-sm text-muted transition hover:border-accent/40 hover:text-foreground">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                            <ImageUp className="h-6 w-6" />
                          </div>
                          {t(language, "feedback.upload")}
                          <span className="text-xs">{t(language, "feedback.fileTypes")}</span>
                          <input
                            className="sr-only"
                            id="feedback-file-upload"
                            name="feedback-files"
                            multiple
                            onChange={(event) => handleFeedbackFileSelection(event.target.files)}
                            type="file"
                          />
                        </label>
                        {feedbackFiles.length ? (
                          <p className="text-xs text-muted">
                            {t(language, "feedback.selectedFiles").replace("{n}", String(feedbackFiles.length))}
                          </p>
                        ) : null}
                        <div className="flex justify-end">
                          <button
                            disabled={feedbackSubmitting}
                            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-strong"
                            type="submit"
                          >
                            <Upload className="h-4 w-4" />
                            {feedbackSubmitting ? t(language, "feedback.uploading") : t(language, "feedback.submit")}
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </Panel>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}