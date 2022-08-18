export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const randomItem = <T>(array: Array<T>) => {
  return array[Math.floor(Math.random() * array.length)]
}
