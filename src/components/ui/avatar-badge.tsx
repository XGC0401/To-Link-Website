"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function isAvatarImage(value: string) {
  return /^(https?:\/\/|data:image\/|blob:)/i.test(value);
}

export function AvatarBadge({
  alt,
  className,
  imageClassName,
  textClassName,
  value,
}: {
  alt: string;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  value: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = isAvatarImage(value) && !imageFailed;

  return (
    <div className={cn("overflow-hidden rounded-full", className)}>
      {showImage ? (
        <img
          alt={alt}
          className={cn("h-full w-full object-cover", imageClassName)}
          onError={() => setImageFailed(true)}
          src={value}
        />
      ) : (
        <span className={cn("inline-flex h-full w-full items-center justify-center", textClassName)}>
          {value}
        </span>
      )}
    </div>
  );
}
