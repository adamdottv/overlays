import type { NextApiRequest } from "next"
import { fadeIn } from "../../../lib/spotify"
import { CustomNextApiResponse } from "../../../lib"

export default async function handler(
  _req: NextApiRequest,
  res: CustomNextApiResponse
) {
  try {
    await fadeIn()
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
