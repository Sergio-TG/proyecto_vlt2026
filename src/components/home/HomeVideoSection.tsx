"use client";

import * as React from "react";

const CLOUDINARY_BASE_VIDEO_URL =
  "https://res.cloudinary.com/dxpy1zqj6/video/upload/v1775856853/video-pileta-exterior_oo9oox.mp4";

function withUploadTransform(url: string, transform: string) {
  return url.replace("/video/upload/", `/video/upload/${transform}/`);
}

function toPosterUrl(videoUrl: string) {
  const withTransform = withUploadTransform(videoUrl, "so_0,f_jpg,q_auto");
  return withTransform.replace(/\.mp4(\?.*)?$/i, ".jpg$1");
}

export function HomeVideoSection() {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = React.useState(false);

  const videoSrc = React.useMemo(
    () => withUploadTransform(CLOUDINARY_BASE_VIDEO_URL, "f_auto,q_auto,vc_auto"),
    []
  );

  const posterSrc = React.useMemo(() => toPosterUrl(CLOUDINARY_BASE_VIDEO_URL), []);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (inView) {
      const p = video.play();
      if (p && typeof (p as Promise<void>).catch === "function") {
        (p as Promise<void>).catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [inView]);

  return (
    <section aria-label="Video de la pileta exterior en Termas" className="w-full">
      <div ref={sentinelRef} className="w-full aspect-[16/9]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
        >
          <source src={videoSrc} />
        </video>
      </div>
    </section>
  );
}