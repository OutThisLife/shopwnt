export const storage = {
  get: <T extends any>(k: string): T => {
    if (storage.has(k)) {
      return JSON.parse(localStorage.getItem(k) ?? '{}') as T
    }

    return undefined as T
  },

  has: (k: string) => !!localStorage.getItem(k),
  set: <T extends any>(k: string, v: T): void =>
    localStorage.setItem(k, JSON.stringify(v))
}

export const query = async <T extends any>(
  slug: string,
  path: string,
  params: Record<string, any> = {}
): Promise<T> => {
  const u = new URL(`${path}.json`, `https://${slug}.myshopify.com`)
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v))

  return (await fetch(u.toString())).json()
}

export const clean = (s: string) => s.replace(/ /g, '').toLocaleLowerCase()

export const sleep = (ms: number): Promise<void> =>
  new Promise(y => setTimeout(y, ms))

export const filterObj = <T = Record<string, unknown> | undefined>(
  obj: T,
  fn: (v: [string, unknown]) => boolean
): T =>
  Object.entries(obj ?? {})
    .filter(fn)
    .reduce(
      (acc, [k, v]) => ({
        ...acc,
        [k]: v
      }),
      {} as T
    )

export const pick = <T = Record<string, unknown>>(
  obj: T,
  ...keys: string[]
): T => filterObj<T>(obj, ([k]) => keys.flatMap(wk => wk).includes(k))

export const omit = <T = Record<string, unknown>>(
  obj: T,
  ...keys: string[]
): T => filterObj<T>(obj, ([k]) => !keys.flatMap(wk => wk).includes(k))
