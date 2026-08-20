export const EVENT_TIMEZONES = [
  { id: "America/Guayaquil", label: "Guayaquil, Quito" },
  { id: "America/Bogota", label: "Bogotá" },
  { id: "America/Lima", label: "Lima" },
  { id: "America/Mexico_City", label: "Ciudad de México" },
  { id: "America/Santiago", label: "Santiago" },
  { id: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  { id: "America/Caracas", label: "Caracas" },
  { id: "America/La_Paz", label: "La Paz" },
  { id: "America/Costa_Rica", label: "San José" },
  { id: "America/Panama", label: "Panamá" },
  { id: "America/Sao_Paulo", label: "São Paulo" },
  { id: "America/New_York", label: "Nueva York" },
  { id: "America/Los_Angeles", label: "Los Ángeles" },
  { id: "Europe/Madrid", label: "Madrid" },
  { id: "UTC", label: "UTC" },
] as const;

const PREVIEW_ZONES = [
  "America/Guayaquil",
  "America/Mexico_City",
  "America/Bogota",
  "America/Argentina/Buenos_Aires",
  "Europe/Madrid",
];

export function timezoneCity(id: string) {
  return EVENT_TIMEZONES.find((item) => item.id === id)?.label ?? id.replace(/_/g, " ");
}

function partsInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "0";
  let hour = get("hour");
  if (hour === "24") hour = "00";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(hour),
    minute: Number(get("minute")),
    second: Number(get("second")),
  };
}

function tzOffsetMs(date: Date, timeZone: string) {
  const p = partsInZone(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - date.getTime();
}

export function dateToZonedInput(date: Date, timeZone: string) {
  const p = partsInZone(date, timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

export function zonedInputToDate(local: string, timeZone: string) {
  const [datePart, timePart = "00:00"] = local.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const first = new Date(utcGuess.getTime() - tzOffsetMs(utcGuess, timeZone));
  return new Date(utcGuess.getTime() - tzOffsetMs(first, timeZone));
}

export function formatLongInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("es", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatClockInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("es", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatShortInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("es", {
    timeZone,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function previewTimes(date: Date, eventTz: string) {
  const zones = Array.from(new Set([eventTz, ...PREVIEW_ZONES]));
  return zones.map((id) => ({
    id,
    city: timezoneCity(id),
    clock: formatClockInZone(date, id),
    event: id === eventTz,
  }));
}

export function isGoogleMeetUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "meet.google.com" || url.hostname.endsWith(".meet.google.com"));
  } catch {
    return false;
  }
}
