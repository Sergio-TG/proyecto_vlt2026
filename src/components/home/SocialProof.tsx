import { Star, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    name: "Sofia M.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop",
    rating: 5,
    stay: "Cabaña Los Aromos",
    quote: "Increíble experiencia. La cabaña superó nuestras expectativas y las termas son un sueño.",
  },
  {
    id: 2,
    name: "Lucas R.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
    rating: 5,
    stay: "Refugio del Bosque",
    quote: "La atención personalizada marcó la diferencia. Nos ayudaron a organizar todo el viaje.",
  },
  {
    id: 3,
    name: "Familia Gomez",
    image: "https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=1974&auto=format&fit=crop",
    rating: 5,
    stay: "Eco-Domos",
    quote: "Un lugar mágico para desconectar. Los chicos disfrutaron muchísimo de la naturaleza.",
  },
  {
    id: 4,
    name: "Martina L.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
    rating: 5,
    stay: "Casa de Piedra",
    quote: "Volveremos sin dudas. La paz que se respira en Villa Yacanto es única.",
  }
]

export function SocialProof() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Lo que dicen nuestros viajeros</h2>
          <div className="flex justify-center gap-1 text-yellow-400 mb-2">
             {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
          </div>
          <p className="text-muted-foreground">Más de 1,200 viajeros felices en 2024</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((item) => (
            <div 
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer"
            >
              <img 
                src={item.image} 
                alt={`Testimonio de ${item.name}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                <div className="flex gap-1 mb-2 text-yellow-400">
                    {[...Array(item.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="font-medium text-sm italic mb-2">&quot;{item.quote}&quot;</p>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-white/80">{item.stay}</p>
                    </div>
                    <Instagram className="w-5 h-5 text-white/80" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
            <Button variant="outline" className="gap-2">
                <Instagram className="w-4 h-4" />
                Ver más reseñas en Instagram
            </Button>
        </div>
      </div>
    </section>
  )
}
