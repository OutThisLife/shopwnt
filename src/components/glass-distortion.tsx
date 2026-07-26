'use client'

/**
 * The `glass-distortion` filter from lucasromerodb/liquid-glass-effect-macos
 * (MIT) — the pen everyone forks for the WWDC25 look.
 * https://github.com/lucasromerodb/liquid-glass-effect-macos
 *
 * Two variants, because displacement doesn't scale with the pane. The pen's
 * `scale="150"` is tuned for a ~270x70 button, where shifting pixels 150px
 * just bends the edges. On a tall dropdown the same number reaches far outside
 * the panel and drags whatever is out there — a dark product shot, say —
 * across the middle as a grey smear.
 *
 * So: `glass-distortion` stays lively for the small pill, and
 * `glass-distortion-soft` is the same filter with a short reach and finer
 * noise for the big panes, where the displacement should only ever be a
 * shimmer at the rim.
 */
function Distortion({
  baseFrequency,
  id,
  scale
}: {
  baseFrequency: string
  id: string
  scale: number
}) {
  return (
    <filter
      filterUnits="objectBoundingBox"
      height="100%"
      id={id}
      width="100%"
      x="0%"
      y="0%">
      <feTurbulence
        baseFrequency={baseFrequency}
        numOctaves={1}
        result="turbulence"
        seed={5}
        type="fractalNoise"
      />

      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR amplitude={1} exponent={10} offset={0.5} type="gamma" />
        <feFuncG amplitude={0} exponent={1} offset={0} type="gamma" />
        <feFuncB amplitude={0} exponent={1} offset={0.5} type="gamma" />
      </feComponentTransfer>

      <feGaussianBlur in="turbulence" result="softMap" stdDeviation={3} />

      <feSpecularLighting
        in="softMap"
        lightingColor="white"
        result="specLight"
        specularConstant={1}
        specularExponent={100}
        surfaceScale={5}>
        <fePointLight x={-200} y={-200} z={300} />
      </feSpecularLighting>

      <feComposite
        in="specLight"
        k1={0}
        k2={1}
        k3={1}
        k4={0}
        operator="arithmetic"
        result="litImage"
      />

      {/* Chromatic aberration: displace each channel by a slightly different
          amount, then recombine. Real glass disperses wavelengths, so the red
          edge lands a little further out than the blue one — that colour fringe
          at the rim is most of what reads as "glass" rather than "blur". */}
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        result="dispR"
        scale={scale * 1.35}
        xChannelSelector="R"
        yChannelSelector="G"
      />
      <feColorMatrix
        in="dispR"
        result="chR"
        type="matrix"
        values="1 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 1 0"
      />

      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        result="dispG"
        scale={scale}
        xChannelSelector="R"
        yChannelSelector="G"
      />
      <feColorMatrix
        in="dispG"
        result="chG"
        type="matrix"
        values="0 0 0 0 0
                0 1 0 0 0
                0 0 0 0 0
                0 0 0 1 0"
      />

      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        result="dispB"
        scale={scale * 0.7}
        xChannelSelector="R"
        yChannelSelector="G"
      />
      <feColorMatrix
        in="dispB"
        result="chB"
        type="matrix"
        values="0 0 0 0 0
                0 0 0 0 0
                0 0 1 0 0
                0 0 0 1 0"
      />

      <feBlend in="chR" in2="chG" mode="screen" result="chRG" />
      <feBlend in="chRG" in2="chB" mode="screen" />
    </filter>
  )
}

export function GlassDistortion() {
  return (
    <svg aria-hidden className="hidden">
      <Distortion baseFrequency="0.008 0.008" id="glass-distortion" scale={70} />
      <Distortion
        baseFrequency="0.012 0.012"
        id="glass-distortion-soft"
        scale={45}
      />
    </svg>
  )
}

export default GlassDistortion
