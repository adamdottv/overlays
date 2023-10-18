import type { NextApiRequest } from "next"
import { CustomNextApiResponse } from "../../lib"
import { fadeOut } from "../../lib/spotify"

export default async function handler(
  _req: NextApiRequest,
  res: CustomNextApiResponse
) {
  try {
    fadeOut()
    await res.server.obs.transition("Break")
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
