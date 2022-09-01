export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const randomItem = <T>(array: Array<T>) => {
  return array[Math.floor(Math.random() * array.length)]
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
