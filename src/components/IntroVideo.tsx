import { useEffect, useRef } from "react";

/**
 * Autoplaying looped clip: first playback tries with sound (browsers may block
 * that without a prior user interaction, then it falls back to muted);
 * every later loop is muted.
 */
export function IntroVideo({ src, label, className }: { src: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

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
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      aria-label={label}
      playsInline
      preload="auto"
      muted
      className={className}
    />
  );
}
