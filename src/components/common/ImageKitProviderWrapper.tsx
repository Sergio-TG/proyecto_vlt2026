"use client";

import { ImageKitProvider } from "@imagekit/next";
import { IMAGEKIT_URL_ENDPOINT, IMAGEKIT_PUBLIC_KEY } from "@/lib/imagekit.config";

export default function ImageKitProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ImageKitProvider
      urlEndpoint={IMAGEKIT_URL_ENDPOINT || ""}
    >
      {children}
    </ImageKitProvider>
  );
}
