import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function atHour(base: Date, daysFromNow: number, hour: number, minute = 0) {
  const date = new Date(base);
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  await prisma.access.deleteMany();
  await prisma.highlight.deleteMany();
  await prisma.host.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await hash("encuentros2026", 10);
  const anaHash = await hash("taller123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@encuentros.local",
      name: "Equipo Encuentros",
      passwordHash: adminHash,
      role: "admin",
    },
  });

  const ana = await prisma.user.create({
    data: {
      email: "ana@example.com",
      name: "Ana Ruiz",
      passwordHash: anaHash,
      role: "member",
    },
  });

  const now = new Date();

  const voz = await prisma.workshop.create({
    data: {
      title: "Tu voz como oferta: de ejecutar a orientar",
      slug: "voz-como-oferta",
      kicker: "Workshop en vivo",
      description:
        "Una sesión para ordenar cómo hablas de tu trabajo, sin inflar el precio ni esconder el valor. Saldrás con un posicionamiento que se puede decir en una frase y un cierre que no pide permiso.",
      startsAt: atHour(now, 8, 19, 0),
      endsAt: atHour(now, 8, 20, 30),
      timezone: "America/Guayaquil",
      coverPath: "/covers/voz.svg",
      videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      locationType: "online",
      joinKind: "google_meet",
      meetOrPlace: "https://meet.google.com/voz-en-vivo",
      whatsappUrl: "https://wa.me/593999000000",
      isFree: true,
      ctaLabel: "Reservar mi lugar",
      status: "published",
      highlights: {
        create: [
          { text: "Cómo dejar de competir por precio sin sonar soberbia.", sortOrder: 0 },
          { text: "Un perfil híbrido que las empresas sí entienden.", sortOrder: 1 },
          { text: "La frase de cierre que usas en llamadas esta semana.", sortOrder: 2 },
        ],
      },
      hosts: {
        create: [
          {
            name: "María Solano",
            role: "Estratega de posicionamiento",
            bio: "Acompaña a consultoras independientes a vender criterio, no horas.",
            photoPath: "/hosts/maria.svg",
            sharePercent: 40,
            sortOrder: 0,
          },
          {
            name: "Leo Andrade",
            role: "Facilitador",
            bio: "Diseña sesiones cortas que se pueden aplicar el mismo día.",
            photoPath: "/hosts/leo.svg",
            sharePercent: 20,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const lanzamiento = await prisma.workshop.create({
    data: {
      title: "Calendario de lanzamiento en 90 minutos",
      slug: "calendario-lanzamiento",
      kicker: "Workshop de pago",
      description:
        "Armamos juntos el esqueleto de un lanzamiento chico: fechas, piezas, y el mensaje de cada toque. Sin tablero infinito. Una hoja que se puede seguir.",
      startsAt: atHour(now, 22, 10, 0),
      endsAt: atHour(now, 22, 11, 30),
      timezone: "America/Guayaquil",
      coverPath: "/covers/lanzamiento.svg",
      locationType: "online",
      joinKind: "google_meet",
      meetOrPlace: "https://meet.google.com/cal-lanza",
      whatsappUrl: "https://wa.me/593999000000",
      extraLink: "https://example.com/temario-lanzamiento",
      isFree: false,
      priceAmount: 27,
      currency: "USD",
      paymentMode: "link",
      paymentValue: "https://www.mercadopago.com.ec/checkout/v1/redirect?pref_id=DEMO-LANZAMIENTO",
      ctaLabel: "Pagar e inscribirme",
      status: "published",
      highlights: {
        create: [
          { text: "El orden de las piezas, no la lista de deseos.", sortOrder: 0 },
          { text: "Qué recortar si solo tienes dos semanas.", sortOrder: 1 },
          { text: "Una plantilla de calendario para copiar.", sortOrder: 2 },
        ],
      },
      hosts: {
        create: [
          {
            name: "María Solano",
            role: "Estratega de posicionamiento",
            photoPath: "/hosts/maria.svg",
            sharePercent: 70,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const luna = await prisma.workshop.create({
    data: {
      title: "Nueva luna: ritual de enfoque para el trimestre",
      slug: "nueva-luna-enfoque",
      kicker: "Replay disponible",
      description:
        "Una práctica guiada para elegir un solo foco y soltar el resto. Grabación completa, con la hoja de trabajo al final.",
      startsAt: atHour(now, -12, 18, 0),
      endsAt: atHour(now, -12, 19, 15),
      timezone: "America/Guayaquil",
      coverPath: "/covers/luna.svg",
      videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      replayUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      locationType: "online",
      joinKind: "google_meet",
      meetOrPlace: "https://meet.google.com/luna-replay",
      isFree: false,
      priceAmount: 19,
      currency: "USD",
      paymentMode: "embed",
      paymentValue: "https://www.mercadopago.com.ec/integrations/v1/web-payment-checkout",
      ctaLabel: "Comprar replay",
      status: "published",
      highlights: {
        create: [
          { text: "Un foco para 90 días, no doce metas.", sortOrder: 0 },
          { text: "Cómo revisar el ritual cada lunes en 10 minutos.", sortOrder: 1 },
          { text: "Hoja de trabajo incluida en la grabación.", sortOrder: 2 },
        ],
      },
      hosts: {
        create: [
          {
            name: "Camila Vera",
            role: "Facilitadora",
            bio: "Diseña prácticas cortas para gente que ya está cansada de los tableros.",
            photoPath: "/hosts/camila.svg",
            sharePercent: 50,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  await prisma.workshop.create({
    data: {
      title: "Lunes de criterio: cómo elegir qué no hacer",
      slug: "lunes-de-criterio",
      kicker: "Masterclass gratuita",
      description:
        "Una clase abierta sobre el arte de recortar. Grabación disponible para quien se anote, aunque no haya estado en vivo.",
      startsAt: atHour(now, -28, 6, 30),
      endsAt: atHour(now, -28, 7, 15),
      timezone: "America/Guayaquil",
      coverPath: "/covers/lunes.svg",
      replayUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      locationType: "online",
      joinKind: "google_meet",
      meetOrPlace: "https://meet.google.com/lunes-criterio",
      whatsappUrl: "https://wa.me/593999000000",
      isFree: true,
      ctaLabel: "Ver el replay",
      status: "published",
      highlights: {
        create: [
          { text: "Tres preguntas para decir que no sin drama.", sortOrder: 0 },
          { text: "Qué hacer con la culpa de lo que queda fuera.", sortOrder: 1 },
          { text: "Un filtro para la semana que empieza.", sortOrder: 2 },
        ],
      },
      hosts: {
        create: [
          {
            name: "Leo Andrade",
            role: "Facilitador",
            photoPath: "/hosts/leo.svg",
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const extra = [];
  for (const [i, name] of ["Sofía Peña", "Diego Mora", "Elena Cruz", "Pablo Ríos"].entries()) {
    extra.push(
      await prisma.user.create({
        data: {
          email: `persona${i + 1}@example.com`,
          name,
          passwordHash: anaHash,
          role: "member",
        },
      }),
    );
  }

  await prisma.access.createMany({
    data: [
      { userId: ana.id, workshopId: luna.id, source: "pago" },
      { userId: extra[0].id, workshopId: luna.id, source: "pago" },
      { userId: extra[1].id, workshopId: luna.id, source: "pago" },
      { userId: extra[2].id, workshopId: luna.id, source: "optin" },
      { userId: extra[0].id, workshopId: lanzamiento.id, source: "pago" },
      { userId: extra[1].id, workshopId: lanzamiento.id, source: "pago" },
      { userId: extra[3].id, workshopId: lanzamiento.id, source: "pago" },
      { userId: admin.id, workshopId: voz.id, source: "admin" },
      { userId: extra[2].id, workshopId: voz.id, source: "optin" },
    ],
  });

  console.log("Seed listo: 4 workshops, admin@encuentros.local y ana@example.com");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
