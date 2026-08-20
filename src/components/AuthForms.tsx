import { loginAction, registerAction } from "@/app/actions/auth";

export function AuthForms({
  callbackUrl,
  error,
}: {
  callbackUrl: string;
  error?: string;
}) {
  const message =
    error === "1"
      ? "Email o contraseña no coinciden."
      : error === "existe"
        ? "Ese email ya tiene cuenta. Entra aquí."
        : error === "datos"
          ? "Completa nombre, email y una contraseña de al menos 6 caracteres."
          : error === "entra"
            ? "Ese email ya existe. Entra con tu contraseña."
            : null;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form action={loginAction} className="card p-6">
        <h1 className="text-[22px] font-bold tracking-tight">Entrar</h1>
        <p className="mt-2 text-[15px] text-muted">Si ya tienes acceso a un workshop.</p>
        {message ? <p className="mt-3 text-[14px] text-[#c45c4a]">{message}</p> : null}
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="mt-5 space-y-3">
          <input name="email" type="email" className="field" placeholder="Email" required />
          <input name="password" type="password" className="field" placeholder="Contraseña" required />
          <button className="btn-cta" type="submit">
            Entrar
          </button>
        </div>
      </form>
      <form action={registerAction} className="card p-6">
        <h2 className="text-[22px] font-bold tracking-tight">Crear cuenta</h2>
        <p className="mt-2 text-[15px] text-muted">Para guardar replays y compras.</p>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="mt-5 space-y-3">
          <input name="name" className="field" placeholder="Tu nombre" required />
          <input name="email" type="email" className="field" placeholder="Email" required />
          <input
            name="password"
            type="password"
            className="field"
            placeholder="Contraseña (mínimo 6)"
            minLength={6}
            required
          />
          <button className="btn-cta" type="submit">
            Crear cuenta
          </button>
        </div>
      </form>
    </div>
  );
}
