import { writeFileSync } from "fs"
import TwitchController from "./twitch"

export interface Stream {
  active?: boolean
  title?: string
  scheduledStart?: string
  actualStart?: string
}

export interface GetStreamResponse {
  current: Stream
  next?: Stream
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
