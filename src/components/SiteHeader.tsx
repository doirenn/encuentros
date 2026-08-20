import Link from "next/link";
import { auth } from "@/auth";
import { isAdminUser } from "@/lib/admin";

const links = [
  { href: "/", label: "Próximos", tour: "proximos" },
  { href: "/calendario", label: "Calendario", tour: "calendario" },
  { href: "/replays", label: "Replays", tour: "replays" },
];

export async function SiteHeader() {
  const session = await auth();
  const admin = isAdminUser(session?.user?.email, session?.user?.role);

  return (
    <header className="border-b border-line bg-bg">
      <div className="container-app flex min-h-[72px] flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <Link href="/" className="shrink-0 text-[15px] font-bold tracking-tight text-ink">
          Encuentros
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-[13px] font-medium text-muted sm:gap-2 sm:text-[14px]">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.tour}
              className="rounded-xl px-2 py-2 text-ink hover:bg-surface sm:px-3"
            >
              {item.label}
            </Link>
          ))}
          {session?.user ? (
            <Link
              href="/cuenta"
              data-tour="cuenta"
              className="rounded-xl px-2 py-2 text-ink hover:bg-surface sm:px-3"
            >
              Mi cuenta
            </Link>
          ) : (
            <Link
              href="/login"
              data-tour="cuenta"
              className="rounded-xl px-2 py-2 text-ink hover:bg-surface sm:px-3"
            >
              Entrar
            </Link>
          )}
          {admin ? (
            <Link href="/admin" className="rounded-xl px-2 py-2 text-accent hover:bg-surface sm:px-3">
              Admin
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
