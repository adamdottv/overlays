import type { NextApiRequest } from "next"
import { NextApiResponseServerIO } from "../../../lib"

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  try {
    await res.server.obs.endStream()
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
