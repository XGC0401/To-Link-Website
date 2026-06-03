import type { Metadata } from "next";
import { cookies } from "next/headers";
import "leaflet/dist/leaflet.css";
import { Fraunces, Manrope } from "next/font/google";
import { UI_COOKIE_NAMES } from "@/lib/app-config";
import { resolveStoredPreferences } from "@/lib/preferences";
import { Providers } from "./providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "To-Link",
  description:
    "A modern neighborhood lifestyle platform for community posts, quests, bookings, and connections.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialPreferences = resolveStoredPreferences({
    theme: cookieStore.get(UI_COOKIE_NAMES.theme)?.value,
    fontScale: cookieStore.get(UI_COOKIE_NAMES.fontScale)?.value,
    language: cookieStore.get(UI_COOKIE_NAMES.language)?.value,
  });

  return (
    <html
      lang={initialPreferences.language}
      data-theme={initialPreferences.theme}
      data-font-scale={initialPreferences.fontScale}
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-hidden bg-background text-foreground">
        <Providers initialPreferences={initialPreferences}>{children}</Providers>
      </body>
    </html>
  );
}
