import { notFound } from "next/navigation";
import { grantAccessAction, revokeAccessAction } from "@/app/actions/access";
import { prisma } from "@/lib/prisma";

export default async function AccesosPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: {
      accesses: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!workshop) notFound();

  return (
    <div className="py-2">
      <p className="kicker">Panel</p>
      <h1 className="h1 mt-3">Accesos · {workshop.title}</h1>
      {error === "nouser" ? (
        <p className="mt-4 text-[14px] text-[#c45c4a]">No hay una cuenta con ese email.</p>
      ) : null}

      <form action={grantAccessAction} className="card mt-8 flex flex-col gap-3 p-6 sm:flex-row">
        <input type="hidden" name="workshopId" value={workshop.id} />
        <input name="email" type="email" className="field" placeholder="Email de la persona" required />
        <button className="btn-cta sm:w-auto sm:px-6" type="submit">
          Otorgar
        </button>
      </form>

      <ul className="mt-8 divide-y divide-line rounded-card border border-line">
        {workshop.accesses.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-semibold">{item.user.name}</p>
              <p className="caption">
                {item.user.email} · {item.source}
              </p>
            </div>
            <form action={revokeAccessAction}>
              <input type="hidden" name="accessId" value={item.id} />
              <input type="hidden" name="workshopId" value={workshop.id} />
              <button className="text-[14px] font-semibold text-muted" type="submit">
                Quitar
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
