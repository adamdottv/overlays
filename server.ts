import { createServer } from "http"
import { parse } from "url"
import next from "next"
import httpProxy from "http-proxy"
import { setupTwitchEventSub } from "./lib/twitch"

// Load environment variables from .env, .env.local, etc. This explicit call
// into `@next/env` allows using environment variables before next() is called.
// More info: https://nextjs.org/docs/basic-features/environment-variables
import { loadEnvConfig } from "@next/env"
loadEnvConfig("./", process.env.NODE_ENV !== "production")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3333
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const url = `http://${hostname}:${port}`

setupTwitchEventSub()
httpProxy
  .createProxyServer({ target: `${url}/api/twitch`, ignorePath: true })
  .listen(8000)

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
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
  }).listen(port, () => {
    console.log(`> Ready on ${url}`)
  })
})
