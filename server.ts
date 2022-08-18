import { createServer, RequestListener } from "http"
import { parse } from "url"
import next from "next"
import httpProxy from "http-proxy"
import { setupTwitchChatBot, setupTwitchEventSub } from "./lib/twitch"

import { loadEnvConfig } from "@next/env"
import { CustomServer } from "./lib"
import ObsController from "./lib/obs"
import WsController from "./lib/ws"
import SnapController from "./lib/snap"
import GiveawaysController from "./lib/giveaways"

loadEnvConfig("./", process.env.NODE_ENV !== "production")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3333
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const url = `http://${hostname}:${port}`

let wsController: WsController
let obsController: ObsController
let snapController: SnapController
let giveawaysController: GiveawaysController

const listener: RequestListener = async (req, res) => {
  try {
    // @ts-expect-error
    res.socket.server.ws = wsController
    // @ts-expect-error
    res.socket.server.snap = snapController
    // @ts-expect-error
    res.socket.server.obs = obsController
    // @ts-expect-error
    res.socket.server.giveaways = giveawaysController

    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url!, true)
    // const { pathname, query } = parsedUrl
    await handle(req, res, parsedUrl)
  } catch (err) {
    console.error("Error occurred handling", req.url, err)
    res.statusCode = 500
    res.end("internal server error")
  }
}

async function init() {
  httpProxy
    .createProxyServer({ target: `${url}/api/twitch`, ignorePath: true })
    .listen(8000)

  await app.prepare()
  const server = createServer(listener) as CustomServer
  server.listen(port, () => console.log(`> Ready on ${url}`))

  wsController = new WsController(server)
  obsController = new ObsController(wsController)
  snapController = new SnapController(obsController)
  giveawaysController = new GiveawaysController(wsController)

  server.ws = wsController
  server.obs = obsController
  server.giveaways = giveawaysController
  server.snap = snapController

  await setupTwitchEventSub()
  await setupTwitchChatBot(server)
}

init()
