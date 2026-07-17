import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { NarrativeFilter } from "@/components/home/NarrativeFilter";
import { TrustBuilders } from "@/components/home/TrustBuilders";
import { TermasTeaser } from "@/components/home/TermasTeaser";
import { FeaturedAccommodations } from "@/components/home/FeaturedAccommodations";
import { HomeVideoSection } from "@/components/home/HomeVideoSection";
import { SocialProof } from "@/components/home/SocialProof";
import { NewsletterSignup as Newsletter } from "@/components/newsletter/NewsletterSignup";
import { HOME_VIDEOS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Viví las Termas | Turismo, Alojamientos y Aventuras en Calamuchita",
  description:
    "Descubrí El Durazno, Villa Yacanto y Santa Rosa de Calamuchita. Encontrá los mejores alojamientos, relajate en Termas del Sol y viví experiencias de aventura y bienestar en Córdoba.",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <div id="planificar-viaje">
        <NarrativeFilter />
      </div>
      <TrustBuilders />
      <HomeVideoSection src={HOME_VIDEOS.DRON} />
      <TermasTeaser />
      <FeaturedAccommodations />
      <HomeVideoSection src={HOME_VIDEOS.PILETA} />
      <SocialProof />
      <Newsletter variant="home" />
    </div>
  );
}
