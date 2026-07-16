import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import { AuthHashHandler } from "@/components/auth/AuthHashHandler";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vivilastermas.com"),
  title: "Viví las Termas | Turismo, Alojamientos y Aventuras en Calamuchita",
  description:
    "Descubrí El Durazno, Villa Yacanto y Santa Rosa de Calamuchita. Encontrá los mejores alojamientos, relajate en Termas del Sol y viví experiencias de aventura y bienestar en Córdoba.",
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
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
