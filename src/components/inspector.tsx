'use client'

import { Check, Copy, ExternalLink, Loader2, ScanSearch, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { InspectResult, InspectVariant } from '~/pages/api/inspect'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'

const money = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { currency: 'USD', style: 'currency' })

function VariantRow({ variant }: { variant: InspectVariant }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(variant.cartUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const status = variant.hidden
    ? { label: 'Hidden', variant: 'default' as const }
    : variant.available
      ? { label: 'In stock', variant: 'success' as const }
      : { label: 'Sold out', variant: 'secondary' as const }

  return (
    <li className="rounded-lg border p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{variant.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {money(variant.price)}
            {variant.availableCount !== null &&
              ` · ${variant.availableCount} in store's warehouse`}
            {variant.inventoryQuantity !== null &&
              ` · ${variant.inventoryQuantity} on Shopify`}
          </p>
        </div>

        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {variant.available && (
        <div className="mt-2 flex items-center gap-1.5">
          <Button asChild className="h-7 flex-1 text-xs" size="sm">
            <a href={variant.cartUrl} rel="noopener noreferrer" target="_blank">
              Add to cart
              <ExternalLink className="size-3" />
            </a>
          </Button>

          <Button
            aria-label="Copy cart link"
            className="size-7"
            onClick={copy}
            size="icon"
            type="button"
            variant="outline">
            {copied ? (
              <Check className="size-3 text-success" />
            ) : (
              <Copy className="size-3" />
            )}
          </Button>
        </div>
      )}
    </li>
  )
}

export function Inspector() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<InspectResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()

    if (!url.trim() || loading) {
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(`/api/inspect?u=${encodeURIComponent(url.trim())}`)
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error ?? 'Something went wrong.')
      }

      setResult(json as InspectResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const hidden = result?.variants.filter(v => v.hidden).length ?? 0

  return (
    <>
      {open && (
        <div
          className="fixed right-4 bottom-20 z-50 flex max-h-[min(30rem,calc(100dvh-8rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl sm:right-6 sm:bottom-24"
          role="dialog">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <p className="text-sm font-semibold">Variant inspector</p>
            <button
              aria-label="Close"
              className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
              onClick={() => setOpen(false)}
              type="button">
              <X className="size-3.5" />
            </button>
          </div>

          <form className="flex items-center gap-2 border-b p-3" onSubmit={submit}>
            <Input
              aria-label="Product URL"
              className="h-8 text-sm"
              onChange={e => setUrl(e.target.value)}
              placeholder="store.com/products/handle"
              ref={inputRef}
              value={url}
            />
            <Button className="h-8" disabled={loading} size="sm" type="submit">
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : 'Check'}
            </Button>
          </form>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
            {error && <p className="text-sm text-destructive">{error}</p>}

            {!error && !result && !loading && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Paste any Shopify product URL to see every variant, what the store
                is really holding, and a direct add-to-cart link — including sizes
                the storefront hides.
              </p>
            )}

            {result && (
              <>
                <div className="mb-2">
                  <p className="truncate text-sm font-medium">{result.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.variants.length} variant
                    {result.variants.length === 1 ? '' : 's'}
                    {hidden > 0 && ` · ${hidden} hidden but buyable`}
                  </p>
                </div>

                <ul className="flex flex-col gap-2">
                  {result.variants.map(v => (
                    <VariantRow key={v.id} variant={v} />
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      <Button
        aria-label={open ? 'Close variant inspector' : 'Open variant inspector'}
        className="fixed right-4 bottom-4 z-50 size-11 rounded-full shadow-lg sm:right-6 sm:bottom-6"
        onClick={() => setOpen(o => !o)}
        size="icon">
        {open ? <X className="size-5" /> : <ScanSearch className="size-5" />}
      </Button>
    </>
  )
}

export default Inspector
