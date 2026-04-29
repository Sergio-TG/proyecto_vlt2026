export default function PrivacidadPage() {
  return (
    <main className="bg-white">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Política de Privacidad</h1>

          <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
            <p>En Viví Las Termas, protegemos su privacidad.</p>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">1. Datos recolectados</h2>
              <p>
                Recopilamos información de contacto enviada voluntariamente (nombre, email, teléfono) para gestionar
                consultas y mejorar la experiencia.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">2. Uso</h2>
              <p>
                Utilizamos sus datos para responder a sus solicitudes. No vendemos sus datos a terceros.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">3. Seguridad</h2>
              <p>
                Utilizamos proveedores de infraestructura en la nube reconocidos y medidas de seguridad estándar de la
                industria para proteger su información.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">4. Derechos</h2>
              <p>
                Usted tiene derecho a solicitar el acceso, rectificación o eliminación de sus datos enviando un correo a
                hola@vivilastermas.com.ar.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
