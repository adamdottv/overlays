import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`srt: ${JSON.stringify(req.query)}`)
  res.status(200).end()
}
