export const IMAGE_FOLDERS = {
  ALOJAMIENTOS: "alojamientos",
  ENTORNO: "entorno",
  GALERIA: "galeria",
} as const;

export type ImageFolder = keyof typeof IMAGE_FOLDERS;

export const IMAGEKIT_URL_ENDPOINT =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.NEXT_PUBLIC_URL_ENDPOINT;
export const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
