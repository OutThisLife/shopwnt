export default {
  get<T>(k: string): T | undefined {
    if (this.has(k)) {
      return Object.entries(JSON.parse(this.store.getItem(k) ?? '{}')).reduce(
        (acc, [k0, v]) => ({
          ...acc,
          [k0]: Array.isArray(v) && v?.at(0)?.length === 2 ? new Map(v) : v
        }),
        {}
      ) as any as T
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
