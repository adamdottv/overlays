import { useDeepCompareEffect } from "@react-hookz/web"
import { SetStateAction } from "react"
import { Dispatch } from "react"
import { useState } from "react"

export interface useQueueProps {
  count?: number
  timeout?: number
}

export const useQueue = <T>(
  options?: useQueueProps
): [T[], Dispatch<SetStateAction<T[]>>, T[] | undefined, T | undefined] => {
  const count = options?.count ?? 1
  const timeout = options?.timeout ?? 5 * 1000

  const [items, setItems] = useState<T[]>([])
  const [previous, setPrevious] = useState<T>()
  const active = items.slice(0, count)

  useDeepCompareEffect(() => {
    const timer = setTimeout(
      () =>
        setItems((e) => {
          const [previous, ...rest] = e
          setPrevious(previous)
          return rest
        }),
      timeout
    )
    return () => clearTimeout(timer)
  }, [active, timeout])

  return [items, setItems, active, previous]
}
