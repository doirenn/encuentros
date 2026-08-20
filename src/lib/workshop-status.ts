export type WorkshopTiming = "upcoming" | "live" | "past";

export function workshopTiming(
  startsAt: Date,
  endsAt: Date,
  now = new Date(),
): WorkshopTiming {
  if (now < startsAt) return "upcoming";
  if (now > endsAt) return "past";
  return "live";
}

export function isPastWorkshop(endsAt: Date, now = new Date()) {
  return now > endsAt;
}
