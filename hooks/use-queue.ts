import { SetStateAction } from "react"
import { Dispatch } from "react"
import { useEffect, useState } from "react"

export const useQueue = <T>(
  timeout: number = 5 * 1000
): [T[], Dispatch<SetStateAction<T[]>>, T | undefined] => {
  const [items, setItems] = useState<T[]>([])
  const [active] = items

  useEffect(() => {
    const timer = setTimeout(
      () =>
        setItems((e) => {
          const [_, ...rest] = e
          return rest
        }),
      timeout
    )
    return () => clearTimeout(timer)
  }, [active, timeout])

  return [items, setItems, active]
}
