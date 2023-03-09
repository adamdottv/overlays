import type { NextApiRequest } from "next"
import { CustomNextApiResponse } from "../../../lib"

interface Request {
  zoomIn: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: CustomNextApiResponse
) {
  const { zoomIn } = req.query as unknown as Request

  try {
    if (zoomIn) {
      // await res.server.obs.zoomIn()
    } else {
      // await res.server.obs.zoomOut()
    }
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
