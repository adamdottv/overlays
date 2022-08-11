import type { NextApiRequest } from "next"
import { Server } from "socket.io"
import { NextApiResponseServerIO } from "../../../lib/server"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  const { event } = req.query
  if (!event) return res.status(400).end()

  const server = res.socket?.server.io as Server
  server?.emit(event as string, req.query)

  res.status(200).end()
}
