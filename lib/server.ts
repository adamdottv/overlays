import { Server as NetServer } from "http"
import { Socket } from "net"
import { NextApiResponse } from "next"
import WsController from "./ws"
import ObsController from "./obs"
import SnapController from "./snap"
import GiveawaysController from "./giveaways"

export type CustomServer = NetServer & {
  ws: WsController
  obs: ObsController
  snap: SnapController
  giveaways: GiveawaysController
}

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: CustomServer
  }
}
