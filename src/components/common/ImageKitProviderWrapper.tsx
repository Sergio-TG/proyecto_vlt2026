"use client";

import { ImageKitProvider } from "@imagekit/next";
import { IMAGEKIT_URL_ENDPOINT } from "@/lib/imagekit.config";

export default function ImageKitProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseEndpoint = (IMAGEKIT_URL_ENDPOINT || "").trim();
  const urlEndpoint =
    baseEndpoint.length === 0 ? "" : baseEndpoint.endsWith("/") ? baseEndpoint : `${baseEndpoint}/`;

  return (
    <ImageKitProvider
      urlEndpoint={urlEndpoint}
    >
      {children}
    </ImageKitProvider>
  );
}
