"use client";

import { useEffect, useState } from "react";
import {
  formatLongInZone,
  formatShortInZone,
  timezoneCity,
} from "@/lib/timezone";

export function LocalEventTime({
  date,
  eventTz,
  compact = false,
}: {
  date: Date | string;
  eventTz: string;
  compact?: boolean;
}) {
  const start = typeof date === "string" ? new Date(date) : date;
  const [viewerTz, setViewerTz] = useState<string | null>(null);

  useEffect(() => {
    setViewerTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const eventLabel = compact
    ? formatShortInZone(start, eventTz)
    : formatLongInZone(start, eventTz);
  const sameZone = viewerTz && viewerTz === eventTz;

  return (
    <span>
      <span>
        {eventLabel} ({timezoneCity(eventTz)})
      </span>
      {viewerTz && !sameZone ? (
        <span className="mt-1 block text-[13px] text-muted">
          En tu zona ({timezoneCity(viewerTz)}):{" "}
          {compact ? formatShortInZone(start, viewerTz) : formatLongInZone(start, viewerTz)}
        </span>
      ) : null}
    </span>
  );
}
