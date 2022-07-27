import type { NextApiRequest, NextApiResponse } from "next"
// @ts-expect-error: no types available :(
import ks from "node-keys-simulator"
import { rewards, SnapFilterReward } from "../../lib/rewards"

interface Request {
  rewardId?: string
}

let lastKeys: string[] | undefined = undefined

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { rewardId } = JSON.parse(req.body) as Request

  // Empty reward means we should toggle the last filter off
  if (!rewardId) {
    if (lastKeys) {
      await ks.sendKey("space")
      await ks.sendCombination(lastKeys)
      lastKeys = undefined
    }

    return res.status(200).end()
  }

  const reward = rewards.find((r): r is SnapFilterReward => r.id === rewardId)
  const keys = reward?.keys

  if (!keys) return res.status(400).end()

  try {
    await ks.sendKey("space")
    await ks.sendCombination(keys)
    lastKeys = keys
    console.log(keys)
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  console.log("snap cam controlled")
  res.status(200).end()
}
