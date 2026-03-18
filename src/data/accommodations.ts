
export interface Accommodation {
  id: string;
  title: string;
  location: string;
  image: string; // Main cover image
  gallery: string[]; // Additional images
  video?: string; // Drone video URL (YouTube/Vimeo embed or direct link)
  price: string;
  rating: number;
  reviews: number;
  badges: string[];
  description: string;
  features: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
    wifi: boolean;
    pet: boolean;
    pool: boolean;
    ac: boolean;
  };
  services: string[]; // List of detailed services
  logistics: {
    distanceToTermas: string;
    roadType: "Asfalto" | "Ripio" | "Huella 4x4";
    accessWarning?: string;
    coordinates?: string;
  };
}

export const accommodations: Accommodation[] = [
  {
    id: "cabana-los-aromos",
    title: "Cabaña Los Aromos",
    location: "Villa Yacanto - 8km a Termas",
    image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1634849662801-a00d83441092?q=80&w=2070&auto=format&fit=crop",
      "https://plus.unsplash.com/premium_photo-1686090450346-f418fff5486e?q=80&w=2070&auto=format&fit=crop"
    ],
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder for drone video
    price: "$85.000",
    rating: 4.9,
    reviews: 47,
    badges: ["⭐ MÁS PEDIDO"],
    description: "Cabaña alpina clásica rodeada de un bosque de pinos añosos. Ideal para familias que buscan contacto directo con la naturaleza sin perder confort. Cuenta con un amplio deck de madera para disfrutar de los atardeceres.",
    features: {
      guests: 6,
      bedrooms: 2,
      bathrooms: 1,
      wifi: true,
      pet: true,
      pool: false,
      ac: true
    },
    services: [
      "Wi-Fi Starlink de alta velocidad",
      "Cocina completa equipada",
      "Ropa de cama y toallas",
      "Parrilla individual",
      "Calefacción a leña (salamandra)"
    ],
    logistics: {
      distanceToTermas: "8 km",
      roadType: "Ripio",
      accessWarning: "Camino de ripio consolidado. Transitable para todo tipo de vehículo, pero se recomienda precaución en días de lluvia intensa."
    }
  },
  {
    id: "refugio-del-bosque",
    title: "Refugio del Bosque",
    location: "El Durazno - 2km a Termas",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=2065&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=2065&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585543805890-6051f7829f98?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2070&auto=format&fit=crop"
    ],
    price: "$120.000",
    rating: 5.0,
    reviews: 32,
    badges: ["💎 PREMIUM"],
    description: "Una experiencia de lujo rústico a pasos del río. Este refugio combina arquitectura moderna con materiales locales. Sus ventanales de piso a techo ofrecen vistas ininterrumpidas del bosque.",
    features: {
      guests: 4,
      bedrooms: 1,
      bathrooms: 1,
      wifi: true,
      pet: false,
      pool: true,
      ac: true
    },
    services: [
      "Desayuno de campo incluido",
      "Jacuzzi privado",
      "Servicio de limpieza diario",
      "Smart TV 55\" con Netflix",
      "Hogar a leña"
    ],
    logistics: {
      distanceToTermas: "2 km",
      roadType: "Huella 4x4",
      accessWarning: "Acceso final de 500m requiere vehículo alto o 4x4. Ofrecemos servicio de transfer desde la entrada principal si venís en auto bajo."
    }
  },
  {
    id: "eco-domos-estrellas",
    title: "Eco-Domos Las Estrellas",
    location: "Zona Rural - Vistas Panorámicas",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
    gallery: [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2070&auto=format&fit=crop"
    ],
    price: "$95.000",
    rating: 4.8,
    reviews: 85,
    badges: ["🌿 ECO-FRIENDLY"],
    description: "Glamping de alto nivel para dormir bajo las estrellas. Estructuras geodésicas climatizadas con baño privado y una terraza exclusiva para observación astronómica.",
    features: {
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      wifi: false,
      pet: true,
      pool: false,
      ac: true
    },
    services: [
      "Energía 100% solar",
      "Telescopio disponible",
      "Desayuno orgánico",
      "Baño privado completo",
      "Kit de amenities biodegradables"
    ],
    logistics: {
      distanceToTermas: "12 km",
      roadType: "Ripio",
      accessWarning: "Camino de montaña sinuoso pero en buen estado. Se recomienda llegar de día para disfrutar las vistas del trayecto."
    }
  },
  {
    id: "casa-de-piedra",
    title: "La Casa de Piedra",
    location: "Villa Yacanto - Centro",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2574&auto=format&fit=crop",
    gallery: [
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2574&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
    ],
    price: "$70.000",
    rating: 4.7,
    reviews: 112,
    badges: [],
    description: "Histórica casona de piedra restaurada en el corazón del pueblo. Perfecta para grupos grandes que quieren estar cerca de los restaurantes y proveedurías pero a minutos de la naturaleza.",
    features: {
      guests: 8,
      bedrooms: 3,
      bathrooms: 2,
      wifi: true,
      pet: true,
      pool: true,
      ac: false
    },
    services: [
      "Gran parque de 2000m2",
      "Quincho con parrilla y horno de barro",
      "Lavandería",
      "Cocina industrial",
      "Cerca de comercios"
    ],
    logistics: {
      distanceToTermas: "15 km",
      roadType: "Asfalto",
      accessWarning: "Acceso 100% por asfalto hasta la puerta. Ideal para cualquier tipo de vehículo."
    }
  },
  {
    id: "suites-del-lago",
    title: "Suites del Lago",
    location: "Los Reartes - Frente al Lago",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
    gallery: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025&auto=format&fit=crop"
    ],
    price: "$110.000",
    rating: 4.6,
    reviews: 28,
    badges: ["✨ VISTA AL LAGO"],
    description: "Suites modernas con balcón privado mirando al dique. Un entorno sereno ideal para parejas que buscan intimidad y confort hotelero en un entorno natural.",
    features: {
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      wifi: true,
      pet: false,
      pool: true,
      ac: true
    },
    services: [
      "Room service",
      "Piscina infinity",
      "Spa en el complejo",
      "Restaurant gourmet",
      "Estacionamiento cubierto"
    ],
    logistics: {
      distanceToTermas: "25 km",
      roadType: "Asfalto",
      accessWarning: "Ruta asfaltada en perfecto estado. Viaje escénico bordeando el lago."
    }
  },
  {
    id: "cabanas-rio-manso",
    title: "Cabañas Río Manso",
    location: "El Durazno - Costa de Río",
    image: "https://images.unsplash.com/photo-1585543805890-6051f7829f98?q=80&w=2070&auto=format&fit=crop",
    gallery: [
        "https://images.unsplash.com/photo-1585543805890-6051f7829f98?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop"
    ],
    price: "$88.000",
    rating: 4.8,
    reviews: 56,
    badges: ["🌊 ACCESO AL RÍO"],
    description: "Complejo familiar con bajada privada al río El Durazno. Las cabañas están distribuidas para garantizar privacidad y cuentan con galerías amplias para disfrutar el sonido del agua.",
    features: {
      guests: 5,
      bedrooms: 2,
      bathrooms: 1,
      wifi: true,
      pet: true,
      pool: false,
      ac: false
    },
    services: [
      "Bajada privada al río",
      "Juegos para niños",
      "Desayuno seco",
      "Calefacción eléctrica",
      "Vigilancia nocturna"
    ],
    logistics: {
      distanceToTermas: "4 km",
      roadType: "Ripio",
      accessWarning: "Camino de ripio en buen estado. Precaución en la bajada al río si el vehículo es muy bajo."
    }
  }
];
