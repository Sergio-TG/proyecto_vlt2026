import { IMAGEKIT_URL_ENDPOINT } from "@/lib/imagekit.config";

interface ImageKitLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function imageKitLoader({ src, width, quality = 80 }: ImageKitLoaderProps) {
  if (src.startsWith("/")) src = src.substring(1);
  const params = [`w-${width}`, "f-auto"];
  if (quality) {
    params.push(`q-${quality}`);
  }
  const paramsString = params.join(",");
  return `${IMAGEKIT_URL_ENDPOINT}/${src}?tr=${paramsString}`;
}
