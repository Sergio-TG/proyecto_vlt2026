"use client"

import type { Metadata } from "next";
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
  const isSociosPage = pathname.startsWith('/socios');

  return (
    <html lang="es">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <ImageKitProviderWrapper>
          {!isSociosPage && <Header />}
          <main className="flex-1">
            {children}
          </main>
          {!isSociosPage && <Footer />}
        </ImageKitProviderWrapper>
      </body>
    </html>
  );
}
