import { HelixStream } from "@twurple/api/lib"
import { writeFileSync } from "fs"
import { CustomNextApiResponse, CustomServer } from "./server"
import TwitchController from "./twitch"
import { formatDate } from "./utils"

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
  guest?: Guest
}

export const songs = [
  "theme-synth-pop.wav",
  "theme-piano-stem.wav",
  "theme-lofi.wav",
  "theme-classical.wav",
  "theme-edm.wav",
]

export const getStreamInfo = async (
  res: CustomNextApiResponse
): Promise<GetStreamResponse> => {
  const stream = await res.server.twitch.getStreamInfo()
  const response = await res.server.twitch.getSchedule()
  const guest = res.server.stream.guest

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
      scheduledStart: scheduledStart ? formatDate(scheduledStart) : undefined,
      actualStart: actualStart ? actualStart.toISOString() : undefined,
    },
    next: {
      active: false,
      title: nextScheduledStream?.title,
      scheduledStart: nextStart ? formatDate(scheduledStart) : undefined,
    },
    schedule,
    guest,
  }
}

export interface Guest {
  name: string
  ping: string
  twitter: string
  image?: string
}

export const guests: Record<string, Guest> = {
  davidkpiano: {
    name: "David Khourshid",
    ping: "cl79934or20060gmoj84pco4x",
    twitter: "DavidKPiano",
    image: "./images/davidkpiano.jpeg",
  },
  trash: {
    name: "Chris Bautista",
    ping: "cl97aciwy37970gl7lzans0us",
    twitter: "trash__dev",
    image: "./images/trash.jpg",
  },
  dax: {
    name: "Dax Raad",
    ping: "ckyafyuis069108lcmqyto3e7",
    twitter: "thdxr",
    image: "./images/thdxr.jpg",
  },
}

export default class StreamController {
  private current: string
  private server: CustomServer
  private twitch: TwitchController
  private metadata?: HelixStream | null
  private _guest?: Guest = undefined

  get guest() {
    return this._guest
  }

  set guest(value: Guest | undefined) {
    this._guest = value

    if (value) {
      this.server.emit("guest-joined", value)
      this.server.ws.emit("guest-joined", value)
    } else {
      this.server.emit("guest-left")
      this.server.ws.emit("guest-left", {})
    }
  }

  constructor(server: CustomServer, twitch: TwitchController) {
    this.server = server
    this.twitch = twitch

    const [today] = new Date().toISOString().split("T")
    this.current = `./data/transcripts/${today}.txt`

    this.server.on("new-chat-message", this.handleNewChatMessage.bind(this))
    this.server.on("online", this.handleStreamOnline.bind(this))
    this.server.on("offline", this.handleStreamOffline.bind(this))

    this.init()
  }

  async init() {
    this.metadata = await this.twitch.getStreamInfo()
  }

  async handleStreamOnline() {
    await this.init()
  }

  async handleStreamOffline() {
    await this.init()
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
      (time ?? Date.now()) - (this.metadata?.startDate?.getTime() ?? 0)
    )
      .toISOString()
      .substring(11, 19)
    writeFileSync(this.current, `\n\n${timestamp}\n${text}`, {
      flag: "a+",
    })
  }
}
