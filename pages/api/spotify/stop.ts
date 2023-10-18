import type { NextApiRequest } from "next"
import { fadeOut } from "../../../lib/spotify"
import { CustomNextApiResponse } from "../../../lib"

export default async function handler(
  _req: NextApiRequest,
  res: CustomNextApiResponse
) {
  try {
    await fadeOut()
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
