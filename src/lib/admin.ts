import { redirect } from "next/navigation";
import { auth } from "@/auth";

export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(email?: string | null, role?: string | null) {
  if (role === "admin") return true;
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

export async function requireSession(callbackUrl = "/cuenta") {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession("/admin");
  if (!isAdminUser(session.user.email, session.user.role)) {
    redirect("/login?error=admin&callbackUrl=/admin");
  }
  return session;
}
