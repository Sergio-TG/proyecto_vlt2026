"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Star, CheckCircle2, ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import { REVIEWS_PAGE_SIZE, type ApprovedReview, type ReviewInsertPayload } from "@/lib/reviews"
import { fetchApprovedReviewsPage } from "@/lib/review-pagination"
import { roundedAverageStars, type ReviewStats } from "@/lib/review-stats"
import { StarRatingDisplay } from "@/components/accommodations/StarRatingDisplay"
import { ReviewPhotosGallery } from "@/components/accommodations/ReviewPhotosGallery"
import {
  MAX_REVIEW_PHOTO_BYTES,
  MAX_REVIEW_PHOTOS,
  uploadReviewPhotos,
} from "@/lib/review-photos-client"

type StarRatingProps = {
  value: number
  onChange: (value: number) => void
  label: string
  rateStarsLabel: (n: number) => string
}

type SelectedPhoto = {
  id: string
  file: File
  previewUrl: string
}

function StarRatingInput({ value, onChange, label, rateStarsLabel }: StarRatingProps) {
  return (
    <div className="space-y-3">
      <p className="text-base font-semibold text-slate-900">{label}</p>
      <div className="flex gap-1" role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= value
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              aria-label={rateStarsLabel(star)}
              aria-pressed={filled}
              className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Star
                className={`h-8 w-8 sm:h-9 sm:w-9 transition-colors ${
                  filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300"
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function formatReviewDate(value: string, locale: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale === "en" ? "en-US" : "es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

type AccommodationReviewsSectionProps = {
  alojamientoId: string
  initialApprovedReviews: ApprovedReview[]
  initialTotalCount: number
  reviewStats: ReviewStats
}

export function AccommodationReviewsSection({
  alojamientoId,
  initialApprovedReviews,
  initialTotalCount,
  reviewStats,
}: AccommodationReviewsSectionProps) {
  const { locale } = useLanguage()
  const r = getSiteCopy(locale).pages.accommodationDetail.reviews
  const dateLocale = locale === "en" ? "en-US" : "es-AR"
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [approvedReviews, setApprovedReviews] = React.useState<ApprovedReview[]>(initialApprovedReviews)
  const [offset, setOffset] = React.useState(initialApprovedReviews.length)
  const [totalCount, setTotalCount] = React.useState(initialTotalCount)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [loadMoreError, setLoadMoreError] = React.useState<string | null>(null)
  const [nombre, setNombre] = React.useState("")
  const [estrellasAlojamiento, setEstrellasAlojamiento] = React.useState(0)
  const [estrellasPlataforma, setEstrellasPlataforma] = React.useState(0)
  const [comentario, setComentario] = React.useState("")
  const [selectedPhotos, setSelectedPhotos] = React.useState<SelectedPhoto[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploadingImages, setIsUploadingImages] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [validationError, setValidationError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setApprovedReviews(initialApprovedReviews)
    setOffset(initialApprovedReviews.length)
    setTotalCount(initialTotalCount)
    setLoadMoreError(null)
  }, [initialApprovedReviews, initialTotalCount])

  const hasMoreReviews = approvedReviews.length < totalCount

  const loadMoreReviews = async () => {
    if (loadingMore || !hasMoreReviews) return

    setLoadingMore(true)
    setLoadMoreError(null)

    try {
      const { reviews: nextReviews, totalCount: nextTotal } = await fetchApprovedReviewsPage(
        alojamientoId,
        offset,
      )

      setApprovedReviews((prev) => {
        const existingIds = new Set(prev.map((item) => item.id))
        const uniqueNext = nextReviews.filter((item) => !existingIds.has(item.id))
        return [...prev, ...uniqueNext]
      })
      setOffset((prev) => prev + REVIEWS_PAGE_SIZE)
      setTotalCount(nextTotal)
    } catch {
      setLoadMoreError(r.loadMoreError)
    } finally {
      setLoadingMore(false)
    }
  }

  const clearSelectedPhotos = React.useCallback(() => {
    setSelectedPhotos((prev) => {
      prev.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))
      return []
    })
  }, [])

  const removePhoto = (id: string) => {
    setSelectedPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((photo) => photo.id !== id)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null)
    const incoming = Array.from(e.target.files ?? [])
    e.target.value = ""

    if (incoming.length === 0) return

    const remaining = MAX_REVIEW_PHOTOS - selectedPhotos.length
    if (remaining <= 0) {
      setValidationError(r.maxPhotos)
      return
    }

    const nextPhotos: SelectedPhoto[] = []
    for (const file of incoming.slice(0, remaining)) {
      if (!file.type.startsWith("image/")) {
        setValidationError(r.invalidFileType)
        continue
      }
      if (file.size > MAX_REVIEW_PHOTO_BYTES) {
        setValidationError(r.fileTooLarge)
        continue
      }
      nextPhotos.push({
        id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }

    if (nextPhotos.length > 0) {
      setSelectedPhotos((prev) => [...prev, ...nextPhotos].slice(0, MAX_REVIEW_PHOTOS))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setValidationError(null)

    const trimmedName = nombre.trim()
    if (!trimmedName) {
      setValidationError(r.validationName)
      return
    }
    if (estrellasAlojamiento < 1 || estrellasPlataforma < 1) {
      setValidationError(r.validationRatings)
      return
    }

    setIsSubmitting(true)

    try {
      let urlsFotos: string[] = []
      const files = selectedPhotos.map((photo) => photo.file)

      if (files.length > 0) {
        setIsUploadingImages(true)
        urlsFotos = await uploadReviewPhotos(files, alojamientoId)
        setIsUploadingImages(false)
      }

      const payload: ReviewInsertPayload = {
        alojamiento_id: alojamientoId,
        nombre_usuario: trimmedName,
        estrellas_alojamiento: estrellasAlojamiento,
        estrellas_plataforma: estrellasPlataforma,
        comentario: comentario.trim(),
        fotos: urlsFotos,
        aprobada: false,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("reviews").insert([payload])

      if (error) throw error

      setSuccess(true)
      setNombre("")
      setEstrellasAlojamiento(0)
      setEstrellasPlataforma(0)
      setComentario("")
      clearSelectedPhotos()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : r.error
      setSubmitError(message || r.error)
    } finally {
      setIsUploadingImages(false)
      setIsSubmitting(false)
    }
  }

  const submitLabel = isUploadingImages ? r.uploadingImages : isSubmitting ? r.submitting : r.submit
  const avgStars = roundedAverageStars(reviewStats.promedioAlojamiento)
  const showReviewsBlock = totalCount > 0

  return (
    <section className="border-t border-slate-100 bg-slate-50/80">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl"
        >
          {showReviewsBlock ? (
            <div className="mb-12">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{r.listTitle}</h2>
                {reviewStats.totalResenas > 0 && reviewStats.promedioAlojamiento !== null ? (
                  <div className="mt-3 flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-slate-500">
                      {r.statsSummary(reviewStats.promedioAlojamientoLabel, reviewStats.totalResenas)}
                    </p>
                    {avgStars > 0 ? (
                      <StarRatingDisplay value={avgStars} sizeClass="h-4 w-4" label={r.statsSummary(reviewStats.promedioAlojamientoLabel, reviewStats.totalResenas)} />
                    ) : null}
                  </div>
                ) : null}
              </div>
              <ul className="space-y-4">
                {approvedReviews.map((review, index) => (
                  <motion.li
                    key={review.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(index, 4) * 0.05, duration: 0.5 }}
                  >
                    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold text-slate-900">{review.nombre_usuario}</p>
                          <time dateTime={review.created_at} className="text-sm font-medium text-slate-400">
                            {formatReviewDate(review.created_at, dateLocale)}
                          </time>
                        </div>
                        <StarRatingDisplay
                          value={review.estrellas_alojamiento}
                          sizeClass="h-5 w-5"
                          label={`${review.estrellas_alojamiento} estrellas`}
                        />
                      </div>
                      {review.comentario ? (
                        <p className="text-base leading-relaxed text-slate-600">{review.comentario}</p>
                      ) : null}
                      <ReviewPhotosGallery urls={review.fotos} altPrefix={r.photoAlt} />
                    </article>
                  </motion.li>
                ))}
              </ul>

              {loadMoreError ? (
                <p className="mt-4 text-center text-sm font-medium text-red-600" role="alert">
                  {loadMoreError}
                </p>
              ) : null}

              <AnimatePresence>
                {hasMoreReviews ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 flex justify-center"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={loadMoreReviews}
                      disabled={loadingMore}
                      className="h-12 rounded-full border-slate-200 px-8 font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {r.loadingMore}
                        </>
                      ) : (
                        r.loadMore
                      )}
                    </Button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : (
            <p className="mb-12 text-center text-base font-light text-slate-500">{r.emptyList}</p>
          )}

          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{r.sectionTitle}</h2>
            <p className="mt-3 text-base font-light text-slate-500 md:text-lg">{r.sectionSubtitle}</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.06)] sm:p-10">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-8 text-center"
              >
                <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                <p className="max-w-md text-lg font-medium leading-relaxed text-slate-700">{r.success}</p>
                <p className="max-w-md text-sm text-slate-500">{r.successPending}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="review-nombre" className="text-slate-800">
                    {r.nameLabel}
                  </Label>
                  <Input
                    id="review-nombre"
                    name="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder={r.namePlaceholder}
                    autoComplete="name"
                    disabled={isSubmitting}
                    className="h-12 rounded-xl border-slate-200 px-4 text-base"
                    required
                  />
                </div>

                <StarRatingInput
                  value={estrellasAlojamiento}
                  onChange={setEstrellasAlojamiento}
                  label={r.ratingAccommodation}
                  rateStarsLabel={r.rateStars}
                />

                <StarRatingInput
                  value={estrellasPlataforma}
                  onChange={setEstrellasPlataforma}
                  label={r.ratingPlatform}
                  rateStarsLabel={r.rateStars}
                />

                <div className="space-y-2">
                  <Label htmlFor="review-comentario" className="text-slate-800">
                    {r.commentLabel}
                  </Label>
                  <Textarea
                    id="review-comentario"
                    name="comentario"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder={r.commentPlaceholder}
                    disabled={isSubmitting}
                    rows={5}
                    className="min-h-[140px] resize-y rounded-2xl border-slate-200 px-4 py-3 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="review-fotos" className="text-slate-800">
                      {r.photosLabel}
                    </Label>
                    <span className="text-xs font-medium text-slate-400">
                      {selectedPhotos.length}/{MAX_REVIEW_PHOTOS} · {r.photosHint}
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    id="review-fotos"
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isSubmitting || selectedPhotos.length >= MAX_REVIEW_PHOTOS}
                    onChange={handleFileChange}
                    className="sr-only"
                  />

                  <button
                    type="button"
                    disabled={isSubmitting || selectedPhotos.length >= MAX_REVIEW_PHOTOS}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-6 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                      <ImagePlus className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{r.photosCta}</p>
                      <p className="mt-1 text-sm text-slate-500">{r.photosSubhint}</p>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {selectedPhotos.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-3 overflow-hidden"
                      >
                        {selectedPhotos.map((photo) => (
                          <motion.div
                            key={photo.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 shadow-sm"
                          >
                            <img
                              src={photo.previewUrl}
                              alt={r.photoPreviewAlt}
                              className="aspect-square h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(photo.id)}
                              disabled={isSubmitting}
                              aria-label={r.removePhoto}
                              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                {validationError ? (
                  <p className="text-sm font-medium text-amber-700" role="alert">
                    {validationError}
                  </p>
                ) : null}

                {submitError ? (
                  <p className="text-sm font-medium text-red-600" role="alert">
                    {submitError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-full bg-[#1a1f2c] text-base font-bold text-white shadow-xl hover:bg-primary"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {submitLabel}
                    </>
                  ) : (
                    r.submit
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
