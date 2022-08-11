import { spawnSync } from "child_process"
import type { NextApiRequest, NextApiResponse } from "next"

interface Request {
  text?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { text } = JSON.parse(req.body) as Request

  try {
    spawnSync("bash", ["./scripts/notify.sh", text ?? ""])
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
