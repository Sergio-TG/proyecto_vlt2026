"use client"

import { useMemo, useState, useTransition } from "react"
import { MessageCircle } from "lucide-react"
import { submitOscuraOveraAdvice } from "@/actions/oscura-overa-advice"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EXCURSIONS, UNSURE_EXCURSION_ID, getExcursionLabels } from "@/lib/oscura-overa-champaqui"
import type { oscuraOveraChampaquiEs } from "@/i18n/oscuraOveraCopy"

type Copy = typeof oscuraOveraChampaquiEs

export function ChampaquiAdviceModal({
  open,
  onOpenChange,
  selectedId,
  copy,
  locale,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedId: string
  copy: Copy
  locale: "es" | "en"
}) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ type: "idle" | "success" | "error"; message: string; whatsappHref?: string }>({
    type: "idle",
    message: "",
  })

  const excursionLabel = useMemo(() => {
    if (selectedId === UNSURE_EXCURSION_ID) return copy.unsureOption
    const item = getExcursionLabels(copy.excursions, selectedId)
    if (!item) return copy.unsureOption
    return item.detail ? `${item.name} (${item.detail})` : item.name
  }, [copy, selectedId])

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const payload = {
        excursion: String(formData.get("excursion") || ""),
        people: String(formData.get("people") || ""),
        ages: String(formData.get("ages") || ""),
        experience: String(formData.get("experience") || ""),
        outing: String(formData.get("outing") || ""),
        phone: String(formData.get("phone") || ""),
      }
      formData.set(
        "whatsappPrefill",
        copy.whatsappAdvicePrefill(payload),
      )
      const response = await submitOscuraOveraAdvice(formData)
      setResult({
        type: response.success ? "success" : "error",
        message: response.message,
        whatsappHref: response.whatsappHref,
      })
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setResult({ type: "idle", message: "" })
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="champaqui-advice-desc">
        <DialogHeader>
          <DialogTitle>{copy.adviceTitle}</DialogTitle>
          <DialogDescription id="champaqui-advice-desc">{copy.adviceIntro}</DialogDescription>
        </DialogHeader>

        {result.type === "success" ? (
          <div className="space-y-4" role="status">
            <p className="text-sm text-slate-600">{result.message || copy.success}</p>
            {result.whatsappHref ? (
              <Button asChild className="w-full h-11 rounded-full font-semibold">
                <a href={result.whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  {copy.continueWhatsapp}
                </a>
              </Button>
            ) : null}
          </div>
        ) : (
          <form action={handleSubmit} className="grid gap-4">
            <input type="hidden" name="locale" value={locale} />

            <div className="grid gap-1.5">
              <Label htmlFor="excursion">{copy.fields.excursion}</Label>
              <select
                id="excursion"
                name="excursion"
                defaultValue={selectedId === UNSURE_EXCURSION_ID ? copy.unsureOption : excursionLabel}
                key={selectedId}
                className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                required
              >
                <option value={copy.unsureOption}>{copy.unsureOption}</option>
                {EXCURSIONS.map((item) => {
                  const labels = getExcursionLabels(copy.excursions, item.id)
                  const label = labels?.detail ? `${labels.name} (${labels.detail})` : labels?.name ?? item.id
                  return (
                    <option key={item.id} value={label}>
                      {label}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="people">{copy.fields.people}</Label>
              <Input
                id="people"
                name="people"
                type="number"
                min={1}
                max={40}
                defaultValue={2}
                required
                className="h-10"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="ages">{copy.fields.ages}</Label>
              <Input
                id="ages"
                name="ages"
                type="text"
                placeholder={copy.placeholders.ages}
                required
                className="h-10"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="experience">{copy.fields.experience}</Label>
              <select
                id="experience"
                name="experience"
                required
                defaultValue={copy.experienceOptions.none}
                className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value={copy.experienceOptions.none}>{copy.experienceOptions.none}</option>
                <option value={copy.experienceOptions.intermediate}>
                  {copy.experienceOptions.intermediate}
                </option>
                <option value={copy.experienceOptions.advanced}>{copy.experienceOptions.advanced}</option>
              </select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="outing">{copy.fields.outing}</Label>
              <select
                id="outing"
                name="outing"
                required
                defaultValue={copy.outingOptions.day}
                className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value={copy.outingOptions.day}>{copy.outingOptions.day}</option>
                <option value={copy.outingOptions.overnight}>{copy.outingOptions.overnight}</option>
              </select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="phone">{copy.fields.phone}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={copy.placeholders.phone}
                required
                className="h-10"
              />
            </div>

            {result.type === "error" ? (
              <p className="text-sm text-destructive" role="alert">
                {result.message || copy.error}
              </p>
            ) : null}

            <DialogFooter>
              <Button type="submit" disabled={isPending} className="h-11 w-full rounded-full font-semibold">
                {isPending ? copy.submitting : copy.submit}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
