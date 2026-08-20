"use client";

import { useMemo, useState } from "react";
import { saveWorkshopAction } from "@/app/actions/workshops";
import {
  EVENT_TIMEZONES,
  dateToZonedInput,
  previewTimes,
  zonedInputToDate,
} from "@/lib/timezone";

type HostDraft = {
  name: string;
  role: string;
  bio: string;
  photoPath: string;
  sharePercent: string;
};

type WorkshopDraft = {
  id?: string;
  title: string;
  slug: string;
  kicker: string;
  description: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  coverPath: string;
  videoUrl: string;
  locationType: string;
  joinKind: string;
  meetOrPlace: string;
  whatsappUrl: string;
  extraLink: string;
  isFree: boolean;
  priceAmount: string;
  currency: string;
  paymentMode: string;
  paymentValue: string;
  replayUrl: string;
  ctaLabel: string;
  status: string;
  highlights: string;
  hosts: HostDraft[];
};

const JOIN_KINDS = [
  { id: "google_meet", label: "Google Meet" },
  { id: "link", label: "Otro enlace" },
  { id: "place", label: "Lugar físico" },
] as const;

export function WorkshopForm({ initial }: { initial?: Partial<WorkshopDraft> }) {
  const [isFree, setIsFree] = useState(initial?.isFree ?? true);
  const [timezone, setTimezone] = useState(initial?.timezone ?? "America/Guayaquil");
  const [joinKind, setJoinKind] = useState(initial?.joinKind ?? "google_meet");
  const [startsAt, setStartsAt] = useState(() =>
    initial?.startsAt ? dateToZonedInput(new Date(initial.startsAt), initial.timezone ?? timezone) : "",
  );
  const [endsAt, setEndsAt] = useState(() =>
    initial?.endsAt ? dateToZonedInput(new Date(initial.endsAt), initial.timezone ?? timezone) : "",
  );
  const [hosts, setHosts] = useState<HostDraft[]>(
    initial?.hosts?.length
      ? initial.hosts
      : [{ name: "", role: "", bio: "", photoPath: "", sharePercent: "0" }],
  );

  const shareTotal = hosts.reduce((sum, host) => sum + Number(host.sharePercent || 0), 0);
  const houseShare = Math.max(0, 100 - shareTotal);
  const previews = useMemo(() => {
    if (!startsAt) return [];
    try {
      return previewTimes(zonedInputToDate(startsAt, timezone), timezone);
    } catch {
      return [];
    }
  }, [startsAt, timezone]);

  const joinPlaceholder =
    joinKind === "google_meet"
      ? "https://meet.google.com/xxx-xxxx-xxx"
      : joinKind === "link"
        ? "https://"
        : "Dirección o ciudad";

  return (
    <form action={saveWorkshopAction} className="space-y-8">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="hostsJson" value={JSON.stringify(hosts)} />
      <input type="hidden" name="coverPath" value={initial?.coverPath ?? ""} />
      <input type="hidden" name="joinKind" value={joinKind} />
      <input type="hidden" name="timezone" value={timezone} />

      <section className="card space-y-4 p-6">
        <h2 className="text-[18px] font-bold">Datos</h2>
        <input name="title" className="field" placeholder="Título" defaultValue={initial?.title} required />
        <input name="slug" className="field" placeholder="Slug (opcional)" defaultValue={initial?.slug} />
        <input name="kicker" className="field" placeholder="Kicker, ej. Workshop en vivo" defaultValue={initial?.kicker} />
        <textarea name="description" className="field" placeholder="Descripción" defaultValue={initial?.description} />
        <input name="ctaLabel" className="field" placeholder="Texto del botón (opcional)" defaultValue={initial?.ctaLabel} />
        <select name="status" className="field" defaultValue={initial?.status ?? "published"}>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
        </select>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-[18px] font-bold">Media</h2>
        <label className="caption block">Portada (1460 x 752 aprox.)</label>
        <input name="cover" type="file" accept="image/*" className="caption" />
        {initial?.coverPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={initial.coverPath} alt="" className="max-h-40 rounded-xl object-cover" />
        ) : null}
        <input name="videoUrl" className="field" placeholder="URL de YouTube o Vimeo" defaultValue={initial?.videoUrl} />
        <input name="replayUrl" className="field" placeholder="URL del replay (puede ir después)" defaultValue={initial?.replayUrl} />
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-[18px] font-bold">Fecha y zona horaria</h2>
        <p className="caption">
          Escribes la hora del lugar del evento. Quien visita la ficha ve su hora local en automático.
        </p>
        <label className="caption">Zona del evento</label>
        <select
          className="field"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {EVENT_TIMEZONES.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.label}
            </option>
          ))}
        </select>
        <label className="caption">Inicio</label>
        <input
          name="startsAt"
          type="datetime-local"
          className="field"
          required
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
        />
        <label className="caption">Fin</label>
        <input
          name="endsAt"
          type="datetime-local"
          className="field"
          required
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
        />
        {previews.length ? (
          <ul className="grid gap-2 rounded-xl bg-surface p-4 text-[13px] sm:grid-cols-2">
            {previews.map((item) => (
              <li key={item.id} className={item.event ? "font-semibold text-ink" : "text-muted"}>
                {item.city}: {item.clock}
                {item.event ? " (evento)" : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-[18px] font-bold">Cómo se unen en vivo</h2>
        <div className="flex flex-wrap gap-2">
          {JOIN_KINDS.map((kind) => (
            <button
              key={kind.id}
              type="button"
              onClick={() => setJoinKind(kind.id)}
              className={`rounded-xl px-4 py-2 text-[14px] font-semibold ${
                joinKind === kind.id ? "bg-ink text-white" : "bg-surface text-ink"
              }`}
            >
              {kind.label}
            </button>
          ))}
        </div>
        <select name="locationType" className="field" defaultValue={initial?.locationType ?? "online"}>
          <option value="online">En línea</option>
          <option value="presencial">Presencial</option>
          <option value="hibrido">Híbrido</option>
        </select>
        <input
          name="meetOrPlace"
          className="field"
          placeholder={joinPlaceholder}
          defaultValue={initial?.meetOrPlace}
        />
        {joinKind === "google_meet" ? (
          <p className="caption">Pega el link de Meet. Solo se muestra a quien ya tiene acceso.</p>
        ) : null}
        <input name="whatsappUrl" className="field" placeholder="Link de WhatsApp" defaultValue={initial?.whatsappUrl} />
        <input name="extraLink" className="field" placeholder="Link extra" defaultValue={initial?.extraLink} />
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-[18px] font-bold">Qué van a llevar (un beneficio por línea)</h2>
        <textarea
          name="highlights"
          className="field min-h-[140px]"
          defaultValue={initial?.highlights}
          placeholder="Cómo dejar de competir por precio."
        />
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-[18px] font-bold">Presentadores y split de ganancias</h2>
        <p className="caption">
          El porcentaje es sobre el bruto de ese workshop (pagos × precio). Lo que no asignes queda en casa.
        </p>
        {hosts.map((host, i) => (
          <div key={i} className="space-y-2 rounded-xl bg-surface p-4">
            <input
              className="field"
              placeholder="Nombre"
              value={host.name}
              onChange={(e) => {
                const next = [...hosts];
                next[i] = { ...host, name: e.target.value };
                setHosts(next);
              }}
            />
            <input
              className="field"
              placeholder="Rol"
              value={host.role}
              onChange={(e) => {
                const next = [...hosts];
                next[i] = { ...host, role: e.target.value };
                setHosts(next);
              }}
            />
            <input
              className="field"
              placeholder="Bio corta"
              value={host.bio}
              onChange={(e) => {
                const next = [...hosts];
                next[i] = { ...host, bio: e.target.value };
                setHosts(next);
              }}
            />
            <label className="caption">Porcentaje de ganancia</label>
            <input
              className="field"
              type="number"
              min={0}
              max={100}
              step={1}
              value={host.sharePercent}
              onChange={(e) => {
                const next = [...hosts];
                next[i] = { ...host, sharePercent: e.target.value };
                setHosts(next);
              }}
            />
            <input name={`hostPhoto-${i}`} type="file" accept="image/*" className="caption" />
          </div>
        ))}
        <p className={`text-[14px] ${shareTotal > 100 ? "text-[#c45c4a]" : "text-muted"}`}>
          Presentadores {shareTotal}% · Casa {houseShare}%
          {shareTotal > 100 ? " · Baja el total a 100 o se prorratea." : ""}
        </p>
        <button
          type="button"
          className="btn-ghost"
          onClick={() =>
            setHosts([...hosts, { name: "", role: "", bio: "", photoPath: "", sharePercent: "0" }])
          }
        >
          Agregar presentador
        </button>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-[18px] font-bold">Precio y pago</h2>
        <label className="flex items-center gap-2 text-[14px]">
          <input
            name="isFree"
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
          />
          Gratis
        </label>
        {!isFree ? (
          <>
            <input name="priceAmount" type="number" step="0.01" className="field" placeholder="Precio" defaultValue={initial?.priceAmount} />
            <input name="currency" className="field" defaultValue={initial?.currency ?? "USD"} />
            <select name="paymentMode" className="field" defaultValue={initial?.paymentMode ?? "link"}>
              <option value="link">Link de pago</option>
              <option value="embed">Embed (iframe Mercado Pago)</option>
            </select>
            <textarea
              name="paymentValue"
              className="field"
              placeholder="URL de checkout o código embed de Mercado Pago"
              defaultValue={initial?.paymentValue}
            />
          </>
        ) : null}
      </section>

      <button className="btn-cta max-w-xs" type="submit">
        Guardar
      </button>
    </form>
  );
}
