import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import { AuthHashHandler } from "@/components/auth/AuthHashHandler";
import { ContentProtection } from "@/components/security/ContentProtection";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vivilastermas.com"),
  title: "Viví las Termas | Cabañas y Turismo en Calamuchita",
  description:
    "Descubrí alojamientos en Villa Yacanto, El Durazno y Calamuchita. Disfrutá de Termas del Sol, relax y aventura en Córdoba. Reservá directo.",
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "tjtauvDK55msL6idEB1JQDZbL8jmyL4nCloRk3V9LoY",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col w-full max-w-full overflow-x-hidden`} suppressHydrationWarning>
        <AuthHashHandler />
        <ContentProtection />
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
