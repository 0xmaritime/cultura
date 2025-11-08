"use client";

import { X } from "lucide-react";
import type { Entity } from "@/data/entities";
import EntityDetail from "./entity-detail";

type EntityDrawerProps = {
  entity: Entity | null;
  open: boolean;
  onClose: () => void;
};

export default function EntityDrawer({ entity, open, onClose }: EntityDrawerProps) {
  if (!entity || !open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/70 px-4 py-6 backdrop-blur-sm lg:hidden">
      <div className="mx-auto flex h-full max-w-md flex-col gap-4">
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white"
          onClick={onClose}
        >
          Close
          <X className="h-4 w-4" />
        </button>
        <div className="flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 p-5">
          <EntityDetail entity={entity} />
        </div>
      </div>
    </div>
  );
}
