import type { NextApiRequest } from "next"
import { CustomNextApiResponse } from "../../../lib"
import { SegmentRequest } from "../../../lib/stream"

export default async function handler(
  req: NextApiRequest,
  res: CustomNextApiResponse
) {
  const request = req.query as unknown as SegmentRequest
  res.server.stream.segment = request
  res.status(200).end()
}
