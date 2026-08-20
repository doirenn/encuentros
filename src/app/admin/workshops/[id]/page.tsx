import { notFound } from "next/navigation";
import { WorkshopForm } from "@/components/admin/WorkshopForm";
import { prisma } from "@/lib/prisma";

export default async function EditWorkshopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: {
      highlights: { orderBy: { sortOrder: "asc" } },
      hosts: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!workshop) notFound();

  return (
    <div className="py-2">
      <p className="kicker">Panel</p>
      <h1 className="h1 mt-3 mb-8">Editar workshop</h1>
      <WorkshopForm
        initial={{
          id: workshop.id,
          title: workshop.title,
          slug: workshop.slug,
          kicker: workshop.kicker,
          description: workshop.description,
          startsAt: workshop.startsAt.toISOString(),
          endsAt: workshop.endsAt.toISOString(),
          timezone: workshop.timezone,
          coverPath: workshop.coverPath ?? "",
          videoUrl: workshop.videoUrl ?? "",
          locationType: workshop.locationType,
          joinKind: workshop.joinKind,
          meetOrPlace: workshop.meetOrPlace ?? "",
          whatsappUrl: workshop.whatsappUrl ?? "",
          extraLink: workshop.extraLink ?? "",
          isFree: workshop.isFree,
          priceAmount: workshop.priceAmount != null ? String(workshop.priceAmount) : "",
          currency: workshop.currency,
          paymentMode: workshop.paymentMode ?? "link",
          paymentValue: workshop.paymentValue ?? "",
          replayUrl: workshop.replayUrl ?? "",
          ctaLabel: workshop.ctaLabel ?? "",
          status: workshop.status,
          highlights: workshop.highlights.map((h) => h.text).join("\n"),
          hosts: workshop.hosts.map((h) => ({
            name: h.name,
            role: h.role ?? "",
            bio: h.bio ?? "",
            photoPath: h.photoPath ?? "",
            sharePercent: String(h.sharePercent ?? 0),
          })),
        }}
      />
    </div>
  );
}
