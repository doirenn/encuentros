import { CalendarMonth } from "@/components/CalendarMonth";
import { TIMEZONE, zonedYmd } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const params = await searchParams;
  const now = zonedYmd(new Date(), TIMEZONE);
  let year = now.year;
  let month = now.month;
  if (params.m && /^\d{4}-\d{2}$/.test(params.m)) {
    const [y, mo] = params.m.split("-").map(Number);
    year = y;
    month = mo;
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const workshops = await prisma.workshop.findMany({
    where: {
      status: "published",
      startsAt: { gte: start, lt: end },
    },
    orderBy: { startsAt: "asc" },
  });

  const prev = new Date(year, month - 2, 1);
  const next = new Date(year, month, 1);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="container-app py-12 sm:py-16">
      <p className="kicker">Mes</p>
      <h1 className="h1 mt-3">Calendario</h1>
      <p className="lead mt-4 max-w-xl">
        Todo el mes, incluidos los que ya ocurrieron. Un clic abre la ficha.
      </p>
      <div className="mt-10">
        <CalendarMonth
          year={year}
          month={month}
          workshops={workshops}
          prevHref={`/calendario?m=${fmt(prev)}`}
          nextHref={`/calendario?m=${fmt(next)}`}
        />
      </div>
    </div>
  );
}
