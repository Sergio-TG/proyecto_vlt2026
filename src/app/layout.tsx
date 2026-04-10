"use client"; // <--- Esta línea DEBE ser la primera para que funcionen los hooks

import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ImageKitProviderWrapper from "@/components/common/ImageKitProviderWrapper";
import WhatsAppFloatingButton from "@/components/common/WhatsAppFloatingButton";

// IMPORTACIÓN FALTANTE:
import { usePathname } from 'next/navigation'; 

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

  // 1. Detectamos si son rutas de paneles (Socios o Admin)
  const isSociosPage = pathname.startsWith('/socios');
  const isAdminPage = pathname.startsWith('/admin');

  // 2. Si es cualquiera de estas, ocultamos Header y Footer
  const hideLayout = isSociosPage || isAdminPage;

  return (
    <html lang="es" className="overflow-x-hidden">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col w-full max-w-full overflow-x-hidden`}>
        <ImageKitProviderWrapper>
          {!hideLayout && <Header />}
          
          <main className="flex-1 w-full max-w-full overflow-x-hidden relative">
            {children}
          </main>
          
          {!hideLayout && <Footer />}
          {!hideLayout && <WhatsAppFloatingButton />}
        </ImageKitProviderWrapper>
      </body>
    </html>
  );
}
