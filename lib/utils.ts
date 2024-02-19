export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export function request(
  input: URL | RequestInfo,
  init?: RequestInit | undefined
): Promise<Response> {
  const headers = { "x-api-key": process.env.API_KEY as string }

  return fetch(input, {
    ...init,
    headers: { ...(init?.headers || {}), ...headers },
  })
}

export const randomItem = <T>(array: Array<T>) => {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
export const shuffle = <T>(a: Array<T>) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const formatDate = (date?: Date | string) => {
  if (!date) return ""

  const value = typeof date === "string" ? new Date(date) : date
  return value.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    hour: "numeric",
  })
}
