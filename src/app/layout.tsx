import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { MiniTour } from "@/components/MiniTour";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Encuentros",
  description: "Workshops en vivo y replays que no desaparecen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg font-sans text-ink">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <MiniTour />
      </body>
    </html>
  );
}
