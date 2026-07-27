'use client'

import { Loader2 } from 'lucide-react'
import type * as React from 'react'
import { cn } from '~/lib/utils'

/**
 * The shared parts of a toolbar dropdown.
 *
 * Sort, Brands and Filters are one control wearing different data, so the
 * metrics live here rather than being typed out per file and drifting apart.
 * Selection is a row's own fill — no tick — which keeps the right edge free
 * for a count or a spinner.
 */

/** Panel surface. Callers add their own max-width. */
export const DROPDOWN_PANEL =
  'w-auto overflow-hidden border-0 bg-white p-0 dark:bg-popover'

/** One column of rows, fixed so the panel only resizes when columns do. */
export const DROPDOWN_COLUMN = 'w-40 shrink-0'

export function DropdownRow({
  active = false,
  className,
  dim = false,
  ...props
}: React.ComponentProps<'button'> & { active?: boolean; dim?: boolean }) {
  return (
    <button
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1 text-left text-sm outline-hidden transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/60 focus-visible:bg-accent/60',
        dim && !active && 'text-muted-foreground/60',
        className
      )}
      type="button"
      {...props}
    />
  )
}

/** The muted caption that titles a column of rows. */
export function DropdownHeading({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-2.5 py-1 text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  )
}

/** Trailing count / meta on a row, muted against the row's own state. */
export function DropdownMeta({
  active = false,
  className,
  ...props
}: React.ComponentProps<'span'> & { active?: boolean }) {
  return (
    <span
      className={cn(
        'text-xs tabular-nums',
        active ? 'text-accent-foreground/70' : 'text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

/** Filter-as-you-type header. The icon names what the box searches. */
export function DropdownSearch({
  icon: Icon,
  ...props
}: React.ComponentProps<'input'> & { icon: React.ElementType }) {
  return (
    <div className="flex h-8 items-center gap-2 px-2.5">
      <Icon className="size-4 shrink-0 opacity-50" />
      <input
        className="h-8 w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground"
        {...props}
      />
    </div>
  )
}

/**
 * Scrollable body of one column. `pb-1` keeps the last row's hover fill from
 * being sheared off by the scroll container's edge.
 */
export function DropdownColumn({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex max-h-64 flex-col overflow-y-auto overscroll-contain px-1 pb-1',
        className
      )}
      {...props}
    />
  )
}

/** Stands in for the columns while loading, or when there's nothing to show. */
export function DropdownNotice({
  busy = false,
  children
}: {
  busy?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'px-2.5 py-6 text-sm text-muted-foreground',
        busy ? 'flex items-center gap-2' : 'text-center'
      )}>
      {busy && <Loader2 className="size-3.5 animate-spin opacity-60" />}
      {children}
    </div>
  )
}
