import { workshopTiming } from "@/lib/workshop-status";

export type WorkshopForMetrics = {
  id: string;
  title: string;
  slug: string;
  startsAt: Date;
  endsAt: Date;
  isFree: boolean;
  priceAmount: number | null;
  currency: string;
  status: string;
  hosts: { name: string; sharePercent: number }[];
  accesses: { source: string; createdAt: Date }[];
};

export function money(amount: number, currency = "USD") {
  const pretty = amount.toLocaleString("es", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${pretty}`;
}

function paidCount(workshop: WorkshopForMetrics) {
  if (workshop.isFree) return 0;
  return workshop.accesses.filter((item) => item.source === "pago").length;
}

export function workshopGross(workshop: WorkshopForMetrics) {
  const price = workshop.priceAmount ?? 0;
  return paidCount(workshop) * price;
}

export function splitPayouts(workshop: WorkshopForMetrics) {
  const gross = workshopGross(workshop);
  const raw = workshop.hosts.map((host) => ({
    name: host.name,
    percent: host.sharePercent || 0,
  }));
  const totalPct = raw.reduce((sum, host) => sum + host.percent, 0);
  const factor = totalPct > 100 ? 100 / totalPct : 1;
  const hosts = raw.map((host) => {
    const percent = host.percent * factor;
    return {
      name: host.name,
      percent,
      amount: (gross * percent) / 100,
    };
  });
  const hostTotal = hosts.reduce((sum, host) => sum + host.amount, 0);
  return {
    gross,
    hosts,
    housePercent: Math.max(0, 100 - totalPct * factor),
    house: Math.max(0, gross - hostTotal),
  };
}

export function buildDashboard(workshops: WorkshopForMetrics[], now = new Date()) {
  const published = workshops.filter((item) => item.status === "published");
  const timings = published.map((item) => ({
    item,
    timing: workshopTiming(item.startsAt, item.endsAt, now),
  }));
  const upcoming = timings.filter((row) => row.timing === "upcoming" || row.timing === "live").length;
  const live = timings.filter((row) => row.timing === "live").length;
  const past = timings.filter((row) => row.timing === "past").length;

  const allAccesses = published.flatMap((item) => item.accesses);
  const inscrits = allAccesses.length;
  const paid = allAccesses.filter((item) => item.source === "pago").length;
  const freeSignups = allAccesses.filter((item) => item.source === "optin").length;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthAccesses = allAccesses.filter((item) => item.createdAt >= monthStart);
  const monthPaid = monthAccesses.filter((item) => item.source === "pago");

  const byWorkshop = published.map((item) => {
    const split = splitPayouts(item);
    const inscrit = item.accesses.length;
    const paidHere = paidCount(item);
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      timing: workshopTiming(item.startsAt, item.endsAt, now),
      isFree: item.isFree,
      inscrits: inscrit,
      paid: paidHere,
      conversion: item.isFree || inscrit === 0 ? null : paidHere / inscrit,
      ticket: item.priceAmount ?? 0,
      currency: item.currency,
      ...split,
    };
  });

  const gross = byWorkshop.reduce((sum, row) => sum + row.gross, 0);
  const house = byWorkshop.reduce((sum, row) => sum + row.house, 0);
  const hostPay = gross - house;
  const monthGross = published.reduce((sum, item) => {
    const price = item.isFree ? 0 : item.priceAmount ?? 0;
    const count = item.accesses.filter(
      (access) => access.source === "pago" && access.createdAt >= monthStart,
    ).length;
    return sum + count * price;
  }, 0);

  const hostMap = new Map<string, { name: string; amount: number }>();
  for (const row of byWorkshop) {
    for (const host of row.hosts) {
      const current = hostMap.get(host.name) ?? { name: host.name, amount: 0 };
      current.amount += host.amount;
      hostMap.set(host.name, current);
    }
  }

  const paidWorkshops = byWorkshop.filter((row) => !row.isFree && row.inscrits > 0);
  const avgConversion =
    paidWorkshops.length === 0
      ? 0
      : paidWorkshops.reduce((sum, row) => sum + (row.conversion ?? 0), 0) / paidWorkshops.length;

  return {
    workshops: published.length,
    upcoming,
    live,
    past,
    inscrits,
    paid,
    freeSignups,
    monthSignups: monthAccesses.length,
    monthPaid: monthPaid.length,
    gross,
    house,
    hostPay,
    monthGross,
    avgTicket: paid === 0 ? 0 : gross / paid,
    conversion: inscrits === 0 ? 0 : paid / inscrits,
    avgPaidConversion: avgConversion,
    byWorkshop,
    hosts: Array.from(hostMap.values()).sort((a, b) => b.amount - a.amount),
  };
}
