import Link from "next/link";
import { WorkshopCard } from "@/components/WorkshopCard";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function ReplaysPage({
  searchParams,
}: {
  searchParams: Promise<{ mios?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const now = new Date();
  const mine = params.mios === "1" && session?.user?.id;

  const workshops = await prisma.workshop.findMany({
    where: {
      status: "published",
      endsAt: { lt: now },
      ...(mine ? { accesses: { some: { userId: session.user.id } } } : {}),
    },
    include: { hosts: { orderBy: { sortOrder: "asc" } } },
    orderBy: { startsAt: "desc" },
  });

  const ownedIds = session?.user?.id
    ? new Set(
        (
          await prisma.access.findMany({
            where: { userId: session.user.id },
            select: { workshopId: true },
          })
        ).map((a) => a.workshopId),
      )
    : new Set<string>();

  return (
    <div className="container-app py-12 sm:py-16">
      <p className="kicker">Archivo</p>
      <h1 className="h1 mt-3">Replays</h1>
      <p className="lead mt-4 max-w-xl">
        Lo que ya terminó sigue aquí. Compra el replay o míralo si ya lo tienes.
      </p>
      {session?.user ? (
        <div className="mt-6 flex gap-2">
          <Link
            href="/replays"
            className={`rounded-xl px-4 py-2 text-[14px] font-semibold ${
              !mine ? "bg-ink text-white" : "bg-surface text-ink"
            }`}
          >
            Todos
          </Link>
          <Link
            href="/replays?mios=1"
            className={`rounded-xl px-4 py-2 text-[14px] font-semibold ${
              mine ? "bg-ink text-white" : "bg-surface text-ink"
            }`}
          >
            Ya los tengo
          </Link>
        </div>
      ) : null}

      {workshops.length === 0 ? (
        <div className="card mt-10 p-8">
          <p className="text-[18px] font-semibold">Aún no hay replays en este filtro.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {workshops.map((workshop) => (
            <WorkshopCard
              key={workshop.id}
              workshop={workshop}
              archive
              owned={ownedIds.has(workshop.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
