import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/home/Hero";
import { NarrativeFilter } from "@/components/home/NarrativeFilter";
import { TrustBuilders } from "@/components/home/TrustBuilders";
import { HOME_VIDEOS } from "@/lib/constants";

const HomeVideoSection = dynamic(
  () =>
    import("@/components/home/HomeVideoSection").then((m) => m.HomeVideoSection),
  { ssr: true },
);

const TermasTeaser = dynamic(
  () => import("@/components/home/TermasTeaser").then((m) => m.TermasTeaser),
  { ssr: true },
);

const FeaturedAccommodations = dynamic(
  () =>
    import("@/components/home/FeaturedAccommodations").then(
      (m) => m.FeaturedAccommodations,
    ),
  { ssr: true },
);

const SocialProof = dynamic(
  () => import("@/components/home/SocialProof").then((m) => m.SocialProof),
  { ssr: true },
);

const Newsletter = dynamic(
  () =>
    import("@/components/newsletter/NewsletterSignup").then(
      (m) => m.NewsletterSignup,
    ),
  { ssr: true },
);

const HomeSeoContent = dynamic(
  () =>
    import("@/components/home/HomeSeoContent").then((m) => m.HomeSeoContent),
  { ssr: true },
);

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
