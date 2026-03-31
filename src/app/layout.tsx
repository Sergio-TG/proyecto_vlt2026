"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { usePathname } from 'next/navigation';
import ImageKitProviderWrapper from "@/components/common/ImageKitProviderWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isMaintenanceMode = pathname === '/';
  const isSociosPage = pathname.startsWith('/socios');
  const hideLayout = isMaintenanceMode || isSociosPage;

  return (
    // Agregamos overflow-x-hidden al HTML para mayor seguridad
    <html lang="es" className="overflow-x-hidden">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col w-full max-w-full overflow-x-hidden`}
      >
        <ImageKitProviderWrapper>
          {!hideLayout && <Header />}
          
          {/* IMPORTANTE: Usamos 'w-full' en lugar de 'w-screen' para evitar 
            que la barra de scroll vertical empuje el contenido hacia los lados.
          */}
          <main className="flex-1 w-full max-w-full overflow-x-hidden relative">
            {children}
          </main>
          
          {!hideLayout && <Footer />}
        </ImageKitProviderWrapper>
      </body>
    </html>
  );
}