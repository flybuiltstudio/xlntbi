import { useEffect, useState, type VideoHTMLAttributes } from "react";

/**
 * Renders a still image on mobile/SSR and swaps in the video only on desktop
 * (min-width 768px), so phones never download the video file.
 */
export function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

type Props = VideoHTMLAttributes<HTMLVideoElement> & { poster: string };

export function DesktopVideo({ poster, className, width, height, ...rest }: Props) {
  const desktop = useIsDesktop();
  if (!desktop) {
    return (
      <img
        src={poster}
        alt={rest["aria-label"] ?? ""}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={className}
      />
    );
  }
  return <video poster={poster} width={width} height={height} className={className} {...rest} />;
}
