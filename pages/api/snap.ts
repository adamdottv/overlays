import type { NextApiRequest } from "next"
import { NextApiResponseServerIO } from "../../lib"
import { SnapFilterReward } from "../../lib/rewards"

interface Request {
  rewardId?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  const server = res.server
  const { rewardId } = req.body as Request // JSON.parse(req.body) as Request
  const reward = server.twitch.rewards.find(
    (r) => r.id === rewardId
  ) as SnapFilterReward
  const key = reward?.key

  try {
    const result = await res.server.snap.toggleSnapFilter(key)
    res.status(result ? 200 : 400).end()
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }
}
