import { HelixStream } from "@twurple/api/lib"
import { writeFileSync } from "fs"
import { CustomNextApiResponse, CustomServer } from "./server"
import TwitchController from "./twitch"
import { delay, formatDate, randomItem } from "./utils"
// import { TwitterApi, TwitterV2IncludesHelper } from "twitter-api-v2"
// import * as tf from "@tensorflow/tfjs-node"
// import * as nsfw from "nsfwjs"
// import fetch from "node-fetch"
import { Scene } from "./obs"
import { fadeIn, fadeOut } from "./spotify"
import open from "open"

// const appToken = process.env.TWITTER_TOKEN as string

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

export type Segment = "twitter" | "larabar" | "rant" | "work" | "dax"

export interface SegmentRequest {
  key: Segment
  title: string
  track?: string
  to?: Scene
  transition?: Scene
  duration?: string
  silent?: boolean
}

const getRandomScene = (): Scene => {
  return randomItem(["Behind Screen", "Mobile"])
}

const openTweets = async (urls: URL[]) => {
  for (const tweet of urls) {
    await open(tweet.toString(), {
      background: true,
      app: { name: "google chrome" },
    })
  }
}

export const songs = [
  "theme-synth-pop.wav",
  "theme-piano-stem.wav",
  "theme-lofi.wav",
  "theme-classical.wav",
  "theme-edm.wav",
  "theme-tonight-show.wav",
  "theme-ballad.wav",
  "theme-run-dmc.wav",
  "theme-nintendo.wav",
  "theme-horror.wav",
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
    image: "./images/thdxr.jpeg",
  },
  jason: {
    name: "Jason Lengstorf",
    ping: "ckytaoafs112709mmcx3p9ozg",
    twitter: "jlengstorf",
    image: "./images/jason.jpg",
  },
  me: {
    name: "Adam Elmore",
    ping: "cl5ik2bx3058309jnknijgnoy",
    twitter: "adamdotdev",
    image: "./images/adam.png",
  },
}

const focusScenes: Scene[] = ["Mobile", "Behind Screen"] //, "Camera (Chroma)"]

export default class StreamController {
  private current: string
  private server: CustomServer
  private twitch: TwitchController
  private metadata?: HelixStream | null
  private _guest?: Guest = undefined
  private tweets: URL[] = []
  // private model: nsfw.NSFWJS | undefined
  private _focused: Boolean = false
  private focusTimer: NodeJS.Timer | undefined
  private _segment: SegmentRequest | undefined
  private previousScene: Scene | undefined

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

  get focused() {
    return this._focused
  }

  set focused(value: Boolean) {
    this._focused = value

    if (value) {
      this.server.emit("focused")
      this.server.ws.emit("focused", {})
      this.focusTimer = setInterval(() => {
        const nextScene = randomItem(focusScenes)
        this.server.obs.setScene(nextScene)
      }, 1000 * 60 * 1)
    } else {
      this.server.emit("unfocused")
      this.server.ws.emit("unfocused", {})
      this.focusTimer && clearInterval(this.focusTimer)
    }
  }

  get segment() {
    return this._segment
  }

  set segment(value: SegmentRequest | undefined) {
    this.handleSegmentRequest(value)
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
    // this.model = await nsfw.load()
  }

  async handleStreamOnline() {
    await this.init()
  }

  async handleStreamOffline() {
    await this.init()
  }

  async handleSegmentRequest(request: SegmentRequest | undefined) {
    try {
      fadeOut()

      if (!request || request.key === this._segment?.key) {
        this.server.ws.emit("segment", {
          title: this._segment?.title,
          track: "/media/tada-05.wav",
        })
        // this.server.obs.setScene(this._segment?.transition ?? getRandomScene())

        if (request?.key === "twitter")
          this.server.off("new-tweets", openTweets)
        await delay(1000 * 3)
        this.server.ws.emit("segment", null)
        this.server.obs.setScene(this.previousScene!)
        fadeIn()
        this._segment = undefined
        return
      }

      this._segment = request
      this.previousScene = this.server.obs.currentScene

      this.server.ws.emit("segment", {
        title: request.title,
        track: request.track,
      })
      this.server.obs.setScene(request.transition ?? getRandomScene())

      if (request.key === "twitter") {
        const tweets = this.server.stream.readTweets()
        await openTweets(tweets)

        this.server.on("new-tweets", openTweets)
      } else {
        this.server.off("new-tweets", openTweets)
      }

      await delay(1000 * Number.parseInt(request.duration ?? "10"))
      this.server.ws.emit("segment", null)
      this.server.obs.setScene(request.to ?? this.previousScene!)
      if (!request.silent) fadeIn()
    } catch (error) {
      console.error(error)
    }
  }

  getTweetUrls(str: string) {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/gi
    const urls = str.match(regex)
    return urls || []
  }

  readTweets() {
    const tweets = [...this.tweets]
    this.tweets = []
    return tweets
  }

  async moderateTweets(urls: URL[]) {
    // const ids: Record<string, URL> = {}
    // for (const url of urls) {
    //   const { pathname } = url
    //   const [, , , id] = pathname.split("/")
    //   ids[id] = url
    // }
    //
    // const client = new TwitterApi(process.env.TWITTER_TOKEN as string)
    // const twitterClient = client.readOnly
    //
    // const tweetIds = Object.keys(ids)
    // const tweets = await twitterClient.v2.tweets(tweetIds, {
    //   expansions: ["attachments.media_keys"],
    //   "media.fields": ["url", "preview_image_url", "variants"],
    // })
    //
    // const safeTweets = []
    // const includes = new TwitterV2IncludesHelper(tweets)
    // for (const tweet of tweets.data) {
    //   const medias = includes.medias(tweet)
    //
    //   let safe = true
    //   for (const media of medias) {
    //     if (media.preview_image_url) {
    //       const pic = await fetch(media.preview_image_url)
    //       const buffer = Buffer.from(await pic.arrayBuffer())
    //       const image = tf.node.decodeImage(buffer, 3) as tf.Tensor3D
    //       const predictions = await this.model!.classify(image)
    //       image.dispose() // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
    //       if (
    //         predictions &&
    //         predictions.find(
    //           (p) =>
    //             (p.className === "Porn" || p.className === "Hentai") &&
    //             p.probability > 0.5
    //         )
    //       ) {
    //         safe = false
    //       }
    //     }
    //   }
    //
    //   if (safe) safeTweets.push(ids[tweet.id])
    // }
    //
    // return safeTweets
  }

  async processMessage(message: string) {
    // const tweetUrls = this.getTweetUrls(message)
    // if (tweetUrls) {
    //   const urls = tweetUrls.map((s) => new URL(s))
    //   const safeUrls = await this.moderateTweets(urls)
    //   this.tweets.push(...safeUrls)
    //   this.server.emit("new-tweets", safeUrls)
    // }
  }

  handleNewChatMessage(payload: {
    channel: string
    user: string
    message: string
  }) {
    this.processMessage(payload.message)
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
