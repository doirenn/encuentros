"use client";

import { startTour } from "@/components/MiniTour";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="container-app flex flex-col gap-3 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Encuentros. Workshops en vivo y replays que no desaparecen.</p>
        <button type="button" className="btn-ghost self-start px-0 text-accent" onClick={startTour}>
          Ver guía
        </button>
      </div>
    </footer>
  );
}
