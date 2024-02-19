import type { NextApiRequest } from "next"
import { CustomNextApiResponse } from "../../lib"

export default async function handler(
  _req: NextApiRequest,
  res: CustomNextApiResponse
) {
  res.status(401).json({ error: "Unauthorized" })
}
