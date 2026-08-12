"use client";

import { ImageKitProvider } from "@imagekit/next";
import { getResolvedImageKitBase } from "@/lib/imagekit.config";

export default function ImageKitProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseEndpoint = getResolvedImageKitBase().replace(/\/+$/, "");
  const urlEndpoint = `${baseEndpoint}/`;

  return (
    <ImageKitProvider
      urlEndpoint={urlEndpoint}
    >
      {children}
    </ImageKitProvider>
  );
}
