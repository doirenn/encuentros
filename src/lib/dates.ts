const TIMEZONE = "America/Guayaquil";

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

export { TIMEZONE, MONTHS, WEEKDAYS };

export function formatWorkshopDate(date: Date, timezone = TIMEZONE) {
  const parts = new Intl.DateTimeFormat("es", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  const day = get("day");
  const month = get("month");
  const hour = get("hour");
  const minute = get("minute");
  const dayPeriod = get("dayPeriod");

  return `${capitalize(weekday)} ${day} de ${month}, ${hour}:${minute} ${dayPeriod}`;
}

export function formatShortDate(date: Date, timezone = TIMEZONE) {
  const parts = new Intl.DateTimeFormat("es", {
    timeZone: timezone,
    day: "numeric",
    month: "short",
  }).formatToParts(date);
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  return `${day} ${month}`;
}

export function formatTime(date: Date, timezone = TIMEZONE) {
  return new Intl.DateTimeFormat("es", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function zonedYmd(date: Date, timezone = TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { year, month, day };
}

export function monthLabel(year: number, month: number) {
  return `${capitalize(MONTHS[month - 1])} ${year}`;
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatPrice(amount: number | null | undefined, currency = "USD") {
  if (amount == null) return "Gratis";
  const symbol = currency === "USD" ? "USD" : currency;
  const pretty = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${symbol} ${pretty}`;
}
