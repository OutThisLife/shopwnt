export const fetcher = async <T extends Record<string, any>>(
  k: string
): Promise<T> => (await fetch(k)).json() as Promise<T>

/** Passthrough tag for editor highlighting / prettier formatting. */
export const gql = (strings: TemplateStringsArray, ...values: unknown[]): string =>
  strings.reduce((acc, s, i) => acc + s + (i < values.length ? `${values[i]}` : ''), '')

/** Minimal GraphQL over fetch against the local API route. */
export const gqlFetch = async <T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  })

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] }

  if (json.errors?.length) {
    throw new Error(json.errors.map(e => e.message).join('; '))
  }

  if (!res.ok || !json.data) {
    throw new Error(`Request failed with status ${res.status}`)
  }

  return json.data
}

export const clean = (s: string) => s.replace(/(\s)/g, '').toLocaleLowerCase()

/**
 * Reduce anything paste-shaped — a bare domain, or a full product URL with
 * query and hash — down to just the hostname.
 */
export const storeHost = (raw: string): string =>
  raw
    .trim()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    .replace(/^\/\//, '')
    .split(/[/?#]/)[0]
    .replace(/\.+$/, '')
    .toLowerCase()

export const filterObj = <T = Record<string, unknown> | undefined>(
  obj: T,
  fn: (v: [string, unknown]) => boolean
): T =>
  Object.entries(obj ?? ({} as any))
    .filter(fn)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as any as T)

export const pick = <T = Record<string, unknown>>(
  obj: T,
  ...keys: string[]
): T => filterObj<T>(obj, ([k]) => keys.flatMap(wk => wk).includes(k))

export const omit = <T = Record<string, unknown>>(
  obj: T,
  ...keys: string[]
): T => filterObj<T>(obj, ([k]) => !keys.flatMap(wk => wk).includes(k))

/** Uppercase first letter */
export const ucfirst = (str: string): string =>
  `${str.at(0)}`.toUpperCase() + str.slice(1)

/** Lowercase first letter */
export const lcfirst = (str: string): string =>
  `${str.at(0)}`.toLowerCase() + str.slice(1)

/** Transform a string to camelCase */
export const camelize = (str: string): string =>
  (str === str.toUpperCase() ? str.toLowerCase() : lcfirst(str))
    .replace(/^--/, '')
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())

/** Transform a string to PascalCase */
export const pascalize = (str: string): string => ucfirst(camelize(str))

/** Transform a string to snek_case */
export const snekize = (str: string): string =>
  str
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .join('_')
    .toLowerCase()

/** Transform a string to hyphen-case */
export const hyphenize = (str: string): string =>
  str
    .replace(/([A-Z])/g, '$1')
    .split(' ')
    .join('-')
    .toLowerCase()

/** Slugify a string */
export const slugify = (str: string, len = 4): string =>
  str
    .replace(/([A-Z])/g, '$1')
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(v => v)
    .slice(0, len)
    .join('-')
    .toLowerCase()

export interface Stamped {
  created_at?: Date | string | null
  published_at?: Date | string | null
  updated_at?: Date | string | null
}

const ts = (v: Date | string | null | undefined): number => +new Date(v ?? 0) || 0

/**
 * Shopify writes updated_at as part of publishing, so every freshly dropped
 * product looks like it was just edited. Anything inside this window of its
 * arrival is that echo rather than a real change.
 */
const PUBLISH_ECHO = 60_000

/**
 * When a product actually showed up.
 *
 * created_at is when the draft was keyed in, which can predate the drop by
 * weeks; published_at is when it reached the storefront. Stores are
 * inconsistent about which one moves, so the later of the two is the honest
 * "this became real" moment.
 */
export const arrivedAt = (i: Stamped): number =>
  Math.max(ts(i?.published_at), ts(i?.created_at))

/**
 * When a product last genuinely changed.
 *
 * Falls back to arrival when the only "update" is the publish echo, so a
 * brand-new listing still places by its own freshness instead of jumping the
 * queue ahead of a real restock or price cut.
 */
export const revisedAt = (i: Stamped): number => {
  const arrived = arrivedAt(i)
  const updated = ts(i?.updated_at)

  return updated - arrived > PUBLISH_ECHO ? updated : arrived
}

/** True when a product has been touched since it arrived. */
export const wasRevised = (i: Stamped): boolean => revisedAt(i) > arrivedAt(i)

/** Gets relative time */
const rtf = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
  style: 'long'
})

export const relTime = (
  d1: Date | string = new Date(),
  d2 = new Date()
): string => {
  if (typeof d1 === 'string') {
    d1 = new Date(d1)
  }

  const diff = +d1 - +d2

  if (Math.abs(diff) > 24 * 60 * 60 * 1e3) {
    return d1.toLocaleDateString()
  }

  return rtf.format(Math.round(diff / (60 * 60 * 1e3)), 'hour')
}

export const sleep = (ms: number): Promise<void> =>
  new Promise(y => {
    setTimeout(y, ms)
  })

export const prompt = (str: string): Promise<string> =>
  new Promise((y, n) => {
    const r = window.prompt(str)

    if (r) {
      y(r)
    } else {
      n()
    }
  })

export const confirm = (str: string): Promise<boolean> =>
  new Promise((y, n) => {
    const r = window.confirm(str)

    if (r) {
      y(r)
    } else {
      n()
    }
  })
