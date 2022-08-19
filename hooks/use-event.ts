import { useEffect, useState } from "react"
import { Socket } from "socket.io-client"

type EventSubscriptions = Record<string, boolean>

export const useEvent = <T>(
  socket: Socket | null,
  event: string,
  callback: (message: T) => void
) => {
  const [initialized, setInitialized] = useState<EventSubscriptions>({})

  useEffect(() => {
    if (socket?.connected && !initialized[event]) {
      socket?.on(event, callback)
      setInitialized((map) => ({ ...map, [event]: true }))
    } else if (!socket?.connected) {
      setInitialized((map) => ({ ...map, [event]: false }))
    }
  }, [socket?.connected, event, initialized, callback, socket])
}
