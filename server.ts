import { createServer, RequestListener } from "http"
import { parse } from "url"
import next from "next"
import httpProxy from "http-proxy"
import { setupTwitchChatBot, setupTwitchEventSub } from "./lib/twitch"
import { Server as ServerIO } from "socket.io"

import { loadEnvConfig } from "@next/env"
import { CustomServer } from "./lib"

loadEnvConfig("./", process.env.NODE_ENV !== "production")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3333
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const url = `http://${hostname}:${port}`
let socketServer: ServerIO

const listener: RequestListener = async (req, res) => {
  try {
    // @ts-expect-error
    if (!res.socket.server.io) res.socket.server.io = socketServer

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

  socketServer = new ServerIO(server)
  server.io = socketServer

  await setupTwitchEventSub()
  await setupTwitchChatBot(server)
}

init()
