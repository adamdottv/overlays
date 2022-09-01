import { writeFileSync } from "fs"
import { NextApiResponseServerIO } from "./server"
import TwitchController from "./twitch"

export interface Stream {
  active?: boolean
  title?: string
  scheduledStart?: string
  actualStart?: string
}

export interface ScheduledStream {
  title: string
  startDate: Date
  endDate: Date
}

export interface GetStreamResponse {
  current?: Stream
  next?: Stream
  schedule: ScheduledStream[]
}

export const getStreamInfo = async (
  res: NextApiResponseServerIO
): Promise<GetStreamResponse> => {
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

  return {
    current: {
      active: !!stream,
      title,
      scheduledStart: scheduledStart
        ? scheduledStart.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          year: "numeric",
          day: "numeric",
          hour: "numeric",
        })
        : undefined,
      actualStart: actualStart
        ? actualStart.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          year: "numeric",
          day: "numeric",
          hour: "numeric",
        })
        : undefined,
    },
    next: {
      active: false,
      title: nextScheduledStream?.title,
      scheduledStart: nextStart
        ? nextStart.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          year: "numeric",
          day: "numeric",
          hour: "numeric",
        })
        : undefined,
    },
    schedule,
  }
}

export default class StreamController {
  private current: string
  private twitch: TwitchController
  private streamStartTime?: Date

  constructor(twitch: TwitchController) {
    this.twitch = twitch
    const [today] = new Date().toISOString().split("T")
    this.current = `./streams/${today}.txt`

    this.twitch.on("new-chat-message", this.handleNewChatMessage.bind(this))
    this.init()
  }

  async init() {
    const info = await this.twitch.getStreamInfo()
    this.streamStartTime = info?.startDate
  }

  handleNewChatMessage(payload: {
    channel: string
    user: string
    message: string
  }) {
    this.writeToCurrent(`${payload.user}: ${payload.message}`)
  }

  writeToCurrent(text: string, time?: number) {
    const timestamp = new Date(
      (time ?? Date.now()) - (this.streamStartTime?.getTime() ?? 0)
    )
      .toISOString()
      .substring(11, 19)
    writeFileSync(this.current, `\n\n${timestamp}\n${text}`, {
      flag: "a+",
    })
  }
}
