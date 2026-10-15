"use client";

import type { InteractiveAsset } from "@/types/interactive-assets";

interface InteractiveAssetRendererProps {
  asset: InteractiveAsset;
  onInteract: () => void;
}

export default function InteractiveAssetRenderer({
  asset,
  onInteract,
}: InteractiveAssetRendererProps) {
  const isInteractive = asset.interactive === true;

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={onInteract}
      className={[
        "w-full rounded-md border p-5 text-left transition",
        isInteractive
          ? "border-[#B9DFF7] bg-white hover:border-[#0f6fde] hover:bg-[#F4FAFE] hover:shadow-md"
          : "cursor-default border-[#d6e4f5] bg-[#F4FAFE]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0f6fde]">
            {asset.type}
          </p>

          <h3 className="mt-2 text-lg font-semibold text-[#334155]">
            {asset.label}
          </h3>

          {asset.description && (
            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              {asset.description}
            </p>
          )}
        </div>

        {isInteractive && (
          <span className="shrink-0 rounded-md bg-[#0f6fde] px-3 py-2 text-xs font-semibold text-white">
            Explore
          </span>
        )}
      </div>
    </button>
  );
}
