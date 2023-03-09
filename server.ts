import { createServer, IncomingMessage, RequestListener } from "http"
import { parse } from "url"
import next from "next"
import httpProxy from "http-proxy"

import { loadEnvConfig } from "@next/env"
import { CustomServer, CustomServerResponse } from "./lib"
import ObsController from "./lib/obs"
import WsController from "./lib/ws"
import SnapController from "./lib/snap"
import GiveawaysController from "./lib/giveaways"
import TwitchController from "./lib/twitch"
import StreamController from "./lib/stream"

loadEnvConfig("./", process.env.NODE_ENV !== "production")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3333
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const url = `http://${hostname}:${port}`

let server: CustomServer

async function listener(req: IncomingMessage, res: CustomServerResponse) {
  try {
    res.server = server

    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url as string, true)
    const { pathname } = parsedUrl

    if (pathname === "/ping/guest" && server.stream.guest) {
      const url = `https://ping.gg/call/adam/embed?view=${server.stream.guest.ping}&audio=on`
      console.log(url)

      res.writeHead(307, {
        Location: url,
      })
      res.end()
      return
    }

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
  server = createServer(listener as unknown as RequestListener) as CustomServer
  server.listen(port, () => console.log(`> Ready on ${url}`))

  const wsController = new WsController(server)
  const snapController = new SnapController(server)
  const twitchController = new TwitchController(server, snapController)
  const giveawaysController = new GiveawaysController(
    server,
    wsController,
    twitchController
  )
  const streamController = new StreamController(server, twitchController)
  const obsController = new ObsController(
    server,
    wsController,
    streamController
  )

  server.ws = wsController
  server.giveaways = giveawaysController
  server.snap = snapController
  server.twitch = twitchController
  server.stream = streamController
  server.obs = obsController
}

init()
