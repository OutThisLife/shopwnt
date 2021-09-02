import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'

const storage = {
  get: <T extends any>(k: string): T => {
    if (storage.has(k)) {
      return Object.entries(JSON.parse(localStorage.getItem(k) ?? '{}')).reduce(
        (acc, [k0, v]) => ({
          ...acc,
          [k0]: Array.isArray(v) && v[0].length === 2 ? new Map(v) : v
        }),
        {}
      ) as T
    }

    return undefined as T
  },

  has: (k: string) => !!localStorage.getItem(k),

  set: <T extends any>(k: string, v: T): void => {
    if (v && typeof v === 'object') {
      localStorage.setItem(
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
      localStorage.setItem(k, JSON.stringify(v))
    }
  }
}

export const useStorage = <T extends any>(
  key: string,
  initialState: T
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => storage.get(key) ?? initialState)
  useEffect(() => storage.set(key, state), [state])

  return [state, setState]
}

export default useState
