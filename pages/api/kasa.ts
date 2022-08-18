import { Client } from "tplink-smarthome-api"

import type { NextApiRequest, NextApiResponse } from "next"

interface Request {
  value?: boolean
}

const tpLinkClient = new Client()
const smartSwitchIp = "192.168.1.202"

export const toggleLight = async (value: boolean) => {
  const device = await tpLinkClient.getDevice({ host: smartSwitchIp })
  return device.setPowerState(value ?? false)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { value } = JSON.parse(req.body) as Request

  try {
    await toggleLight(value ?? false)
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }

  res.status(200).end()
}
