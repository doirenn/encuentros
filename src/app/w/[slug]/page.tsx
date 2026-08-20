import { notFound } from "next/navigation";
import { AccessCard } from "@/components/AccessCard";
import { LocalEventTime } from "@/components/LocalEventTime";
import { MediaBlock } from "@/components/MediaBlock";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseVideoEmbed } from "@/lib/video";
import { workshopTiming } from "@/lib/workshop-status";

function Check({ children }: { children: string }) {
  return (
    <li className="flex gap-3 text-[15px] leading-6 text-ink">
      <span className="mt-[3px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

export default async function WorkshopPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const workshop = await prisma.workshop.findUnique({
    where: { slug },
    include: {
      highlights: { orderBy: { sortOrder: "asc" } },
      hosts: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!workshop || workshop.status !== "published") notFound();

  const session = await auth();
  const timing = workshopTiming(workshop.startsAt, workshop.endsAt);
  const hasAccess = session?.user?.id
    ? Boolean(
        await prisma.access.findUnique({
          where: {
            userId_workshopId: { userId: session.user.id, workshopId: workshop.id },
          },
        }),
      )
    : false;

  const kicker = timing === "past" ? "Replay disponible" : workshop.kicker;
  const replaySrc = hasAccess ? parseVideoEmbed(workshop.replayUrl) : null;

  return (
    <div className="container-app py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="kicker">{kicker}</p>
        <h1 className="h1 mt-4">{workshop.title}</h1>
        <p className="lead mt-4">{workshop.description}</p>
        <p className="mt-4 text-[14px] font-medium text-ink">
          <LocalEventTime date={workshop.startsAt} eventTz={workshop.timezone} />
        </p>
      </div>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <MediaBlock
            coverPath={workshop.coverPath}
            videoUrl={timing === "past" && !hasAccess ? null : workshop.videoUrl}
            title={workshop.title}
          />
          {workshop.highlights.length ? (
            <ul className="space-y-3 px-1">
              {workshop.highlights.map((item) => (
                <Check key={item.id}>{item.text}</Check>
              ))}
            </ul>
          ) : null}
        </div>
        <AccessCard
          workshop={workshop}
          timing={timing}
          loggedIn={Boolean(session?.user)}
          hasAccess={hasAccess}
          userName={session?.user?.name}
          userEmail={session?.user?.email}
          formError={error}
        />
      </div>

      {hasAccess && timing === "past" ? (
        <section id="replay" className="mt-12">
          <h2 className="text-[22px] font-bold tracking-tight">Replay</h2>
          {replaySrc ? (
            <div className="mt-4 overflow-hidden rounded-card border border-line">
              <div className="aspect-[1460/752]">
                <iframe
                  src={replaySrc.src}
                  title={`Replay: ${workshop.title}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <p className="mt-3 text-muted">El replay se publica aquí cuando esté listo.</p>
          )}
        </section>
      ) : null}

      {workshop.hosts.length ? (
        <section className="mt-12">
          <h2 className="text-[22px] font-bold tracking-tight">Presentan</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {workshop.hosts.map((host) => (
              <div key={host.id} className="card flex gap-4 p-4">
                {host.photoPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={host.photoPath}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-surface" />
                )}
                <div>
                  <p className="font-semibold">{host.name}</p>
                  {host.role ? <p className="caption">{host.role}</p> : null}
                  {host.bio ? <p className="mt-1 text-[14px] text-muted">{host.bio}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-4 text-[14px]">
        {workshop.whatsappUrl ? (
          <a href={workshop.whatsappUrl} className="font-semibold text-accent">
            Escribir por WhatsApp
          </a>
        ) : null}
        {workshop.extraLink ? (
          <a href={workshop.extraLink} className="font-semibold text-accent">
            Más información
          </a>
        ) : null}
        <p className="text-muted">
          {workshop.locationType === "presencial"
            ? "Presencial"
            : workshop.locationType === "hibrido"
              ? "Híbrido"
              : "En línea"}
          {workshop.joinKind === "google_meet" ? " · Google Meet" : ""}
          {workshop.joinKind === "place" && workshop.meetOrPlace ? ` · ${workshop.meetOrPlace}` : ""}
        </p>
      </div>
    </div>
  );
}
