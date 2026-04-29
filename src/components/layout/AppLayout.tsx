"use client";

import * as React from "react";
import { usePathname } from 'next/navigation';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ImageKitProviderWrapper from "@/components/common/ImageKitProviderWrapper";
import WhatsAppFloatingButton from "@/components/common/WhatsAppFloatingButton";
import { CookieBanner } from "@/components/ui/CookieBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cookiesConsent, setCookiesConsent] = React.useState<"granted" | "denied" | null>(null);

  // Definimos qué rutas NO deben mostrar Header/Footer (paneles y página de mantenimiento)
  const isSociosPage = pathname.startsWith('/socios');
  const isAdminPage = pathname.startsWith('/admin');
  const isMaintenancePage = pathname === '/en-construccion';
  
  const hideLayout = isSociosPage || isAdminPage || isMaintenancePage;

  React.useEffect(() => {
    const stored = window.localStorage.getItem("cookies_consent");
    if (stored === "granted" || stored === "denied") {
      setCookiesConsent(stored);
    }
  }, []);

  return (
    <ImageKitProviderWrapper>
      {!hideLayout && <Header />}
      
      <main className="flex-1 w-full max-w-full overflow-x-hidden relative">
        {children}
      </main>
      
      {!hideLayout && <Footer />}
      {!hideLayout && <WhatsAppFloatingButton />}
      {!hideLayout && <CookieBanner onConsentChange={setCookiesConsent} />}
    </ImageKitProviderWrapper>
  );
}