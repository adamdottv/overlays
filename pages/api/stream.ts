import type { NextApiRequest, NextApiResponse } from "next"

import { ApiClient } from "@twurple/api"
import { getAuthProvider } from "../../lib/twitch"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = process.env.TWITCH_USER_ID as string
  const authProvider = await getAuthProvider()
  const apiClient = new ApiClient({ authProvider })
  const stream = await apiClient.streams.getStreamByUserId(userId)
  const {
    data: { segments },
  } = await apiClient.schedule.getSchedule(userId)

  const { title, startDate: actualStart } = stream || {}
  const schedule = segments.map(({ title, startDate, endDate }) => ({
    title,
    startDate,
    endDate,
  }))

  const [currentScheduledStream] = schedule
  const nextScheduledStream = schedule.find((s) => s.startDate > new Date())
  const { startDate: scheduledStart } = currentScheduledStream || {}
  const { startDate: nextStart } = nextScheduledStream || {}

  res.status(200).json({
    current: {
      active: !!stream,
      title,
      scheduledStart,
      actualStart,
    },
    next: {
      active: false,
      title: nextScheduledStream?.title,
      scheduledStart: nextStart,
    },
    schedule,
  })
}
