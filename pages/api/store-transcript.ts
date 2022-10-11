import { NextApiRequest } from "next"
import { CustomNextApiResponse } from "../../lib"

interface Request {
  timestamp: number
  text: string
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: CustomNextApiResponse) => {
  const body = req.body as Request
  res.server.stream.writeToCurrent(body.text, body.timestamp)

  res.status(200).end()
}
