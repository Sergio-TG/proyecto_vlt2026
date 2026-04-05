"use client"

import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AccommodationGallery } from "@/components/accommodations/AccommodationGallery";
import { getAlojamientoBySlug, AlojamientoAprobado } from "@/lib/supabase-queries";
import { slugify } from "@/lib/utils";
import CustomImage from "@/components/common/CustomImage";
import {
  MapPin,
  Star,
  Users,
  BedDouble,
  Bath,
  Wifi,
  Wind,
  Waves,
  Dog,
  Car,
  AlertTriangle,
  MessageCircle,
  CheckCircle2,
  Video,
  ArrowLeft,
  Navigation,
  Share2,
  Tv,
  Coffee,
  Utensils,
  Flame,
  Snowflake
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, use, useState, useEffect } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AccommodationPage({ params }: PageProps) {
  const { id: slug } = use(params);
  const [accommodation, setAccommodation] = useState<AlojamientoAprobado | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getAlojamientoBySlug(slug);
      setAccommodation(data);
      setLoading(false);
    }
    loadData();
  }, [slug]);

  // Parallax effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);

  // Handle Share
  const handleShare = async () => {
    if (!accommodation) return;
    
    const url = window.location.href;
    const shareData = {
      title: `Viví las Termas - ${accommodation.nombre}`,
      text: `Mirá este alojamiento increíble en las sierras: ${accommodation.nombre}`,
      url: url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } catch (err) {
      console.error("Error al compartir:", err);
    }
  };

  // Feature icons mapping
  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "guests": return <Users className="w-5 h-5" />;
      case "bedrooms": return <BedDouble className="w-5 h-5" />;
      case "bathrooms": return <Bath className="w-5 h-5" />;
      case "wifi": return <Wifi className="w-5 h-5" />;
      case "ac": return <Wind className="w-5 h-5" />;
      case "pool": return <Waves className="w-5 h-5" />;
      case "pet": return <Dog className="w-5 h-5" />;
      default: return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const getServiceIcon = (service: string) => {
    const s = service.toLowerCase();
    if (s.includes("wifi")) return <Wifi className="w-5 h-5" />;
    if (s.includes("piscina") || s.includes("pileta")) return <Waves className="w-5 h-5" />;
    if (s.includes("tv") || s.includes("cable")) return <Tv className="w-5 h-5" />;
    if (s.includes("desayuno")) return <Coffee className="w-5 h-5" />;
    if (s.includes("cocina") || s.includes("vajilla")) return <Utensils className="w-5 h-5" />;
    if (s.includes("aire") || s.includes("ac")) return <Snowflake className="w-5 h-5" />;
    if (s.includes("parrilla") || s.includes("asador")) return <Flame className="w-5 h-5" />;
    return <CheckCircle2 className="w-5 h-5" />;
  };

  const getFeatureLabel = (key: string, value: any) => {
    switch (key) {
      case "guests": return `${value} Huéspedes`;
      case "bedrooms": return `${value} Dormitorios`;
      case "bathrooms": return `${value} Baños`;
      case "wifi": return value ? "Wi-Fi Gratis" : "Sin Wi-Fi";
      case "ac": return value ? "Aire Acondicionado" : null;
      case "pool": return value ? "Piscina" : null;
      case "pet": return value ? "Pet Friendly" : "No Mascotas";
      default: return null;
    }
  };

  // Helper para extraer features desde servicios si no existe la columna en DB
  const getDerivedFeatures = () => {
    if (!accommodation) return null;
    const s = accommodation.servicios?.map(serv => serv.toLowerCase()) || [];
    
    // Extraer capacidad del texto "Capacidad: X personas"
    let guests = 0;
    const capacityText = accommodation.servicios?.find(serv => serv.includes('Capacidad:'));
    if (capacityText) {
      const match = capacityText.match(/\d+/);
      if (match) guests = parseInt(match[0]);
    }

    return {
      guests,
      wifi: s.some(serv => serv.includes('wifi')),
      pet: s.some(serv => serv.includes('mascota') || serv.includes('pet') || serv.includes('acepta')),
      pool: s.some(serv => serv.includes('piscina') || serv.includes('pileta')),
    };
  };

  const derivedFeatures = getDerivedFeatures();

  if (loading) {
    return (
      <div className="min-h-screen bg-white overflow-hidden">
        <section
          ref={containerRef}
          className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden flex items-center justify-center"
        >
          <motion.div
            style={{ y, scale, opacity }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <CustomImage
              path="placeholder-vlt.webp"
              folder="ENTORNO"
              alt="Cargando alojamiento"
              fill
              priority
              className="object-cover"
            />
          </motion.div>
          <div className="relative z-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </section>
      </div>
    );
  }

  if (!accommodation) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white pb-20 overflow-hidden">
      {/* Hero / Header Image with Apple Parallax */}
      <section ref={containerRef} className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden flex items-end">
        <motion.div 
          style={{ y, scale, opacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <CustomImage 
            path="portada.webp"
            folder="ALOJAMIENTOS"
            subfolder={accommodation.slug || slugify(accommodation.nombre)}
            alt={accommodation.nombre}
            alternatePaths={["portada.jpg"]}
            fallbackCandidates={[{ folder: "ENTORNO", path: "placeholder-vlt.webp" }]}
            fill
            priority
            className="object-cover"
          />
        </motion.div>
        
        <div className="relative z-20 w-full p-8 md:p-20 text-white container mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <Link href="/alojamientos" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-all hover:-translate-x-1">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-medium tracking-tight">Volver al catálogo</span>
              </Link>
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-white/95 text-black hover:bg-white border-none text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-xl">
                  {accommodation.tipo_alojamiento}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none drop-shadow-2xl">
                {accommodation.nombre}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-lg md:text-xl font-light">
                <div className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  <span className="opacity-90">{accommodation.localidad}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold">{accommodation.rating_google || "—"}</span>
                  <span className="text-base opacity-60">(Google Maps)</span>
                </div>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Button
                onClick={handleShare}
                variant="outline"
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white rounded-2xl h-16 px-8 flex items-center gap-3 transition-all shadow-2xl group"
              >
                <div className="bg-white/20 p-2 rounded-xl group-hover:bg-primary transition-colors">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="font-bold text-lg">Compartir</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="font-bold">¡Enlace copiado al portapapeles!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 -mt-16 relative z-30 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Overview Card with Apple Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="border-none shadow-[0_40px_100px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardContent className="p-10 md:p-16">
                {derivedFeatures && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {Object.entries(derivedFeatures).map(([key, value], idx) => {
                      const label = getFeatureLabel(key, value);
                      if (!label) return null;
                      if (key === "guests" && value === 0) return null; // No mostrar si no hay capacidad definida
                      return (
                        <motion.div 
                          key={key} 
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-3xl text-center gap-3 hover:bg-white hover:shadow-xl transition-all duration-500 border border-slate-100 group"
                        >
                          <div className="text-primary transform group-hover:scale-110 transition-transform">{getFeatureIcon(key)}</div>
                          <span className="text-sm font-bold text-slate-700 uppercase tracking-tight leading-none">{label}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-6 text-slate-600 mb-12">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sobre este alojamiento</h3>
                  <p className="text-lg leading-relaxed font-light">{accommodation.descripcion}</p>
                </div>

                <div className="space-y-6 pt-12 border-t border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Servicios Incluidos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {accommodation.servicios?.map((service, index) => (
                      <div key={index} className="flex items-center gap-3 text-slate-600 group">
                        <div className="p-1 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                          {getServiceIcon(service)}
                        </div>
                        <span className="text-base font-light">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Booking Card - Sticky Apple Style */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="sticky top-24"
          >
            <Card className="border-none shadow-[0_40px_100px_rgba(0,0,0,0.12)] rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-slate-50 p-10 border-b border-slate-100">
                <CardTitle className="flex justify-between items-end">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">
                    {accommodation.precio_base ? `$${accommodation.precio_base.toLocaleString('es-AR')}` : "Consultar"}
                  </span>
                  <span className="text-base text-slate-400 font-medium mb-1">/ noche</span>
                </CardTitle>
                <CardDescription className="text-base font-medium text-slate-500 pt-2">
                  Estadía mínima de {accommodation.noches_minimas || 1} noches
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild className="w-full bg-accent hover:bg-accent/90 text-white shadow-2xl shadow-accent/20 text-lg h-20 rounded-full font-black">
                    <a href={`https://wa.me/5493546525404?text=Hola, me interesa consultar disponibilidad para *${accommodation.nombre}*.`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-6 h-6 mr-3" />
                      Consultar Disponibilidad
                    </a>
                  </Button>
                </motion.div>
                <p className="text-sm text-center text-slate-400 font-medium leading-relaxed">
                  Serás redirigido a WhatsApp para hablar directamente con nosotros y recibir asesoría personalizada.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
