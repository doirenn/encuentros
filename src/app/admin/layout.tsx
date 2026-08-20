import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminDenied } from "@/components/admin/AdminDenied";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdminUser } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }
  if (!isAdminUser(session.user.email, session.user.role)) {
    return <AdminDenied />;
  }
  return <AdminShell>{children}</AdminShell>;
}
