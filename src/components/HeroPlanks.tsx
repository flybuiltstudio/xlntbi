// Decorative wood-slat ("deszka") column layer for the homepage hero.
// Planks gently open and close (scaleY) with staggered negative delays,
// so the wave is already in motion when the page loads.

const PLANK_COUNT = 16;

interface Plank {
  background: string;
  delay: string;
}

const PLANKS: Plank[] = Array.from({ length: PLANK_COUNT }, (_, i) => {
  const t = i / (PLANK_COUNT - 1);
  // Brand-green ramp: darker on the left, lighter towards the right.
  const lightness = 0.34 + t * 0.12;
  const chroma = 0.068 + t * 0.024;
  const base = `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} 158.6)`;
  const edgeLight = `oklch(${(lightness + 0.05).toFixed(3)} ${chroma.toFixed(3)} 158.6)`;
  const edgeDark = `oklch(${(lightness - 0.045).toFixed(3)} ${chroma.toFixed(3)} 158.6)`;
  return {
    // Slat look: bright left edge, flat middle, shadowed right edge.
    background: `linear-gradient(90deg, ${edgeLight} 0%, ${base} 16%, ${base} 84%, ${edgeDark} 100%)`,
    delay: `${(-i * 0.5).toFixed(2)}s`,
  };
});

export function HeroPlanks() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex gap-1.5 px-1.5"
    >
      {PLANKS.map((plank, i) => (
        <div
          key={i}
          className="hero-plank h-full flex-1 rounded-[3px]"
          style={{ background: plank.background, animationDelay: plank.delay }}
        />
      ))}
    </div>
  );
}
