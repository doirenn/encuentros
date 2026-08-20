import { logoutAction } from "@/app/actions/auth";

export function AdminDenied() {
  return (
    <div className="container-app py-16">
      <div className="card mx-auto max-w-lg p-8">
        <p className="kicker">Panel</p>
        <h1 className="h1 mt-3">Esta cuenta no publica</h1>
        <p className="lead mt-4">
          El panel es solo para quien crea los workshops. Sal y entra con la cuenta de administración.
        </p>
        <p className="mt-4 text-[14px] text-muted">
          En local: <span className="font-semibold text-ink">admin@encuentros.local</span> /{" "}
          <span className="font-semibold text-ink">encuentros2026</span>
        </p>
        <form action={logoutAction} className="mt-6">
          <input type="hidden" name="next" value="/login?callbackUrl=/admin" />
          <button className="btn-cta" type="submit">
            Salir y entrar como admin
          </button>
        </form>
      </div>
    </div>
  );
}
