import { spawnSync } from "child_process"
import type { NextApiRequest, NextApiResponse } from "next"
import { rewards, SnapFilterReward } from "../../lib/rewards"

interface Request {
  rewardId?: string
}

let lastKey: string | undefined = undefined

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { rewardId } = JSON.parse(req.body) as Request

  // Empty reward means we should toggle the last filter off
  if (!rewardId) {
    if (lastKey) {
      spawnSync("bash", ["./scripts/toggle-snap-filter.sh", lastKey])
      lastKey = undefined
    }

    return res.status(200).end()
  }

  const reward = rewards.find((r): r is SnapFilterReward => r.id === rewardId)
  const key = reward?.key
  if (!key) return res.status(400).end()

  try {
    spawnSync("bash", ["./scripts/toggle-snap-filter.sh", key])
    lastKey = key
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  console.log("snap cam controlled")
  res.status(200).end()
}
