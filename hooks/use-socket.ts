import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

let initialized = false
let socket: Socket | null = null

export const useSocket = () => {
  const [connected, setConnected] = useState(false)

  const init = async () => {
    initialized = true
    await fetch("/api/socket")
    socket = io()
    socket.connect()

    socket.on("connect", () => {
      setConnected(true)
    })

    socket.on("disconnect", () => {
      setConnected(false)
    })
  }

  useEffect(() => {
    if (!initialized) init()

    return () => {
      socket?.close()
    }
  }, [])

  return { socket, connected }
}
