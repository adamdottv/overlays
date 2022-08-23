import { NextApiRequest } from "next"
import { NextApiResponseServerIO } from "../../lib"

type Request = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  const body = req.body as Request
  const twitch = res.server.twitch

  try {
    twitch.chatClient?.say(twitch.username, body.message, {})
  } catch (error) {
    console.error(error)
  }
  res.status(200).end()
}
