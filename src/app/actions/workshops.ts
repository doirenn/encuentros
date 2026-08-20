"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slug";
import { sanitizePaymentEmbed } from "@/lib/payment";
import { isGoogleMeetUrl, zonedInputToDate } from "@/lib/timezone";

async function saveUpload(file: File | null, folder: "covers" | "hosts") {
  if (!file || file.size === 0) return null;
  const ext = path.extname(file.name).toLowerCase() || ".bin";
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  if (!allowed.includes(ext)) return null;
  const dir = path.join(process.cwd(), "public", folder);
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return `/${folder}/${filename}`;
}

type HostInput = {
  name: string;
  role: string;
  bio: string;
  photoPath: string;
  sharePercent?: string | number;
};

export async function saveWorkshopAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/admin/workshops/new");

  let slug = slugify(String(formData.get("slug") ?? "") || title);
  const existingSlug = await prisma.workshop.findUnique({ where: { slug } });
  if (existingSlug && existingSlug.id !== id) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const isFree = formData.get("isFree") === "on";
  const paymentMode = isFree ? null : String(formData.get("paymentMode") ?? "link");
  let paymentValue = isFree ? null : String(formData.get("paymentValue") ?? "").trim() || null;
  if (paymentMode === "embed" && paymentValue) {
    paymentValue = sanitizePaymentEmbed(paymentValue);
  }

  const coverFile = formData.get("cover") as File | null;
  const coverUpload = await saveUpload(coverFile, "covers");
  const coverFallback = String(formData.get("coverPath") ?? "").trim() || null;

  const hostsRaw = String(formData.get("hostsJson") ?? "[]");
  let hosts: HostInput[] = [];
  try {
    hosts = JSON.parse(hostsRaw) as HostInput[];
  } catch {
    hosts = [];
  }

  for (let i = 0; i < hosts.length; i += 1) {
    const file = formData.get(`hostPhoto-${i}`) as File | null;
    const uploaded = await saveUpload(file, "hosts");
    if (uploaded) hosts[i].photoPath = uploaded;
  }

  const highlights = String(formData.get("highlights") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const timezone = String(formData.get("timezone") ?? "America/Guayaquil");
  const joinKind = String(formData.get("joinKind") ?? "google_meet");
  let meetOrPlace = String(formData.get("meetOrPlace") ?? "").trim() || null;
  if (joinKind === "google_meet" && meetOrPlace && !isGoogleMeetUrl(meetOrPlace)) {
    meetOrPlace = meetOrPlace.startsWith("http") ? meetOrPlace : `https://meet.google.com/${meetOrPlace}`;
  }

  const data = {
    title,
    slug,
    kicker: String(formData.get("kicker") ?? "").trim() || "Workshop",
    description: String(formData.get("description") ?? "").trim(),
    startsAt: zonedInputToDate(String(formData.get("startsAt")), timezone),
    endsAt: zonedInputToDate(String(formData.get("endsAt")), timezone),
    timezone,
    coverPath: coverUpload ?? coverFallback,
    videoUrl: String(formData.get("videoUrl") ?? "").trim() || null,
    locationType: String(formData.get("locationType") ?? "online"),
    joinKind,
    meetOrPlace,
    whatsappUrl: String(formData.get("whatsappUrl") ?? "").trim() || null,
    extraLink: String(formData.get("extraLink") ?? "").trim() || null,
    isFree,
    priceAmount: isFree ? null : Number(formData.get("priceAmount") || 0),
    currency: String(formData.get("currency") ?? "USD"),
    paymentMode,
    paymentValue,
    replayUrl: String(formData.get("replayUrl") ?? "").trim() || null,
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim() || null,
    status: String(formData.get("status") ?? "draft"),
  };

  const workshop = id
    ? await prisma.workshop.update({
        where: { id },
        data: {
          ...data,
          highlights: { deleteMany: {} },
          hosts: { deleteMany: {} },
        },
      })
    : await prisma.workshop.create({ data });

  if (highlights.length) {
    await prisma.highlight.createMany({
      data: highlights.map((text, sortOrder) => ({
        workshopId: workshop.id,
        text,
        sortOrder,
      })),
    });
  }

  const namedHosts = hosts.filter((h) => h.name.trim());
  if (namedHosts.length) {
    await prisma.host.createMany({
      data: namedHosts.map((host, sortOrder) => ({
        workshopId: workshop.id,
        name: host.name.trim(),
        role: host.role.trim() || null,
        bio: host.bio.trim() || null,
        photoPath: host.photoPath.trim() || null,
        sharePercent: Math.max(0, Number(host.sharePercent || 0)),
        sortOrder,
      })),
    });
  }

  redirect(`/admin/workshops/${workshop.id}`);
}

export async function deleteWorkshopAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.workshop.delete({ where: { id } });
  redirect("/admin/workshops");
}
