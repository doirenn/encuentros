import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-app py-16 text-center">
      <h1 className="h1">No está esta página</h1>
      <p className="lead mt-3">Vuelve a los próximos o al archivo de replays.</p>
      <Link href="/" className="btn-cta mx-auto mt-6 max-w-xs">
        Ir a próximos
      </Link>
    </div>
  );
}
