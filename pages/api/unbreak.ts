import type { NextApiRequest } from "next"
import { CustomNextApiResponse } from "../../lib"
import { goToPose } from "../../lib/edelkrone"
import { delay } from "../../lib/utils"

export default async function handler(
  _req: NextApiRequest,
  res: CustomNextApiResponse
) {
  try {
    // await goToPose(1)
    // await delay(15000)
    res.server.ws.emit("fade-audio-out", {})
    await delay(3000)
    await res.server.obs.transition("Camera")
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
