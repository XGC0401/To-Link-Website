export type BuildingAnnouncementMode = "form" | "image";

export interface ParsedBuildingAnnouncementForm {
  mode: "form";
  title: string;
  timeLabel: string;
  description: string;
}

export interface ParsedBuildingAnnouncementImage {
  mode: "image";
  imageUrl: string;
}

export type ParsedBuildingAnnouncement = ParsedBuildingAnnouncementForm | ParsedBuildingAnnouncementImage;

export function serializeFormBuildingAnnouncement(input: {
  description: string;
  timeLabel: string;
  title: string;
}) {
  return `FORM_NOTICE::${JSON.stringify(input)}`;
}

export function serializeImageBuildingAnnouncement(imageUrl: string) {
  return `IMAGE_NOTICE::${imageUrl}`;
}

export function parseBuildingAnnouncement(raw: string): ParsedBuildingAnnouncement {
  if (raw.startsWith("IMAGE_NOTICE::")) {
    return {
      imageUrl: raw.replace("IMAGE_NOTICE::", "").trim(),
      mode: "image",
    };
  }

  if (raw.startsWith("FORM_NOTICE::")) {
    try {
      const parsed = JSON.parse(raw.replace("FORM_NOTICE::", "")) as {
        description?: string;
        timeLabel?: string;
        title?: string;
      };

      return {
        description: parsed.description ?? "",
        mode: "form",
        timeLabel: parsed.timeLabel ?? "",
        title: parsed.title ?? "",
      };
    } catch {
      return {
        description: raw,
        mode: "form",
        timeLabel: "",
        title: "",
      };
    }
  }

  return {
    description: raw,
    mode: "form",
    timeLabel: "",
    title: "",
  };
}