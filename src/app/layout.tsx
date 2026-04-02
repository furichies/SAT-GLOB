import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Micro1475 - Tienda de Informática y Servicio Técnico",
  description: "Tienda online de informática con servicio técnico especializado. Equipos, componentes, reparaciones y soporte técnico profesional.",
  keywords: ["informática", "ordenadores", "componentes", "reparaciones", "SAT", "servicio técnico"],
  authors: [{ name: "Micro1475 Team" }],
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico' } // Fallback
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  openGraph: {
    title: "Micro1475 - Tienda de Informática y SAT",
    description: "Tu tienda de confianza para equipos informáticos y servicio técnico",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Micro1475 - Tienda de Informática",
    description: "Equipos, componentes y servicio técnico profesional",
  },
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <SessionProvider session={session}>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
