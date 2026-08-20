import { AuthForms } from "@/components/AuthForms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/cuenta";
  const admin = callbackUrl.startsWith("/admin") || params.error === "admin";

  return (
    <div className="container-app py-12 sm:py-16">
      <p className="kicker">{admin ? "Panel" : "Cuenta"}</p>
      <h1 className="h1 mt-3 mb-8">
        {admin ? "Entra para publicar workshops" : "Entra o crea tu acceso"}
      </h1>
      <AuthForms callbackUrl={callbackUrl} error={params.error} admin={admin} />
    </div>
  );
}
