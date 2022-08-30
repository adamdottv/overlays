import { NextApiRequest, NextApiResponse } from "next"
import fetch from "node-fetch"

// eslint-disable-next-line import/no-anonymous-default-export
export default async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const response = await fetch(
      "https://api.assemblyai.com/v2/realtime/token",
      {
        method: "POST",
        body: JSON.stringify({ expires_in: 3600 }),
        headers: {
          "Content-Type": "application/json",
          authorization: process.env.ASSEMBLY_AI_API_TOKEN as string,
        },
      }
    )
    const body = await response.json()
    return res.status(200).json(body)
  } catch (error) {
    // console.error(error)
    const {
      // @ts-ignore
      response: { status, data },
    } = error
    res.status(status).json(data)
  }
}
