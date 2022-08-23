import type { NextApiRequest, NextApiResponse } from "next"
import { NextApiResponseServerIO } from "../../lib"
import { Scene } from "../../lib/obs"

interface Request {
  to: Scene
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  const { to } = req.query as unknown as Request

  try {
    await res.server.obs.switchScene(to)
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
