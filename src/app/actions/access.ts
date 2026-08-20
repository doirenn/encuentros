"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { adminEmails, requireAdmin, requireSession } from "@/lib/admin";

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

export async function optInAction(formData: FormData) {
  const workshopId = String(formData.get("workshopId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } });
  if (!workshop || workshop.status !== "published") redirect("/");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/w/${slug}`)}&error=entra`);
  }

  if (!name || !email || password.length < 6) {
    redirect(`/w/${slug}?error=datos`);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hash(password, 10),
      role: adminEmails().includes(email) ? "admin" : "member",
    },
  });

  await prisma.access.create({
    data: { userId: user.id, workshopId, source: "optin" },
  });

  try {
    await signIn("credentials", {
      email,
      password: password || "x",
      redirectTo: `/w/${slug}`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?callbackUrl=${encodeURIComponent(`/w/${slug}`)}&error=entra`);
    }
    throw error;
  }
}

export async function reserveIfLoggedIn(formData: FormData) {
  const session = await requireSession();
  const workshopId = String(formData.get("workshopId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  await prisma.access.upsert({
    where: { userId_workshopId: { userId: session.user.id, workshopId } },
    create: { userId: session.user.id, workshopId, source: "optin" },
    update: {},
  });
  redirect(`/w/${slug}`);
}

export async function grantAccessAction(formData: FormData) {
  await requireAdmin();
  const workshopId = String(formData.get("workshopId") ?? "");
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    redirect(`/admin/workshops/${workshopId}/accesos?error=nouser`);
  }
  await prisma.access.upsert({
    where: { userId_workshopId: { userId: user.id, workshopId } },
    create: { userId: user.id, workshopId, source: "admin" },
    update: {},
  });
  redirect(`/admin/workshops/${workshopId}/accesos`);
}

export async function revokeAccessAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("accessId") ?? "");
  const workshopId = String(formData.get("workshopId") ?? "");
  await prisma.access.delete({ where: { id } });
  redirect(`/admin/workshops/${workshopId}/accesos`);
}
