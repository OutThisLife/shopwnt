import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'
import { storage } from '~/lib'

export const useStorage = <T = unknown>(
  key: string,
  initialState: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, set] = useState<T>(storage.get(key) ?? initialState)

  useEffect(() => void storage.set(key, state), [state])

  return [state, set]
}
