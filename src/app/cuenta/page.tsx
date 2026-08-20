import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/admin";
import { formatShortDate } from "@/lib/dates";
import { workshopTiming } from "@/lib/workshop-status";

export default async function CuentaPage() {
  const session = await requireSession();
  const accesses = await prisma.access.findMany({
    where: { userId: session.user.id },
    include: { workshop: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-app py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Tu espacio</p>
          <h1 className="h1 mt-3">Hola, {session.user.name}</h1>
          <p className="lead mt-3">Los workshops que ya son tuyos.</p>
        </div>
        <form action={logoutAction}>
          <button className="btn-ghost" type="submit">
            Salir
          </button>
        </form>
      </div>

      {accesses.length === 0 ? (
        <div className="card mt-10 p-8">
          <p className="text-[18px] font-semibold">Aún no tienes accesos.</p>
          <p className="mt-2 text-muted">Reserva un próximo o compra un replay.</p>
          <div className="mt-5 flex gap-3">
            <Link href="/" className="btn-cta w-auto px-5">
              Ver próximos
            </Link>
            <Link href="/replays" className="btn-ghost">
              Ver replays
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-line rounded-card border border-line">
          {accesses.map((item) => {
            const past = workshopTiming(item.workshop.startsAt, item.workshop.endsAt) === "past";
            return (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-semibold">{item.workshop.title}</p>
                  <p className="caption">
                    {formatShortDate(item.workshop.startsAt, item.workshop.timezone)} ·{" "}
                    {past ? "Replay" : "Próximo"}
                  </p>
                </div>
                <Link href={`/w/${item.workshop.slug}`} className="text-[14px] font-semibold text-accent">
                  {past ? "Ver replay" : "Abrir ficha"}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
