"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImageUp, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { getFaqItems, getNotifications } from "@/lib/demo-data";
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
  const [feedbackFiles, setFeedbackFiles] = useState<File[]>([]);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

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

        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden p-3 md:p-4">
          <TopBar />
          <main className="mt-4 flex min-h-0 flex-1 overflow-hidden">{children}</main>

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
                    {getNotifications(language).map((item) => (
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
                      <div className="max-h-[62vh] space-y-3 overflow-y-auto pr-2">
                        {getFaqItems(language).map((item) => (
                          <div key={item.id} className="space-y-2">
                            <div className="rounded-3xl bg-rose-500/90 px-5 py-4 text-sm font-semibold text-white">
                              {item.question}
                            </div>
                            <div className="rounded-3xl bg-emerald-500/16 px-5 py-4 text-sm leading-6 text-foreground">
                              {item.answer}
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

                    {activeInfoPanel === "appFeedback" || activeInfoPanel === "communityFeedback" ? (
                      <form
                        className="space-y-4"
                        onSubmit={handleFeedbackSubmit}
                      >
                        <textarea
                          className="app-input min-h-36 w-full rounded-[28px] px-4 py-4 text-sm"
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