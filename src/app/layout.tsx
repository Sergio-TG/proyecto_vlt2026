"use client"; // <--- Esta línea DEBE ser la primera para que funcionen los hooks

import * as React from "react"
import { Inter } from "next/font/google";
import Script from "next/script"
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ImageKitProviderWrapper from "@/components/common/ImageKitProviderWrapper";
import WhatsAppFloatingButton from "@/components/common/WhatsAppFloatingButton";
import { CookieBanner } from "@/components/ui/CookieBanner"

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
  const [cookiesConsent, setCookiesConsent] = React.useState<"granted" | "denied" | null>(null)

  // 1. Detectamos si son rutas de paneles (Socios o Admin)
  const isSociosPage = pathname.startsWith('/socios');
  const isAdminPage = pathname.startsWith('/admin');

  // 2. Si es cualquiera de estas, ocultamos Header y Footer
  const hideLayout = isSociosPage || isAdminPage;

  React.useEffect(() => {
    const stored = window.localStorage.getItem("cookies_consent")
    if (stored === "granted" || stored === "denied") {
      setCookiesConsent(stored)
    }
  }, [])

  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="es" className="overflow-x-hidden" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col w-full max-w-full overflow-x-hidden`}
        suppressHydrationWarning
      >
        {!hideLayout && cookiesConsent === "granted" && gaMeasurementId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        ) : null}

        <ImageKitProviderWrapper>
          {!hideLayout && <Header />}
          
          <main className="flex-1 w-full max-w-full overflow-x-hidden relative">
            {children}
          </main>
          
          {!hideLayout && <Footer />}
          {!hideLayout && <WhatsAppFloatingButton />}
          {!hideLayout && <CookieBanner onConsentChange={setCookiesConsent} />}
        </ImageKitProviderWrapper>
      </body>
    </html>
  );
}
