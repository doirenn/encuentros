import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildDashboard, money } from "@/lib/metrics";

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="caption">{label}</p>
      <p className="mt-2 text-[26px] font-bold tracking-tight text-ink">{value}</p>
      {hint ? <p className="caption mt-1">{hint}</p> : null}
    </div>
  );
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export default async function DashboardPage() {
  const workshops = await prisma.workshop.findMany({
    include: {
      hosts: true,
      accesses: true,
    },
    orderBy: { startsAt: "desc" },
  });
  const data = buildDashboard(workshops);

  return (
    <div className="py-2">
      <p className="kicker">Panel</p>
      <h1 className="h1 mt-3">Dashboard</h1>
      <p className="lead mt-3 max-w-2xl">
        Inscritos, cobros y el reparto de ganancias según el porcentaje de cada presentador.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Ingresos brutos" value={money(data.gross)} hint="Pagos confirmados × precio" />
        <Kpi label="Casa" value={money(data.house)} hint="Lo que queda después del split" />
        <Kpi label="Presentadores" value={money(data.hostPay)} hint="Suma de porcentajes asignados" />
        <Kpi label="Este mes" value={money(data.monthGross)} hint={`${data.monthPaid} pagos este mes`} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Inscritos" value={String(data.inscrits)} hint={`${data.paid} de pago · ${data.freeSignups} opt-in`} />
        <Kpi label="Ticket medio" value={money(data.avgTicket)} />
        <Kpi label="Conversión a pago" value={pct(data.avgPaidConversion)} hint="En workshops de pago" />
        <Kpi
          label="Agenda"
          value={`${data.upcoming}`}
          hint={`${data.live} en vivo · ${data.past} pasados · ${data.workshops} publicados`}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-[18px] font-bold">Por workshop</h2>
        <div className="mt-4 overflow-x-auto rounded-card border border-line bg-bg">
          <table className="w-full min-w-[720px] text-left text-[14px]">
            <thead className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Workshop</th>
                <th className="px-4 py-3 font-semibold">Inscritos</th>
                <th className="px-4 py-3 font-semibold">Pagos</th>
                <th className="px-4 py-3 font-semibold">Bruto</th>
                <th className="px-4 py-3 font-semibold">Casa</th>
                <th className="px-4 py-3 font-semibold">Split</th>
              </tr>
            </thead>
            <tbody>
              {data.byWorkshop.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/workshops/${row.id}`} className="font-semibold text-ink">
                      {row.title}
                    </Link>
                    <p className="caption">
                      {row.timing === "past" ? "Pasado" : row.timing === "live" ? "En vivo" : "Próximo"}
                      {row.isFree ? " · Gratis" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">{row.inscrits}</td>
                  <td className="px-4 py-3">
                    {row.paid}
                    {row.conversion != null ? (
                      <span className="caption ml-1">({pct(row.conversion)})</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{row.isFree ? "—" : money(row.gross, row.currency)}</td>
                  <td className="px-4 py-3">{row.isFree ? "—" : money(row.house, row.currency)}</td>
                  <td className="px-4 py-3 caption">
                    {row.hosts
                      .filter((host) => host.percent > 0)
                      .map((host) => `${host.name} ${Math.round(host.percent)}%`)
                      .join(" · ") || "100% casa"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[18px] font-bold">Ganancias por presentador</h2>
        {data.hosts.length === 0 ? (
          <p className="mt-3 text-muted">Asigna un porcentaje en cada workshop.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-bg">
            {data.hosts.map((host) => (
              <li key={host.name} className="flex items-center justify-between px-5 py-4">
                <p className="font-semibold">{host.name}</p>
                <p>{money(host.amount)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
