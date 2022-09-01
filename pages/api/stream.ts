import type { NextApiRequest } from "next"
import { NextApiResponseServerIO } from "../../lib"
import { getStreamInfo } from "../../lib/stream"

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  const stream = await getStreamInfo(res)
  res.status(200).json(stream)
}
