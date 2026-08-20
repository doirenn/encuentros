import Link from "next/link";
import { deleteWorkshopAction } from "@/app/actions/workshops";
import { prisma } from "@/lib/prisma";
import { formatShortDate } from "@/lib/dates";
import { workshopTiming } from "@/lib/workshop-status";

export default async function WorkshopsAdminPage() {
  const workshops = await prisma.workshop.findMany({
    include: { _count: { select: { accesses: true } } },
    orderBy: { startsAt: "desc" },
  });

  return (
    <div className="py-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Panel</p>
          <h1 className="h1 mt-3">Workshops</h1>
        </div>
        <Link href="/admin/workshops/new" className="btn-cta w-auto px-5">
          Nuevo workshop
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-line rounded-card border border-line bg-bg">
        {workshops.map((item) => {
          const past = workshopTiming(item.startsAt, item.endsAt) === "past";
          return (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="caption">
                  {item.status === "draft" ? "Borrador · " : ""}
                  {past ? "Pasado" : "Próximo"} · {formatShortDate(item.startsAt, item.timezone)} ·{" "}
                  {item._count.accesses} inscritos
                </p>
              </div>
              <div className="flex gap-3 text-[14px] font-semibold">
                <Link className="text-accent" href={`/admin/workshops/${item.id}`}>
                  Editar
                </Link>
                <Link className="text-accent" href={`/admin/workshops/${item.id}/accesos`}>
                  Accesos
                </Link>
                <form action={deleteWorkshopAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="text-muted" type="submit">
                    Borrar
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
