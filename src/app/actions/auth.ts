"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { adminEmails } from "@/lib/admin";

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const requested = String(formData.get("callbackUrl") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  const isAdmin = user?.role === "admin" || adminEmails().includes(email);
  const callbackUrl =
    requested && requested !== "/cuenta"
      ? requested
      : isAdmin
        ? "/admin"
        : "/cuenta";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/cuenta");

  if (!name || !email || password.length < 6) {
    redirect(`/login?error=datos&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/login?error=existe&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const role = adminEmails().includes(email) ? "admin" : "member";
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hash(password, 10),
      role,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/cuenta",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw error;
  }
}

export async function logoutAction(formData?: FormData) {
  const next = String(formData?.get("next") ?? "/");
  await signOut({ redirectTo: next || "/" });
}
