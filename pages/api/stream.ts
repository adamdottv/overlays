import type { NextApiRequest } from "next"
import { CustomNextApiResponse } from "../../lib"
import { getStreamInfo } from "../../lib/stream"

export default async function handler(
  _req: NextApiRequest,
  res: CustomNextApiResponse
) {
  const stream = await getStreamInfo(res)
  res.status(200).json(stream)
}
