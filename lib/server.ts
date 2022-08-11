import { Server as ServerIO } from "socket.io"
import { Server as NetServer } from "http"
import { Socket } from "net"
import { NextApiResponse } from "next"

export type CustomServer = NetServer & {
  io: ServerIO
}

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: CustomServer
  }
}
