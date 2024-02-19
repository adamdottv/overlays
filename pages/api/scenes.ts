import type { NextApiRequest } from "next"
import { CustomNextApiResponse } from "../../lib"

export default async function handler(
  _req: NextApiRequest,
  res: CustomNextApiResponse
) {
  const current = res.server.obs.currentScene
  const scenes = res.server.obs.scenes

  res.status(200).json({ current, scenes })
}
