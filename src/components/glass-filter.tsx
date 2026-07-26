'use client'

import { useEffect, useState } from 'react'

/**
 * Real refraction for the glass surfaces.
 *
 * `backdrop-filter: blur()` only frosts what's behind an element — it can't
 * bend it. Bending needs an SVG `feDisplacementMap`, which shifts each pixel by
 * an amount read out of another image's red (horizontal) and green (vertical)
 * channels. So we generate that image: a rounded-rect "lens" whose offsets are
 * zero across the flat middle and ramp up through the border region, which is
 * how a real pane refracts — the face is clear, the bevelled edge does the
 * bending.
 *
 * Two taps at slightly different scales give the chromatic fringe along the
 * rim that sells it as glass rather than a smudge.
 *
 * Only Chromium accepts an SVG filter as a `backdrop-filter` input today, so
 * this is applied behind an `@supports` probe and everything else keeps the
 * plain frosted surface. See the W3C discussion on making this interoperable:
 * https://github.com/w3c/svgwg/issues/1142
 */

/** Signed distance to a rounded rect, normalised to the half-extent. */
function roundedRectSDF(
  x: number,
  y: number,
  hw: number,
  hh: number,
  r: number
): number {
  const qx = Math.abs(x) - hw + r
  const qy = Math.abs(y) - hh + r

  return (
    Math.min(Math.max(qx, qy), 0) +
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) -
    r
  )
}

/** Smoothstep, matching the GLSL semantics the shader write-ups assume. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)

  return t * t * (3 - 2 * t)
}

function buildDisplacementMap(size = 128, radius = 0.42, bevel = 0.22): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return ''
  }

  const image = ctx.createImageData(size, size)
  const { data } = image

  for (let i = 0; i < size * size; i++) {
    const px = (i % size) / size - 0.5
    const py = Math.floor(i / size) / size - 0.5

    // Distance into the pane: 0 at the rim, 1 deep in the middle.
    const sd = roundedRectSDF(px, py, 0.5, 0.5, radius)
    const depth = smoothstep(0, -bevel, sd)

    // Push pixels toward the centre near the rim, leave the middle untouched.
    const strength = (1 - depth) * (sd < 0 ? 1 : 0)
    const dx = -px * strength
    const dy = -py * strength

    // 128 is "no shift"; the filter reads the offset either side of that.
    const o = i * 4
    data[o] = Math.max(0, Math.min(255, 128 + dx * 255))
    data[o + 1] = Math.max(0, Math.min(255, 128 + dy * 255))
    data[o + 2] = 128
    data[o + 3] = 255
  }

  ctx.putImageData(image, 0, 0)

  return canvas.toDataURL()
}

export function GlassFilter() {
  const [href, setHref] = useState<string>()

  // Canvas work has to happen client-side, and the map only depends on the
  // lens geometry — not on size or position — so it's generated once.
  useEffect(() => setHref(buildDisplacementMap()), [])

  if (!href) {
    return null
  }

  return (
    <svg aria-hidden className="pointer-events-none absolute size-0">
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          id="glass-refraction"
          x="0"
          y="0"
          height="100%"
          width="100%">
          <feImage href={href} preserveAspectRatio="none" result="map" />

          {/* Two taps at different scales split the channels slightly, which
              reads as the chromatic fringe real glass shows at its edge. */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            result="red"
            scale="26"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feColorMatrix
            in="red"
            result="red"
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            result="blue"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feColorMatrix
            in="blue"
            result="blue"
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
          />

          <feBlend in="red" in2="blue" mode="screen" />
        </filter>
      </defs>
    </svg>
  )
}

export default GlassFilter
