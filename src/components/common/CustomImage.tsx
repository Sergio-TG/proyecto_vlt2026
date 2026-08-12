"use client";

import { Image as ImageKitImage } from "@imagekit/next";
import { IMAGE_FOLDERS, ImageFolder } from "@/lib/imagekit.config";
import { useMemo, useState } from "react";

type ImageCandidate = {
  folder: ImageFolder;
  path: string;
  subfolder?: string;
};

interface CustomImageProps {
  path: string;
  folder: ImageFolder;
  subfolder?: string;
  alt: string;
  alternatePaths?: string[];
  fallbackPath?: string;
  fallbackFolder?: ImageFolder;
  fallbackSubfolder?: string;
  fallbackCandidates?: ImageCandidate[];
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: "lazy" | "eager";
  quality?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
}

export default function CustomImage({
  path,
  folder,
  subfolder,
  alt,
  alternatePaths,
  fallbackPath,
  fallbackFolder = "ENTORNO",
  fallbackSubfolder,
  fallbackCandidates,
  width,
  height,
  priority = false,
  loading,
  quality = 80,
  className = "",
  fill = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: CustomImageProps) {
  const candidates = useMemo(() => {
    const buildPath = ({ folder: f, subfolder: sf, path: p }: ImageCandidate) => {
      return sf ? `${IMAGE_FOLDERS[f]}/${sf}/${p}` : `${IMAGE_FOLDERS[f]}/${p}`;
    };

    const list: string[] = [];
    list.push(buildPath({ folder, subfolder, path }));

    if (alternatePaths && alternatePaths.length > 0) {
      for (const p of alternatePaths) {
        list.push(buildPath({ folder, subfolder, path: p }));
      }
    }

    if (fallbackPath) {
      list.push(buildPath({ folder: fallbackFolder, subfolder: fallbackSubfolder, path: fallbackPath }));
    }

    if (fallbackCandidates && fallbackCandidates.length > 0) {
      for (const c of fallbackCandidates) {
        list.push(buildPath(c));
      }
    }

    return Array.from(new Set(list));
  }, [
    alternatePaths,
    fallbackCandidates,
    fallbackFolder,
    fallbackPath,
    fallbackSubfolder,
    folder,
    path,
    subfolder,
  ]);

  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex = activeIndex >= 0 && activeIndex < candidates.length ? activeIndex : 0;
  const activePath = candidates[safeIndex] ?? candidates[0];
  const activeSrc = activePath.startsWith("/") ? activePath : `/${activePath}`;
  const resolvedLoading = loading ?? (priority ? "eager" : "lazy");

  return (
    <ImageKitImage
      src={activeSrc}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
      loading={resolvedLoading}
      quality={quality}
      transformation={[{ format: "auto" }]}
      className={className}
      fill={fill}
      sizes={sizes}
      style={fill ? { objectFit: "cover" } : undefined}
      onError={() => {
        if (candidates.length <= 1) return;
        setActiveIndex((i) => Math.min(i + 1, candidates.length - 1));
      }}
    />
  );
}
