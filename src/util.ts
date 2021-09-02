export const fetcher = async <T extends any>(k: string): Promise<T> =>
  (await fetch(k)).json() as T

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
