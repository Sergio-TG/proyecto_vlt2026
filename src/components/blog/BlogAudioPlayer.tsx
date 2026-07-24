"use client"

import * as React from "react"
import { Pause, Play, Volume2, VolumeX, Headphones } from "lucide-react"
import { cn } from "@/lib/utils"

type BlogAudioPlayerProps = {
  src: string
  title?: string
  className?: string
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

/** Reproductor de audio HTML5 estilizado, usado en la vista previa del editor y en el post público. */
export function BlogAudioPlayer({ src, title, className }: BlogAudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = React.useState(false)
  const [muted, setMuted] = React.useState(false)
  const [duration, setDuration] = React.useState(0)
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
  }, [src])

  if (!src) return null

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) {
      el.play().catch(() => null)
    } else {
      el.pause()
    }
  }

  const toggleMute = () => {
    const el = audioRef.current
    if (!el) return
    el.muted = !el.muted
    setMuted(el.muted)
  }

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current
    if (!el) return
    const value = Number(e.target.value)
    el.currentTime = value
    setCurrent(value)
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-white p-4 shadow-sm",
        className,
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime || 0)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "Pausar audio" : "Reproducir audio"}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-105 active:scale-95"
      >
        {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-800">
          <Headphones className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{title || "Episodio de audio"}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="w-10 shrink-0 text-[11px] tabular-nums text-slate-400">
            {formatTime(current)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={onSeek}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary"
            style={{
              background: `linear-gradient(to right, var(--primary, #0f766e) ${progress}%, #e2e8f0 ${progress}%)`,
            }}
            aria-label="Progreso del audio"
          />
          <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-slate-400">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Activar sonido" : "Silenciar"}
        className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  )
}
