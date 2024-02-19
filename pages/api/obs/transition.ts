import type { NextApiRequest } from "next"
import { CustomNextApiResponse } from "../../../lib"
import { Scene } from "../../../lib/obs"

interface Request {
  to: Scene
}

export default async function handler(
  req: NextApiRequest,
  res: CustomNextApiResponse
) {
  const { to } = req.query as unknown as Request
  console.log(`Transitioning to ${to}`)

  try {
    await res.server.obs.transition(to)
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
