"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { buildRetiroGalleryImageUrl } from "@/lib/retiro-detox-vida-abundante"

const FOCUS_CLASS: Record<string, string> = {
  "alimentacion-verduras-crudas-varias.webp": "object-bottom",
}

export function RetiroDetoxMiniGallery({
  files,
  alts,
  className,
  sizes,
}: {
  files: readonly string[]
  alts: string[]
  className: string
  sizes: string
}) {
  return (
    <ul className={cn(className)}>
      {files.map((file, index) => (
        <li
          key={file}
          className="group relative overflow-hidden rounded-xl shadow-md aspect-[4/3]"
        >
          <Image
            src={buildRetiroGalleryImageUrl(file)}
            alt={alts[index] ?? file}
            fill
            loading="lazy"
            sizes={sizes}
            className={cn(
              "object-cover transition-transform duration-1500 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-115",
              FOCUS_CLASS[file] ?? "object-center",
            )}
          />
        </li>
      ))}
    </ul>
  )
}
