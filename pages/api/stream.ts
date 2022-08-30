import type { NextApiRequest } from "next"
import { NextApiResponseServerIO } from "../../lib"

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  const stream = await res.server.twitch.getStreamInfo()
  const response = await res.server.twitch.getSchedule()

  const {
    data: { segments },
  } = response ?? { data: { segments: [] } }

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
