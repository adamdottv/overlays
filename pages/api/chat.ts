import { NextApiRequest } from "next"
import { NextApiResponseServerIO } from "../../lib"

type Request = {
  message: string
  announce?: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  const body = req.body as Request
  const twitch = res.server.twitch
  // const chat = twitch.chatClient!
  // const fn = body.announce ? chat.announce : chat.say

  try {
    res.server.twitch.chatClient?.announce(twitch.username, body.message)
  } catch (error) {
    console.error(error)
  }
  res.status(200).end()
}
