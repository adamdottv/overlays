import type { NextApiRequest } from "next"
import { NextApiResponseServerIO } from "../../lib"
import { goToPose } from "../../lib/edelkrone"
import { delay } from "../../lib/utils"

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  try {
    await goToPose(1)
    await delay(15000)
    res.server.ws.emit("fade-audio-out", {})
    await delay(3000)
    await res.server.obs.switchScene("Camera")
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
