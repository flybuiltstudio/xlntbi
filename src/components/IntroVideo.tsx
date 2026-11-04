import { useEffect, useRef } from "react";

import { useIsDesktop } from "@/components/DesktopVideo";

/**
 * Autoplaying looped clip: first playback tries with sound (browsers may block
 * that without a prior user interaction, then it falls back to muted);
 * every later loop is muted. On mobile only the still poster is shown.
 */
export function IntroVideo({
  src,
  label,
  className,
  poster,
}: {
  src: string;
  label: string;
  className?: string;
  poster: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const desktop = useIsDesktop();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.volume = 0.07;
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      void v.play().catch(() => {});
    });
    const onEnded = () => {
      v.muted = true;
      v.currentTime = 0;
      void v.play().catch(() => {});
    };
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, [desktop]);

  if (!desktop) {
    return <img src={poster} alt={label} loading="lazy" decoding="async" className={className} />;
  }

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      aria-label={label}
      playsInline
      preload="auto"
      muted
      className={className}
    />
  );
}
