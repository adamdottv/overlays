import { useEffect } from "react"
import { Socket } from "socket.io-client"

export const useEvent = <T>(
  socket: Socket | null,
  event: string,
  callback: (message: T) => void
) => {
  useEffect(() => {
    if (socket?.connected) {
      socket?.on(event, callback)
    }
    return () => {
      socket?.off(event, callback)
    }
  }, [socket?.connected, event, callback, socket])
}
