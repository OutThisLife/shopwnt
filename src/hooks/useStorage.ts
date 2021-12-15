import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'

const storage = {
  get<T>(k: string): T | undefined {
    if (storage.has(k)) {
      return Object.entries(JSON.parse(this.store.getItem(k) ?? '{}')).reduce(
        (acc, [k0, v]) => ({
          ...acc,
          [k0]: Array.isArray(v) && v[0].length === 2 ? new Map(v) : v
        }),
        {}
      ) as T
    }

    return undefined
  },

  has(k: string) {
    return !!this.store.getItem(k)
  },

  set<T>(k: string, v: T): void {
    if (v && typeof v === 'object') {
      this.store.setItem(
        k,
        JSON.stringify(
          Object.entries(v as Record<string, any>).reduce(
            (acc, [k0, v0]) => ({
              ...acc,
              [k0]: v0 instanceof Map ? [...v0] : v0
            }),
            {}
          )
        )
      )
    } else {
      this.store.setItem(k, JSON.stringify(v))
    }
  },

  get store(): Storage {
    if ('browser' in process) {
      return window.self.localStorage
    }

    return new Proxy<Storage>({} as Storage, {
      get() {
        return () => void null
      }
    })
  }
}

export const useStorage = <T>(
  key: string,
  initialState: T
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => storage.get(key) ?? initialState)
  useEffect(() => storage.set(key, state), [state])

  return [state, setState]
}
