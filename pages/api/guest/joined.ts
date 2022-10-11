import { NextApiRequest } from "next"
import { CustomNextApiResponse } from "../../../lib"
import { guests } from "../../../lib/stream"

export default async function handler(
  req: NextApiRequest,
  res: CustomNextApiResponse
) {
  const guest = req.query.guest as string
  if (!guest) return

  try {
    const data = guest in guests ? guests[guest] : undefined
    if (data) res.server.stream.guest = data
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
