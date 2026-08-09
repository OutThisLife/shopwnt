import { cn } from '~/lib/utils'

/**
 * The app's two waiting states, from Generative Loaders (MIT). Keyframes live
 * in globals.css; these just lay out the parts they animate.
 *
 * `Loader` replaces the spinner everywhere — a spinner says "something is
 * happening", which is the one thing a grid of half-loaded product cards is
 * already saying. `ImageLoader` fills the frame a photo is about to occupy.
 */
export function Loader({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex h-3.5 w-4 shrink-0 items-center justify-between',
        'loader-signal',
        className
      )}>
      {Array.from({ length: 5 }, (_, i) => (
        <i
          className="h-full w-0.5 origin-center rounded-full bg-current"
          key={i}
          style={{ '--cell': i } as React.CSSProperties}
        />
      ))}
    </span>
  )
}

/** The base cycle the upstream delays are struck against. */
const CYCLE = 2350

/**
 * Custom properties are handed to the DOM verbatim, and a raw float stringifies
 * to a different number of digits on the server than in the browser, which
 * React reports as a hydration mismatch. Three decimals is well under a pixel
 * here and prints the same on both sides.
 */
const round = (n: number) => (Math.round(n * 1000) / 1000).toString()

/**
 * Particles on a golden-angle spiral, each drifting in to the core on its own
 * bent path. Offsets are percentages of the frame, measured from its centre.
 */
const PARTICLES = Array.from({ length: 24 }, (_, i) => {
  const angle = (i * 137.508 * Math.PI) / 180
  const x0 = Math.cos(angle) * (42 + ((i * 7) % 8))
  const y0 = Math.sin(angle) * (38 + ((i * 11) % 10))
  const bend = ((i % 5) - 2) * 1.8
  const x2 = x0 * 0.46 - Math.sin(angle) * bend
  const y2 = y0 * 0.46 + Math.cos(angle) * bend
  const reach = 1.2 + (i % 3) * 0.55

  return {
    '--delay': round(-(((i * 11) % 24) / 24) * CYCLE),
    '--dot-opacity': round(0.42 + (i % 4) * 0.12),
    '--size': round(1.35 + ((i * 7) % 5) * 0.32),
    '--x0': round(x0),
    // Upstream pins position at the start and again at 56%, so the drift is
    // already underway by the 14% stop — this is where it has got to.
    '--x1': round(x0 + (x2 - x0) * 0.25),
    '--x2': round(x2),
    '--x3': round(Math.cos(angle * 1.7) * reach),
    '--y0': round(y0),
    '--y1': round(y0 + (y2 - y0) * 0.25),
    '--y2': round(y2),
    '--y3': round(Math.sin(angle * 1.7) * reach)
  } as React.CSSProperties
})

export function ImageLoader({
  className,
  phase = 0
}: {
  className?: string
  /** Milliseconds to stagger this frame by, so a grid of them isn't a strobe. */
  phase?: number
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'absolute inset-[7%] text-muted-foreground',
        'loader-coalesce',
        className
      )}
      style={{ '--phase': `${phase}ms` } as React.CSSProperties}>
      {PARTICLES.map((style, i) => (
        <i key={i} style={style} />
      ))}
      <b />
    </div>
  )
}
