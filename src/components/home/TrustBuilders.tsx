import { ShieldCheck, Camera, Map, Handshake } from "lucide-react"

const trustItems = [
  {
    icon: ShieldCheck,
    title: "VERIFICADO",
    subtitle: "Inspección personal de cada propiedad",
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    icon: Camera,
    title: "FOTOS REALES",
    subtitle: "Lo que ves es lo que obtenés",
    color: "text-purple-500",
    bg: "bg-purple-50"
  },
  {
    icon: Map,
    title: "EXPERTOS LOCALES",
    subtitle: "Asesoría personalizada 24/7",
    color: "text-green-500",
    bg: "bg-green-50"
  },
  {
    icon: Handshake,
    title: "SIN SORPRESAS",
    subtitle: "Transparencia total en precios",
    color: "text-orange-500",
    bg: "bg-orange-50"
  }
]

export function TrustBuilders() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustItems.map((item, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300"
            >
              <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-full flex items-center justify-center mb-2`}>
                <item.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2">{item.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
