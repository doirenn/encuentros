import Link from "next/link";
import { MONTHS, WEEKDAYS, TIMEZONE, zonedYmd } from "@/lib/dates";
import { workshopTiming } from "@/lib/workshop-status";

type CalItem = {
  slug: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function mondayIndex(year: number, month: number) {
  const js = new Date(year, month - 1, 1).getDay();
  return (js + 6) % 7;
}

export function CalendarMonth({
  year,
  month,
  workshops,
  prevHref,
  nextHref,
}: {
  year: number;
  month: number;
  workshops: CalItem[];
  prevHref: string;
  nextHref: string;
}) {
  const total = daysInMonth(year, month);
  const offset = mondayIndex(year, month);
  const cells = Array.from({ length: offset + total }, (_, i) => {
    if (i < offset) return null;
    return i - offset + 1;
  });
  while (cells.length % 7 !== 0) cells.push(null);

  const today = zonedYmd(new Date(), TIMEZONE);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <Link href={prevHref} className="btn-ghost">
          Anterior
        </Link>
        <div className="text-center">
          <p className="text-[18px] font-bold tracking-tight">
            {MONTHS[month - 1][0].toUpperCase() + MONTHS[month - 1].slice(1)} {year}
          </p>
          <p className="caption">Hora de Guayaquil</p>
        </div>
        <Link href={nextHref} className="btn-ghost">
          Siguiente
        </Link>
      </div>
      <div className="grid grid-cols-7 border-t border-line text-center text-[12px] font-semibold uppercase tracking-wide text-muted">
        {WEEKDAYS.map((day) => (
          <div key={day} className="border-b border-line py-3">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const items =
            day == null
              ? []
              : workshops.filter((w) => {
                  const ymd = zonedYmd(w.startsAt, w.timezone || TIMEZONE);
                  return ymd.year === year && ymd.month === month && ymd.day === day;
                });
          const isToday =
            day != null && today.year === year && today.month === month && today.day === day;
          return (
            <div
              key={i}
              className="min-h-[110px] border-b border-r border-line p-2 last:border-r-0"
            >
              {day ? (
                <>
                  <span
                    className={
                      isToday
                        ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#c45c4a] text-[12px] font-bold text-white"
                        : "text-[13px] font-semibold"
                    }
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {items.map((item) => {
                      const past = workshopTiming(item.startsAt, item.endsAt) === "past";
                      return (
                        <Link
                          key={item.slug}
                          href={`/w/${item.slug}`}
                          className={`block truncate text-[12px] font-medium ${
                            past ? "text-muted" : "text-accent"
                          }`}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
