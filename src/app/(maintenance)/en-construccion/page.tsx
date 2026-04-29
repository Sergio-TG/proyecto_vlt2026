// src/app/(maintenance)/en-construccion/page.tsx
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Próximamente | Viví las Termas",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EnConstruccionPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-hidden">
      {/* Fondo Decorativo Sutil */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-3xl"></div>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-6 text-center">
        {/* Logo o Nombre de Marca */}
        <div className="mb-8">
          <span className="text-sm font-bold tracking-[0.2em] text-teal-600 uppercase">
            Viví las Termas
          </span>
          <div className="h-1 w-12 bg-teal-600 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Título Principal */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Nuestra nueva plataforma <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
            está en camino.
          </span>
        </h1>

        {/* Descripción corta */}
        <p className="max-w-xl text-lg text-gray-600 mb-10 leading-relaxed">
          Estamos creando el portal definitivo para descubrir alojamientos y experiencias 
          de bienestar en las Sierras de Córdoba. Muy pronto podrás reservar tu próxima escapada.
        </p>

        {/* Call to Action para Socios */}
        <div className="p-6 border border-gray-100 rounded-2xl bg-white/50 backdrop-blur-sm shadow-xl shadow-gray-200/50 max-w-sm w-full transition-transform hover:scale-[1.02]">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-4 tracking-widest">
            ¿Eres prestador?
          </p>
          <Link 
            href="/socios" 
            className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg shadow-teal-200"
          >
            Acceder al Portal de Socios
          </Link>
        </div>

        {/* Contacto rápido */}
        <div className="mt-12 text-gray-400 text-sm italic">
          Villa Yacanto de Calamuchita, Córdoba.
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="py-8 text-center text-xs text-gray-400 tracking-wider relative z-10">
        &copy; {new Date().getFullYear()} VIVÍ LAS TERMAS. TODOS LOS DERECHOS RESERVADOS. 
        <p>
              Diseño y Desarrollo{" "}
              <a
                href="https://www.tgwebstudios.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors font-medium text-slate-400"
              >
                TG Web Studios
              </a>
            </p>      
      </footer>
    </div>
  );
}