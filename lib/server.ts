import { IncomingMessage, Server as NetServer, ServerResponse } from "http"
import { NextApiResponse } from "next"
import WsController from "./ws"
import ObsController from "./obs"
import SnapController from "./snap"
import GiveawaysController from "./giveaways"
import TwitchController from "./twitch"
import StreamController from "./stream"

export type CustomServer = NetServer & {
  ws: WsController
  obs: ObsController
  snap: SnapController
  giveaways: GiveawaysController
  twitch: TwitchController
  stream: StreamController
}

export type CustomServerResponse = ServerResponse & {
  server?: CustomServer
}

export type CustomRequestListener = (
  req: IncomingMessage,
  res: CustomServerResponse
) => void

export type NextApiResponseServerIO = NextApiResponse & {
  server: CustomServer
}
