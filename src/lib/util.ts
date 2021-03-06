/* eslint-disable no-alert */
export const fetcher = async <T extends Record<string, any>>(
  k: string
): Promise<T> => (await fetch(k)).json() as Promise<T>

export const clean = (s: string) => s.replace(/(\s)/g, '').toLocaleLowerCase()

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
