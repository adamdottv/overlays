import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`ping: ${req.query.id}`)
  res.status(200).end()
}
