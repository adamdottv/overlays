import { NextApiRequest, NextApiResponse } from "next"
import { Server as ServerIO } from "socket.io"
import { Server as NetServer } from "http"
import { Socket } from "net"

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer)
    res.socket.server.io = io
  }
  console.log("socket established")
  return res.end()
}
