export type ReviewStatsRow = {
  estrellas_alojamiento: number
  estrellas_plataforma: number
}

export type StarDistributionRow = {
  estrellas: number
  conteo: number
  porcentaje: number
}

export type ReviewStats = {
  totalResenas: number
  promedioAlojamiento: number | null
  promedioPlataforma: number | null
  promedioAlojamientoLabel: string
  promedioPlataformaLabel: string
  distribucion: StarDistributionRow[]
}

const STAR_LEVELS = [5, 4, 3, 2, 1] as const

function emptyDistribution(): StarDistributionRow[] {
  return STAR_LEVELS.map((estrellas) => ({ estrellas, conteo: 0, porcentaje: 0 }))
}

function isValidRating(value: unknown): value is number {
  const n = Number(value)
  return Number.isFinite(n) && n >= 1 && n <= 5
}

/** Métricas a partir de reseñas aprobadas (global o por alojamiento). */
export function computeReviewStats(rows: ReviewStatsRow[]): ReviewStats {
  const reviewsData = rows.filter(
    (row) => isValidRating(row.estrellas_alojamiento) && isValidRating(row.estrellas_plataforma),
  )
  const totalResenas = reviewsData.length

  if (totalResenas === 0) {
    return {
      totalResenas: 0,
      promedioAlojamiento: null,
      promedioPlataforma: null,
      promedioAlojamientoLabel: "N/A",
      promedioPlataformaLabel: "N/A",
      distribucion: emptyDistribution(),
    }
  }

  const sumAlojamiento = reviewsData.reduce((acc, row) => acc + row.estrellas_alojamiento, 0)
  const sumPlataforma = reviewsData.reduce((acc, row) => acc + row.estrellas_plataforma, 0)
  const promedioAlojamiento = sumAlojamiento / totalResenas
  const promedioPlataforma = sumPlataforma / totalResenas

  const distribucion = STAR_LEVELS.map((estrellas) => {
    const conteo = reviewsData.filter((row) => Math.round(row.estrellas_alojamiento) === estrellas).length
    const porcentaje = (conteo / totalResenas) * 100
    return { estrellas, conteo, porcentaje }
  })

  return {
    totalResenas,
    promedioAlojamiento,
    promedioPlataforma,
    promedioAlojamientoLabel: promedioAlojamiento.toFixed(1),
    promedioPlataformaLabel: promedioPlataforma.toFixed(1),
    distribucion,
  }
}

/** Valor entero 1–5 para pintar estrellas del promedio (0 si no hay datos). */
export function roundedAverageStars(promedio: number | null): number {
  if (promedio === null || !Number.isFinite(promedio)) return 0
  return Math.max(1, Math.min(5, Math.round(promedio)))
}
