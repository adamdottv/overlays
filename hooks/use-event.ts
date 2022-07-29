import { useEffect, useState } from "react"
import { useSocket } from "./use-socket"

export const useEvent = <T>(event: string, callback: (message: T) => void) => {
  const { socket, connected } = useSocket()
  const [initialized, setInitialized] = useState(false)

  console.log(connected)

  useEffect(() => {
    if (connected && !initialized) {
      socket?.on(event, callback)
      setInitialized(true)
    }
  }, [socket, event, initialized, callback, connected])
}
