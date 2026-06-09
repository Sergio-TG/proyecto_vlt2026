import { Star } from "lucide-react"

type StarRatingDisplayProps = {
  value: number
  max?: number
  sizeClass?: string
  label?: string
}

export function StarRatingDisplay({
  value,
  max = 5,
  sizeClass = "h-4 w-4",
  label,
}: StarRatingDisplayProps) {
  const safe = Math.max(0, Math.min(max, Math.round(value)))

  return (
    <div className="flex gap-0.5" role="img" aria-label={label ?? `Calificación: ${safe} de ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= safe
        return (
          <Star
            key={i}
            className={`${sizeClass} ${filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-200"}`}
          />
        )
      })}
    </div>
  )
}
