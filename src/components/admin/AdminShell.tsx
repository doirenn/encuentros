import Link from "next/link";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/workshops", label: "Workshops" },
  { href: "/admin/workshops/new", label: "Nuevo workshop" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-line bg-surface">
      <div className="container-app grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="card h-fit p-4">
          <p className="px-3 pb-3 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Panel
          </p>
          <nav className="flex flex-col gap-1 text-[14px] font-semibold">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2 text-ink hover:bg-surface">
                {item.label}
              </Link>
            ))}
            <Link href="/" className="rounded-xl px-3 py-2 text-muted hover:bg-surface">
              Ver sitio
            </Link>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
