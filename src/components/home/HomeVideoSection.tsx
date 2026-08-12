"use client"

import { useEffect, useRef, useState } from "react"

type HomeVideoSectionProps = {
  src: string
  className?: string
}

export function HomeVideoSection({ src, className }: HomeVideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [activeSrc, setActiveSrc] = useState<string | undefined>(undefined)
  const baseClassName = "w-full max-h-[500px] object-cover aspect-video"
  const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActiveSrc(src)
          observer.disconnect()
        }
      },
      { rootMargin: "200px 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [src])

  return (
    <video
      ref={videoRef}
      src={activeSrc}
      className={combinedClassName}
      autoPlay
      loop
      muted
      playsInline
      preload="none"
    />
  )
}
