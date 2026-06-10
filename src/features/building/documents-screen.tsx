"use client";

import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useToLink } from "@/lib/app-state";
import { FeatureShell } from "@/components/ui/feature-shell";
import { Modal } from "@/components/ui/modal";
import { usePersistedSharedContent } from "@/hooks/use-persisted-app-data";
import { t } from "@/lib/translations";

export function DocumentsScreen() {
  const { language } = useToLink();
  const sharedContent = usePersistedSharedContent();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const groupedDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredDocuments = [...sharedContent.documents]
      .filter((document) => {
        const haystack = [document.title, document.category, document.summary].join(" ").toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((left, right) =>
        sortBy === "latest"
          ? right.updatedAt.localeCompare(left.updatedAt)
          : left.updatedAt.localeCompare(right.updatedAt),
      );

    const grouped = new Map<string, typeof filteredDocuments>();

    for (const document of filteredDocuments) {
      const existingItems = grouped.get(document.category);
      if (existingItems) {
        existingItems.push(document);
        continue;
      }

      grouped.set(document.category, [document]);
    }

    return Array.from(grouped.entries()).map(([category, items]) => ({ category, items }));
  }, [query, sharedContent.documents, sortBy]);

  const selectedDocument = sharedContent.documents.find((document) => document.id === selectedDocumentId) ?? null;

  return (
    <FeatureShell
      description={t(language, "documents.pageDesc")}
      title={t(language, "nav.building.documents")}
      toolbar={
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px]">
          <label className="app-input flex items-center gap-3 rounded-full px-4 py-3 text-sm">
            <Search className="h-4 w-4 text-muted" />
            <input
              className="w-full bg-transparent outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(language, "documents.search")}
              value={query}
            />
          </label>
          <select
            className="app-input rounded-full px-4 py-3 text-sm"
            onChange={(event) => setSortBy(event.target.value)}
            value={sortBy}
          >
            <option value="latest">{t(language, "common.latest")}</option>
            <option value="oldest">{t(language, "common.oldest")}</option>
          </select>
        </div>
      }
    >
      <div className="h-full space-y-6 overflow-y-auto pr-1">
        {groupedDocuments.map((group) => (
          <section key={group.category} className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-strong">{group.category}</h3>
              <span className="rounded-full bg-panel px-3 py-1 text-xs text-muted">{group.items.length}</span>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {group.items.map((document) => (
                <button
                  key={document.id}
                  className="rounded-[28px] border border-border bg-panel-strong p-5 text-left transition hover:border-accent"
                  onClick={() => setSelectedDocumentId(document.id)}
                  type="button"
                >
                  <h4 className="text-xl font-semibold text-foreground">{document.title}</h4>
                  <p className="mt-3 text-sm leading-7 text-muted">{document.summary}</p>
                  <p className="mt-4 text-xs text-muted">{t(language, "documents.updated")} {document.updatedAt}</p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Modal
        onClose={() => setSelectedDocumentId(null)}
        open={Boolean(selectedDocument)}
        title={selectedDocument?.title ?? (language === "zh-HK" ? "文件預覽" : "Document preview")}
      >
        {selectedDocument ? (
          <div className="space-y-4">
            <div className="flex items-center justify-start">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  toast.success(
                    language === "zh-HK"
                      ? `已模擬下載 ${selectedDocument.title}`
                      : `Mock download started for ${selectedDocument.title}`,
                  );
                }}
                type="button"
              >
                <Download className="h-4 w-4" />
                {language === "zh-HK" ? "下載" : "Download"}
              </button>
            </div>
            <div className="rounded-[24px] border border-border bg-panel px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{selectedDocument.category}</p>
              <p className="mt-4 text-sm leading-7 text-muted">{selectedDocument.summary}</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                <p>
                  {language === "zh-HK"
                    ? "這是一個模擬文件視窗，用來展示點擊後的閱讀與下載流程。正式版本可在這裡放入 PDF、圖片或條款內容。"
                    : "This is a mocked document viewer showing how the read and download flow will work. The real version can render a PDF, image, or policy content here."}
                </p>
                <p>
                  {language === "zh-HK"
                    ? `最近更新：${selectedDocument.updatedAt}`
                    : `Last updated: ${selectedDocument.updatedAt}`}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </FeatureShell>
  );
}