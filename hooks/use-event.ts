import { useEffect, useState } from "react"
import { Socket } from "socket.io-client"

export const useEvent = <T>(
  socket: Socket | null,
  event: string,
  callback: (message: T) => void
) => {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (socket?.connected && !initialized) {
      socket?.on(event, callback)
      setInitialized(true)
    } else if (!socket?.connected) {
      setInitialized(false)
    }
  }, [socket?.connected, event, initialized, callback, socket])
}
