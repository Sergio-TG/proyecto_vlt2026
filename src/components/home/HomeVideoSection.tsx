type HomeVideoSectionProps = {
  src: string
  className?: string
}

export function HomeVideoSection({ src, className }: HomeVideoSectionProps) {
  const baseClassName = "w-full max-h-[500px] object-cover aspect-video"
  const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName

  return (
    <video
      src={src}
      className={combinedClassName}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
    />
  )
}
