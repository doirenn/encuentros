import Link from "next/link";
import { WorkshopCard } from "@/components/WorkshopCard";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const now = new Date();
  const workshops = await prisma.workshop.findMany({
    where: { status: "published", endsAt: { gte: now } },
    include: { hosts: { orderBy: { sortOrder: "asc" } } },
    orderBy: { startsAt: "asc" },
  });

  return (
    <div className="container-app py-12 sm:py-16">
      <p className="kicker">Agenda</p>
      <h1 className="h1 mt-3 max-w-2xl">Próximos workshops</h1>
      <p className="lead mt-4 max-w-xl">
        Encuentros en vivo. Si te los pierdes, el replay queda en archivo. Nada se esconde al pasar la fecha.
      </p>

      {workshops.length === 0 ? (
        <div className="card mt-10 p-8">
          <p className="text-[18px] font-semibold">No hay talleres próximos ahora.</p>
          <p className="mt-2 text-muted">El archivo sigue abierto. Puedes comprar o ver replays.</p>
          <Link href="/replays" className="btn-cta mt-6 w-auto px-6">
            Ir a replays
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {workshops.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </div>
      )}
    </div>
  );
}
