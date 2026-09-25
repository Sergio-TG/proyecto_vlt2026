import type { Metadata, Viewport } from "next"

const VIMEO_EMBED_SRC =
  "https://player.vimeo.com/video/1230327296?autoplay=1&muted=1&playsinline=1&title=0&byline=0&portrait=0"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
}

export const metadata: Metadata = {
  title: "Video promocional | Viví las Termas",
  description:
    "Reproducí el video promocional de Viví las Termas: cabañas y turismo en Calamuchita.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function PromoVideoPage() {
  return (
    <section
      aria-label="Video promocional a pantalla completa"
      className="fixed inset-0 z-100 m-0 flex h-100dvh  w-100vw items-center justify-center overflow-hidden bg-blac p-0"
    >
      <h1 className="sr-only">Video promocional de Viví las Termas</h1>
      <div
        className="relative overflow-hidden"
        style={{
          width: "min(100vw, calc(100dvh * 16 / 9))",
          height: "min(100dvh, calc(100vw * 9 / 16))",
        }}
      >
        <iframe
          src={VIMEO_EMBED_SRC}
          title="Video promocional de Viví las Termas"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
    </section>
  )
}
