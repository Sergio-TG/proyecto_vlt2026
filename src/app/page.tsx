import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { NarrativeFilter } from "@/components/home/NarrativeFilter";
import { TrustBuilders } from "@/components/home/TrustBuilders";
import { TermasTeaser } from "@/components/home/TermasTeaser";
import { FeaturedAccommodations } from "@/components/home/FeaturedAccommodations";
import { HomeVideoSection } from "@/components/home/HomeVideoSection";
import { SocialProof } from "@/components/home/SocialProof";
import { HomeSeoContent } from "@/components/home/HomeSeoContent";
import { NewsletterSignup as Newsletter } from "@/components/newsletter/NewsletterSignup";
import { HOME_VIDEOS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Viví las Termas | Cabañas y Turismo en Calamuchita",
  description:
    "Descubrí alojamientos en Villa Yacanto, El Durazno y Calamuchita. Disfrutá de Termas del Sol, relax y aventura en Córdoba. Reservá directo.",
  alternates: {
    canonical: "https://www.vivilastermas.com",
  },
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
      <HomeSeoContent />
    </div>
  );
}
