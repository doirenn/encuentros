import Link from "next/link";
import { formatPrice, formatShortDate, formatTime } from "@/lib/dates";
import { workshopTiming } from "@/lib/workshop-status";

export type CardWorkshop = {
  title: string;
  slug: string;
  kicker: string;
  coverPath: string | null;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  isFree: boolean;
  priceAmount: number | null;
  currency: string;
  hosts: { name: string }[];
};

export function WorkshopCard({
  workshop,
  owned = false,
  archive = false,
}: {
  workshop: CardWorkshop;
  owned?: boolean;
  archive?: boolean;
}) {
  const timing = workshopTiming(workshop.startsAt, workshop.endsAt);
  const price = workshop.isFree ? "Gratis" : formatPrice(workshop.priceAmount, workshop.currency);
  const kicker = archive || timing === "past" ? "Replay" : workshop.kicker;

  return (
    <Link
      href={`/w/${workshop.slug}`}
      data-tour="ficha"
      className="card group block overflow-hidden transition-opacity hover:opacity-95"
    >
      <div className="aspect-[1460/752] bg-surface">
        {workshop.coverPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={workshop.coverPath}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">Sin portada</div>
        )}
      </div>
      <div className="space-y-2 p-5">
        <p className="kicker">{kicker}</p>
        <h2 className="text-[20px] font-bold leading-snug tracking-tight text-ink">
          {workshop.title}
        </h2>
        <p className="caption">
          {formatShortDate(workshop.startsAt, workshop.timezone)} ·{" "}
          {formatTime(workshop.startsAt, workshop.timezone)}
          {workshop.hosts[0] ? ` · ${workshop.hosts[0].name}` : ""}
        </p>
        <p className="text-[14px] font-semibold text-ink">
          {owned ? "Ya lo tienes" : archive && !workshop.isFree ? `Replay · ${price}` : price}
        </p>
      </div>
    </Link>
  );
}
