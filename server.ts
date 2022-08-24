import { createServer, RequestListener } from "http"
import { parse } from "url"
import next from "next"
import httpProxy from "http-proxy"

import { loadEnvConfig } from "@next/env"
import { CustomRequestListener, CustomServer } from "./lib"
import ObsController from "./lib/obs"
import WsController from "./lib/ws"
import SnapController from "./lib/snap"
import GiveawaysController from "./lib/giveaways"
import TwitchController from "./lib/twitch"

loadEnvConfig("./", process.env.NODE_ENV !== "production")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3333
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const url = `http://${hostname}:${port}`

let server: CustomServer

const listener: CustomRequestListener = async (req, res) => {
  try {
    res.server = server

    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url as string, true)
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
  server = createServer(listener as RequestListener) as CustomServer
  server.listen(port, () => console.log(`> Ready on ${url}`))

  const wsController = new WsController(server)
  const obsController = new ObsController(wsController)
  const snapController = new SnapController(obsController)
  const giveawaysController = new GiveawaysController(wsController)
  const twitchController = new TwitchController(
    server,
    snapController,
    giveawaysController,
    obsController
  )

  server.ws = wsController
  server.obs = obsController
  server.giveaways = giveawaysController
  server.snap = snapController
  server.twitch = twitchController
}

init()
