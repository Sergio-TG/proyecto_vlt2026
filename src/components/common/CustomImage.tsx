"use client";

import Image from "next/image";
import { IMAGE_FOLDERS, ImageFolder } from "@/lib/imagekit.config";
import imageKitLoader from "@/utils/image-loader";

interface CustomImageProps {
  path: string;
  folder: ImageFolder;
  subfolder?: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  sizes?: string;
}

export default function CustomImage({
  path,
  folder,
  subfolder,
  alt,
  width,
  height,
  priority = false,
  className = "",
  fill = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: CustomImageProps) {
  // Construct the full path within ImageKit
  const fullPath = subfolder 
    ? `${IMAGE_FOLDERS[folder]}/${subfolder}/${path}`
    : `${IMAGE_FOLDERS[folder]}/${path}`;

  return (
    <Image
      loader={imageKitLoader}
      src={fullPath}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
      className={className}
      fill={fill}
      sizes={sizes}
      style={fill ? { objectFit: "cover" } : undefined}
    />
  );
}
