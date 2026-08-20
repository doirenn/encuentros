import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function GraciasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/w/${slug}/gracias`)}`);
  }

  const workshop = await prisma.workshop.findUnique({ where: { slug } });
  if (!workshop) redirect("/");

  await prisma.access.upsert({
    where: {
      userId_workshopId: { userId: session.user.id, workshopId: workshop.id },
    },
    create: {
      userId: session.user.id,
      workshopId: workshop.id,
      source: "pago",
    },
    update: {},
  });

  return (
    <div className="container-app py-16">
      <div className="card mx-auto max-w-lg p-8 text-center">
        <p className="kicker">Listo</p>
        <h1 className="h1 mt-3">Acceso guardado</h1>
        <p className="lead mt-4">
          {workshop.title} ya está en tu cuenta. Puedes ver el replay o volver el día del encuentro.
        </p>
        <Link href={`/w/${slug}`} className="btn-cta mt-6">
          Ir a la ficha
        </Link>
      </div>
    </div>
  );
}
