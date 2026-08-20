"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Step = {
  target: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    target: "proximos",
    title: "Próximos",
    body: "Aquí están los talleres que aún no ocurren o que están en vivo ahora.",
  },
  {
    target: "calendario",
    title: "Calendario",
    body: "El mes completo: futuros y pasados. Nada se borra al terminar la fecha.",
  },
  {
    target: "replays",
    title: "Replays",
    body: "Lo que ya pasó vive aquí. Si no te anotaste, puedes comprar el replay. Si ya lo tienes, lo ves.",
  },
  {
    target: "ficha",
    title: "La ficha",
    body: "Cada taller tiene su página: inscribirte, pagar o ver el replay, según el caso.",
  },
  {
    target: "cuenta",
    title: "Tu cuenta",
    body: "Ahí quedan los accesos. Entra para ver lo que ya compraste o reservaste.",
  },
];

const STORAGE_KEY = "tour_done";

export function startTour() {
  window.dispatchEvent(new Event("encuentros:tour"));
}

export function MiniTour() {
  const pathname = usePathname();
  const [index, setIndex] = useState<number | null>(null);
  const [box, setBox] = useState<DOMRect | null>(null);

  const skipAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (skipAdmin) return;
    const done = window.localStorage.getItem(STORAGE_KEY);
    if (!done) setIndex(0);

    const open = () => setIndex(0);
    window.addEventListener("encuentros:tour", open);
    return () => window.removeEventListener("encuentros:tour", open);
  }, [skipAdmin]);

  useEffect(() => {
    if (index == null) return;
    const id = STEPS[index].target;
    const el = document.querySelector(`[data-tour="${id}"]`);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      setBox(el.getBoundingClientRect());
    } else {
      setBox(null);
    }
  }, [index]);

  if (skipAdmin || index == null) return null;

  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  function close(done: boolean) {
    if (done) window.localStorage.setItem(STORAGE_KEY, "1");
    setIndex(null);
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar guía"
        className="absolute inset-0 bg-[rgba(23,23,23,0.45)]"
        onClick={() => close(true)}
      />
      {box ? (
        <div
          className="pointer-events-none absolute rounded-[16px] ring-2 ring-white"
          style={{
            top: box.top - 6,
            left: box.left - 6,
            width: box.width + 12,
            height: box.height + 12,
            boxShadow: "0 0 0 9999px rgba(23,23,23,0.45)",
          }}
        />
      ) : null}
      <div
        className="card absolute z-10 w-[min(360px,calc(100%-32px))] p-5"
        style={{
          top: box ? Math.min(box.bottom + 12, window.innerHeight - 220) : 96,
          left: box ? Math.min(Math.max(16, box.left), window.innerWidth - 380) : 24,
        }}
      >
        <p className="kicker">Guía {index + 1} de {STEPS.length}</p>
        <h2 className="mt-2 text-[20px] font-bold tracking-tight">{step.title}</h2>
        <p className="mt-2 text-[15px] text-muted">{step.body}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button type="button" className="caption" onClick={() => close(true)}>
            Saltar
          </button>
          <button
            type="button"
            className="btn-cta w-auto px-5"
            onClick={() => {
              if (last) close(true);
              else setIndex(index + 1);
            }}
          >
            {last ? "Listo" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}
