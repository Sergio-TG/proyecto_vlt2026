import { IMAGEKIT_URL_ENDPOINT } from "@/lib/imagekit.config";

interface ImageKitLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function imageKitLoader({ 
  src, 
  width, 
  quality = 80 
}: ImageKitLoaderProps): string { // Agregamos el tipo de retorno :string
  
  // 1. Limpiamos el src: eliminamos barra inicial si la tiene
  const relativeSrc = src.startsWith("/") ? src.substring(1) : src;
  
  // 2. Usamos una constante segura para el endpoint
  // Añadimos una validación por si la variable de entorno está vacía
  const baseEndpoint = IMAGEKIT_URL_ENDPOINT || ""; 

  const endpoint = baseEndpoint.endsWith("/") 
    ? baseEndpoint.slice(0, -1) 
    : baseEndpoint;

  /**
   * PARÁMETROS DE TRANSFORMACIÓN:
   * w-${width}: Redimensiona al ancho solicitado por Next.js
   * q-${quality}: Ajusta la compresión
   * f-auto: ENTREGA AUTOMÁTICA EN WEBP O AVIF SEGÚN EL NAVEGADOR
   */
  const params = [`w-${width}`, `q-${quality}`, "f-auto"];
  const paramsString = params.join(",");

  return `${endpoint}/${relativeSrc}?tr=${paramsString}`;
}