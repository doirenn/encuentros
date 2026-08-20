"use client";

import { useState } from "react";
import { saveWorkshopAction } from "@/app/actions/workshops";

type HostDraft = { name: string; role: string; bio: string; photoPath: string };

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

function toLocalInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function WorkshopForm({ initial }: { initial?: Partial<WorkshopDraft> }) {
  const [isFree, setIsFree] = useState(initial?.isFree ?? true);
  const [hosts, setHosts] = useState<HostDraft[]>(
    initial?.hosts?.length
      ? initial.hosts
      : [{ name: "", role: "", bio: "", photoPath: "" }],
  );

  return (
    <form action={saveWorkshopAction} className="space-y-8">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="hostsJson" value={JSON.stringify(hosts)} />
      <input type="hidden" name="coverPath" value={initial?.coverPath ?? ""} />

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
        <h2 className="text-[18px] font-bold">Fecha y lugar</h2>
        <label className="caption">Inicio</label>
        <input name="startsAt" type="datetime-local" className="field" required defaultValue={toLocalInput(initial?.startsAt ?? "")} />
        <label className="caption">Fin</label>
        <input name="endsAt" type="datetime-local" className="field" required defaultValue={toLocalInput(initial?.endsAt ?? "")} />
        <input name="timezone" className="field" defaultValue={initial?.timezone ?? "America/Guayaquil"} />
        <select name="locationType" className="field" defaultValue={initial?.locationType ?? "online"}>
          <option value="online">En línea</option>
          <option value="presencial">Presencial</option>
          <option value="hibrido">Híbrido</option>
        </select>
        <input name="meetOrPlace" className="field" placeholder="Sala o dirección" defaultValue={initial?.meetOrPlace} />
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
        <h2 className="text-[18px] font-bold">Presentadores</h2>
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
            <input name={`hostPhoto-${i}`} type="file" accept="image/*" className="caption" />
          </div>
        ))}
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setHosts([...hosts, { name: "", role: "", bio: "", photoPath: "" }])}
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
