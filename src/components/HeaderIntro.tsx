import { useEffect, useState } from "react";

// Module-level flag: the intro plays only once per full page load,
// not on client-side navigations back to the homepage.
let introPlayed = false;

const COLUMN_COUNT = 16;
const COLUMN_DELAY_MS = 70;
const COLUMN_DURATION_MS = 1100;

const TOTAL_MS =
  (COLUMN_COUNT - 1) * COLUMN_DELAY_MS + COLUMN_DURATION_MS + 150;

// Brand-green palette ramp: dark green -> lighter green, like swatch columns.
const SHADES = Array.from({ length: COLUMN_COUNT }, (_, i) => {
  const t = i / (COLUMN_COUNT - 1);
  const lightness = 0.3 + t * 0.32;
  const chroma = 0.095 - t * 0.045;
  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} 158.4)`;
});

export function HeaderIntro() {
  const [active] = useState(() => {
    if (introPlayed) return false;
    introPlayed = true;
    return true;
  });
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => setVisible(false), TOTAL_MS);
    return () => clearTimeout(timeout);
  }, [active]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="header-intro pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="flex h-full w-full">
        {SHADES.map((color, i) => (
          <div
            key={i}
            className="header-intro-col h-full flex-1"
            style={{
              backgroundColor: color,
              animationDelay: `${i * COLUMN_DELAY_MS}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
