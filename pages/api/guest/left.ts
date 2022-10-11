import { NextApiRequest } from "next"
import { CustomNextApiResponse } from "../../../lib"

export default async function handler(
  _req: NextApiRequest,
  res: CustomNextApiResponse
) {
  try {
    res.server.stream.guest = undefined
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
