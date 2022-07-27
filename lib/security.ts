import { NextApiRequest } from "next"

export async function verifySender(req: NextApiRequest) {
  const { host } = req.headers
  return host === "localhost:3000"
}
