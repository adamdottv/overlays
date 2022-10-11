import type { NextApiRequest } from "next"
import { ShellScriptReward } from "../../lib/rewards"
import open from "open"
import { CustomNextApiResponse } from "../../lib"

interface Request {
  rewardId?: string
}

export default async function handler(
  req: NextApiRequest,
  res: CustomNextApiResponse
) {
  const server = res.server
  const { rewardId } = JSON.parse(req.body) as Request
  const reward = server.twitch.rewards.find(
    (r): r is ShellScriptReward => r.id === rewardId
  )
  if (!reward) return res.status(400).end()

  const { script } = reward
  if (!script) return res.status(400).end()

  try {
    await open(script, { background: true })
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  console.log(`${reward.script} executed`)
  res.status(200).end()
}
