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

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!isAdminUser(session.user.email, session.user.role)) {
    redirect("/");
  }
  return session;
}
