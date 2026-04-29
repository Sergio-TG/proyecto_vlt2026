export default function CookiesPage() {
  return (
    <main className="bg-white">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Política de Cookies</h1>

          <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
            <p>Utilizamos tecnologías de seguimiento para:</p>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">1. Funcionalidad</h2>
              <p>Mejorar la navegación del sitio y recordar sus preferencias.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">2. Analítica</h2>
              <p>
                Utilizamos servicios de análisis web de terceros para medir el tráfico y mejorar la calidad de nuestro
                portal.
              </p>
            </section>

            <p>
              Usted puede gestionar o rechazar estas tecnologías a través del banner de consentimiento o configurando su
              navegador.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
