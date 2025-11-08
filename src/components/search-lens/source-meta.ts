import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookText,
  MessageCircle,
  Rss,
  Twitter,
  Youtube,
} from "lucide-react";
import type { ReceiptSource } from "@/data/entities";

export type SourceMeta = {
  label: string;
  Icon: LucideIcon;
  accent: string;
};

export const sourceMeta: Record<ReceiptSource, SourceMeta> = {
  reddit: {
    label: "Reddit",
    Icon: MessageCircle,
    accent: "text-orange-300",
  },
  twitter: {
    label: "X / Twitter",
    Icon: Twitter,
    accent: "text-slate-100",
  },
  youtube: {
    label: "YouTube",
    Icon: Youtube,
    accent: "text-red-300",
  },
  rss: {
    label: "Blog / RSS",
    Icon: Rss,
    accent: "text-amber-200",
  },
  wiki: {
    label: "Wiki",
    Icon: BookText,
    accent: "text-emerald-200",
  },
  trends: {
    label: "Trends",
    Icon: Activity,
    accent: "text-sky-200",
  },
};
