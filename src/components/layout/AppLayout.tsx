"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ImageKitProviderWrapper from "@/components/common/ImageKitProviderWrapper";
import WhatsAppFloatingButton from "@/components/common/WhatsAppFloatingButton";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { GoogleAnalyticsConsent } from "@/components/analytics/GoogleAnalyticsConsent";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Paneles internos: sin chrome público (Header/Footer/WhatsApp/cookies)
  const hideLayout =
    pathname.startsWith("/socios/portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login");

  return (
    <ImageKitProviderWrapper>
      <LanguageProvider>
        {!hideLayout && <Header />}

        <main className="flex-1 w-full max-w-full overflow-x-hidden relative">
          {children}
        </main>

        {!hideLayout && <Footer />}
        {!hideLayout && <WhatsAppFloatingButton />}
        {!hideLayout && <CookieBanner />}
        <GoogleAnalyticsConsent />
      </LanguageProvider>
    </ImageKitProviderWrapper>
  );
}
