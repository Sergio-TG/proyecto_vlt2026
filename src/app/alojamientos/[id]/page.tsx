
"use client"

import { accommodations } from "@/data/accommodations";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AccommodationGallery } from "@/components/accommodations/AccommodationGallery";
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
  Share2
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, use, useState } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AccommodationPage({ params }: PageProps) {
  const { id } = use(params);
  const accommodation = accommodations.find((acc) => acc.id === id);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const handleShare = async () => {
    if (!accommodation) return;

    const shareData = {
      title: `Viví las Termas - ${accommodation.title}`,
      text: `Mirá este alojamiento increíble en las sierras: ${accommodation.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } catch (err) {
      console.error("Error al compartir:", err);
    }
  };

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  if (!accommodation) {
    notFound();
  }

  // WhatsApp link configuration
  const phoneNumber = "5493511234567"; // Placeholder corporate number
  const message = encodeURIComponent(`Hola, me interesa consultar disponibilidad para *${accommodation.title}*.`);
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${message}`;

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

  return (
    <div className="min-h-screen bg-white pb-20 overflow-hidden">
      {/* Hero / Header Image with Apple Parallax */}
      <section ref={containerRef} className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden flex items-end">
        <motion.div 
          style={{ y, scale, opacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <img
            src={accommodation.image}
            alt={accommodation.title}
            className="w-full h-full object-cover"
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
                {accommodation.badges.map((badge, i) => (
                  <Badge key={i} className="bg-white/95 text-black hover:bg-white border-none text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-xl">
                    {badge}
                  </Badge>
                ))}
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none drop-shadow-2xl">
                {accommodation.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-lg md:text-xl font-light">
                <div className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  <span className="opacity-90">{accommodation.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold">{accommodation.rating}</span>
                  <span className="text-base opacity-60">({accommodation.reviews} reseñas)</span>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                  {Object.entries(accommodation.features).map(([key, value], idx) => {
                    const label = getFeatureLabel(key, value);
                    if (!label) return null;
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

                <div className="space-y-6 text-slate-600 mb-12">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sobre este alojamiento</h3>
                  <p className="text-lg leading-relaxed font-light">{accommodation.description}</p>
                </div>

                <div className="space-y-6 pt-12 border-t border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Servicios Incluidos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {accommodation.services.map((service, index) => (
                      <div key={index} className="flex items-center gap-3 text-slate-600 group">
                        <div className="p-1 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-base font-light">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gallery with Trevia Zoom */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <AccommodationGallery images={accommodation.gallery} title={accommodation.title} />
          </motion.div>

          {/* Drone Video */}
          {accommodation.video && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                <Video className="w-8 h-8 text-primary" />
                Video con Drone
              </h3>
              <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border-4 border-white">
                <iframe
                  src={accommodation.video}
                  title="Drone Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          )}

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
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{accommodation.price}</span>
                  <span className="text-base text-slate-400 font-medium mb-1">/ noche</span>
                </CardTitle>
                <CardDescription className="text-base font-medium text-slate-500 pt-2">
                  Precio base para {accommodation.features.guests} huéspedes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white shadow-2xl shadow-green-200 text-lg h-20 rounded-full font-black">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
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

            {/* Logistics Card with Trevia Dark Style */}
            <Card className="mt-8 border-none shadow-2xl bg-slate-950 text-white rounded-[2.5rem] overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Navigation className="w-40 h-40 transform rotate-12" />
              </div>
              <CardHeader className="p-10 pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-black tracking-tight">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  Logística y Acceso
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-10 relative z-10">
                <div className="space-y-2">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Distancia a Termas</div>
                  <div className="text-2xl font-black text-white tracking-tighter">{accommodation.logistics.distanceToTermas}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Tipo de Camino</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 px-4 py-1.5 rounded-full text-sm font-bold">
                      {accommodation.logistics.roadType}
                    </Badge>
                  </div>
                </div>

                {accommodation.logistics.accessWarning && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="bg-orange-500/10 border border-orange-500/30 rounded-3xl p-6 flex gap-4 items-start"
                  >
                    <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0" />
                    <p className="text-base text-orange-100 font-light leading-snug">
                      {accommodation.logistics.accessWarning}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
