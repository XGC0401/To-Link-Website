"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  children,
  onClose,
  open,
  title,
  width = "max-w-3xl",
}: {
  children: React.ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
  width?: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn(
              "app-panel app-panel-strong max-h-[82vh] w-full rounded-[32px] border p-6",
              width,
            )}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
              <button
                className="rounded-full p-2 text-muted transition hover:bg-panel hover:text-foreground"
                onClick={onClose}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[68vh] overflow-y-auto pr-2">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}