"use client";

import { optInAction, reserveIfLoggedIn } from "@/app/actions/access";
import { formatPrice } from "@/lib/dates";
import { sanitizePaymentEmbed } from "@/lib/payment";
import type { WorkshopTiming } from "@/lib/workshop-status";

type Props = {
  workshop: {
    id: string;
    slug: string;
    isFree: boolean;
    priceAmount: number | null;
    currency: string;
    paymentMode: string | null;
    paymentValue: string | null;
    ctaLabel: string | null;
    replayUrl: string | null;
    meetOrPlace: string | null;
    joinKind?: string | null;
  };
  timing: WorkshopTiming;
  loggedIn: boolean;
  hasAccess: boolean;
  userName?: string | null;
  userEmail?: string | null;
  formError?: string;
};

export function AccessCard({
  workshop,
  timing,
  loggedIn,
  hasAccess,
  userName,
  userEmail,
  formError,
}: Props) {
  const past = timing === "past";
  const price = workshop.isFree
    ? "Gratis"
    : formatPrice(workshop.priceAmount, workshop.currency);
  const embedSrc =
    workshop.paymentMode === "embed"
      ? sanitizePaymentEmbed(workshop.paymentValue)
      : null;

  if (hasAccess && past) {
    return (
      <aside data-tour="ficha" className="card bg-surface p-6">
        <h2 className="text-[22px] font-bold tracking-tight">Ver replay</h2>
        <p className="mt-2 text-[15px] text-muted">
          {workshop.replayUrl
            ? "Ya tienes acceso. El video está en esta página."
            : "Ya tienes acceso. El replay se publica aquí cuando esté listo."}
        </p>
        {workshop.replayUrl ? (
          <a className="btn-cta mt-5" href="#replay">
            Ir al replay
          </a>
        ) : (
          <p className="caption mt-4">Te avisamos en esta misma ficha.</p>
        )}
      </aside>
    );
  }

  if (hasAccess) {
    const joinKind = workshop.joinKind || "google_meet";
    const joinUrl = workshop.meetOrPlace;
    const isMeet = joinKind === "google_meet";
    const canJoin = Boolean(joinUrl) && (isMeet || joinKind === "link");
    return (
      <aside data-tour="ficha" className="card bg-surface p-6">
        <h2 className="text-[22px] font-bold tracking-tight">Ya estás dentro</h2>
        {timing === "live" ? (
          <p className="mt-3 text-[14px] font-semibold text-accent">Está ocurriendo ahora.</p>
        ) : (
          <p className="mt-2 text-[15px] text-muted">
            {canJoin
              ? isMeet
                ? "Entra a la sala con Google Meet a la hora del evento."
                : "Usa este enlace a la hora del evento."
              : joinKind === "place"
                ? joinUrl || "El lugar se confirma aquí."
                : "El enlace de Meet aparece aquí cuando esté listo."}
          </p>
        )}
        {canJoin ? (
          <a className="btn-cta mt-5" href={joinUrl ?? "#"} target="_blank" rel="noreferrer">
            {isMeet ? "Unirse con Google Meet" : "Unirse al vivo"}
          </a>
        ) : null}
        {joinKind === "place" && joinUrl ? (
          <p className="mt-4 text-[15px] font-medium">{joinUrl}</p>
        ) : null}
      </aside>
    );
  }

  const heading = past
    ? workshop.isFree
      ? "Desbloquear el replay"
      : "Comprar replay"
    : workshop.isFree
      ? "¿A dónde te enviamos el acceso?"
      : workshop.ctaLabel || "Inscribirme";

  const sub = past
    ? workshop.isFree
      ? "Deja tus datos y el replay queda en tu cuenta."
      : `Acceso inmediato al replay. ${price}.`
    : workshop.isFree
      ? "Acceso inmediato. Sin costo. La clase queda en tu cuenta cuando termine."
      : `${price}. Pagas y el acceso queda ligado a tu cuenta.`;

  return (
    <aside data-tour="ficha" className="card bg-surface p-6">
      <h2 className="text-[22px] font-bold tracking-tight">{heading}</h2>
      <p className="mt-2 text-[15px] text-muted">{sub}</p>
      {formError === "datos" ? (
        <p className="mt-3 text-[14px] text-[#c45c4a]">
          Completa nombre, email y una contraseña de al menos 6 caracteres.
        </p>
      ) : null}

      {!loggedIn && workshop.isFree ? (
        <form action={optInAction} className="mt-5 space-y-3">
          <input type="hidden" name="workshopId" value={workshop.id} />
          <input type="hidden" name="slug" value={workshop.slug} />
          <input name="name" className="field" placeholder="Tu nombre" required defaultValue={userName ?? ""} />
          <input
            name="email"
            type="email"
            className="field"
            placeholder="Tu mejor email"
            required
            defaultValue={userEmail ?? ""}
          />
          <input
            name="password"
            type="password"
            className="field"
            placeholder="Elige una contraseña"
            minLength={6}
            required
          />
          <button className="btn-cta" type="submit">
            {past ? "Ver el replay" : workshop.ctaLabel || "Reservar mi lugar"}
          </button>
          <p className="caption text-center">Datos protegidos. Sin spam.</p>
        </form>
      ) : null}

      {loggedIn && workshop.isFree ? (
        <form action={reserveIfLoggedIn} className="mt-5">
          <input type="hidden" name="workshopId" value={workshop.id} />
          <input type="hidden" name="slug" value={workshop.slug} />
          <button className="btn-cta" type="submit">
            {past ? "Desbloquear replay" : workshop.ctaLabel || "Reservar mi lugar"}
          </button>
        </form>
      ) : null}

      {!workshop.isFree ? (
        <div className="mt-5 space-y-3">
          {!loggedIn ? (
            <p className="text-[14px] text-muted">
              Primero{" "}
              <a className="font-semibold text-accent" href={`/login?callbackUrl=/w/${workshop.slug}`}>
                entra o crea tu cuenta
              </a>
              . Así el pago queda ligado a ti.
            </p>
          ) : (
            <>
              {workshop.paymentMode === "link" && workshop.paymentValue ? (
                <a
                  className="btn-cta"
                  href={workshop.paymentValue}
                  target="_blank"
                  rel="noreferrer"
                >
                  {past ? "Comprar replay" : workshop.ctaLabel || "Pagar e inscribirme"}
                </a>
              ) : null}
              {embedSrc ? (
                <iframe
                  src={embedSrc}
                  title="Pago"
                  className="h-[360px] w-full rounded-[12px] bg-white"
                />
              ) : null}
              <form
                action={`/w/${workshop.slug}/gracias`}
                method="get"
                className="pt-1"
              >
                <button type="submit" className="btn-ghost w-full text-accent">
                  Ya pagué
                </button>
              </form>
            </>
          )}
        </div>
      ) : null}
    </aside>
  );
}
