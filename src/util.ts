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

export const query = async <T extends any>(k: string): Promise<T> =>
  (await fetch(k)).json() as T

export const clean = (s: string) => s.replace(/ /g, '').toLocaleLowerCase()
