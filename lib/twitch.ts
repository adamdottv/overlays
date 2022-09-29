import fetch from "node-fetch"
import { ChatClient, PrivateMessage } from "@twurple/chat"
import { RefreshingAuthProvider } from "@twurple/auth"
import { ApiClient } from "@twurple/api"
import { promises as fs, readFileSync, writeFileSync } from "fs"
import { CustomServer } from "./server"
import { ShellScriptReward, SnapFilterReward, Reward } from "./rewards"
import open from "open"
import SnapController from "./snap"
import GiveawaysController from "./giveaways"
import { EventEmitter } from "stream"
import ObsController, { Scene } from "./obs"
import { randomItem } from "./utils"

export interface TwitchChatEvent {
  channel: string
  user: string
  message: string
  broadcaster: boolean
  moderator: boolean
}

export interface TwitchEventBase {
  key: string
  subscription: {
    id: string
    status: "enabled" | "disabled"
    type: TwitchEventType
    version: "1"
    created_at: string
  }
}

export type TwitchChannelFollowEvent = TwitchEventBase & {
  type: "channel.follow"
  event: {
    user_id: string
    user_login: string
    user_name: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    followed_at: string
  }
}

export type TwitchChannelSubscribeEvent = TwitchEventBase & {
  type: "channel.subscribe"
  event: {
    user_id: string
    user_login: string
    user_name: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    tier: "1000" | "2000" | "3000"
    is_gift: boolean
  }
}

export type TwitchChannelRedemptionEvent = TwitchEventBase & {
  type: "channel.channel_points_custom_reward_redemption.add"
  event: {
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    id: string
    user_id: string
    user_login: string
    user_name: string
    user_input: string
    status: "unfulfilled" | "fulfilled"
    redeemed_at: string
    reward: {
      id: string
      title: string
      prompt: string
      cost: number
    }
  }
}

export type TwitchChannelUpdateEvent = TwitchEventBase & {
  type: "channel.update"
  event: {
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    title: string
    language: string
    category_id: string
    category_name: string
    is_mature: boolean
  }
}

export type TwitchChannelCheerEvent = TwitchEventBase & {
  type: "channel.cheer"
  event: {
    is_anonymous: boolean
    user_id: string
    user_login: string
    user_name: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    message: string
    bits: number
  }
}

export type TwitchChannelSubscriptionGiftEvent = TwitchEventBase & {
  type: "channel.subscription.gift"
  event: {
    user_id: string
    user_login: string
    user_name: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    total: number
    tier: "1000" | "2000" | "3000"
    cumulative_total: number | null //null if anonymous or not shared by the user
    is_anonymous: boolean
  }
}

export type TwitchChannelRaidEvent = TwitchEventBase & {
  type: "channel.raid"
  event: {
    from_broadcaster_user_id: string
    from_broadcaster_user_login: string
    from_broadcaster_user_name: string
    to_broadcaster_user_id: string
    to_broadcaster_user_login: string
    to_broadcaster_user_name: string
    viewers: number
  }
}

export type TwitchEventType =
  | "channel.follow"
  | "channel.subscribe"
  | "channel.channel_points_custom_reward_redemption.add"
  | "channel.update"
  | "channel.cheer"
  | "channel.subscription.gift"
  | "channel.raid"
  | "channel.hype_train.begin"
  | "channel.hype_train.progress"
  | "channel.hype_train.end"
  | "stream.online"
  | "stream.offline"

export type TwitchEvent =
  | TwitchChannelFollowEvent
  | TwitchChannelSubscribeEvent
  | TwitchChannelRedemptionEvent
  | TwitchChannelUpdateEvent
  | TwitchChannelCheerEvent
  | TwitchChannelSubscriptionGiftEvent
  | TwitchChannelRaidEvent

export interface TwitchEventSubscription {
  id: string
  status:
    | "enabled"
    | "webhook_callback_verification_pending"
    | "webhook_callback_verification_failed"
    | "notification_failures_exceeded"
    | "authorization_revoked"
    | "user_removed"
  type: string
  version: string
  condition: { broadcaster_user_id: string }
  created_at: string
  transport: {
    method: "webhook"
    callback: string
  }
  cost: number
}

export default class TwitchController extends EventEmitter {
  private server: CustomServer
  private snap: SnapController
  private obs: ObsController
  private apiClient?: ApiClient
  private clientId = process.env.TWITCH_CLIENT_ID as string
  private clientSecret = process.env.TWITCH_CLIENT_SECRET as string
  private webhookSecret = process.env.TWITCH_WEBHOOK_SECRET as string
  private callback = process.env.TWITCH_CALLBACK_URL as string
  private userId = process.env.TWITCH_USER_ID as string
  username = process.env.TWITCH_USERNAME as string
  rewards: Reward[] = []

  chatClient?: ChatClient

  constructor(server: CustomServer, snap: SnapController, obs: ObsController) {
    super()
    this.server = server
    this.snap = snap
    this.obs = obs

    this.obs.on("sceneChange", (scene) => this.handleSceneChange(scene))
    this.setup()
  }

  async setup() {
    if (!this.clientId) {
      console.warn("You haven't setup your Twitch environment variables!")
      return
    }

    this.setupApiClient()
    await this.setupEventSub()
    await this.setupChatBot()
    await this.setupRewards()
  }

  async setupRewards() {
    const saved = JSON.parse(
      readFileSync("./rewards.json", {
        encoding: "utf-8",
      })
    ) as Reward[]

    const convertToTwitchReward = (reward: Reward) => {
      return {
        title: reward.title,
        description: reward.description,
        cost: reward.cost,
        isEnabled: reward.enabled ?? true,
        maxRedemptionsPerStream: reward.streamMax,
        maxRedemptionsPerUserPerStream: reward.userMax,
        prompt: reward.prompt,
        userInputRequired: !!reward.prompt,
        autoFulfill: true,
      }
    }

    for (const reward of saved) {
      if (!reward.id) {
        const response = await this.apiClient?.channelPoints.createCustomReward(
          this.userId,
          convertToTwitchReward(reward)
        )

        this.rewards.push({
          ...reward,
          id: response?.id,
        })
      } else {
        await this.apiClient?.channelPoints.updateCustomReward(
          this.userId,
          reward.id,
          convertToTwitchReward(reward)
        )

        this.rewards.push(reward)
      }
    }

    writeFileSync("./rewards.json", JSON.stringify(this.rewards, undefined, 2))
  }

  setupApiClient() {
    const authProvider = getAuthProvider()
    this.apiClient = new ApiClient({ authProvider })
  }

  async enableReward(id: string) {
    console.log(`ENABLING REWARD: ${id}`)
    try {
      await this.apiClient?.channelPoints.updateCustomReward(this.userId, id, {
        isPaused: false,
      })
    } catch (error) {
      console.error(error)
    }
  }

  async disableReward(id: string) {
    await this.apiClient?.channelPoints.updateCustomReward(this.userId, id, {
      isPaused: true,
    })
  }

  async enableRewards() {
    for (const reward of this.rewards) {
      if (
        !reward.id ||
        (reward.type !== "snap-filter" && reward.type !== "shell")
      )
        continue

      await this.enableReward(reward.id)
    }
  }

  async disableRewards() {
    for (const reward of this.rewards) {
      if (
        !reward.id ||
        (reward.type !== "snap-filter" && reward.type !== "shell")
      )
        continue

      await this.disableReward(reward.id)
    }
  }

  async handleSceneChange(scene: Scene) {
    switch (scene) {
      case "Init":
      case "Intro":
      case "Break":
      case "Outro":
        await this.disableRewards()
        break

      default:
        await this.enableRewards()
        break
    }
  }

  async setupEventSub() {
    const token = await this.getToken()
    const subscriptions = await listSubscriptions({
      token,
      clientId: this.clientId,
    })
    const eventTypes: [TwitchEventType, object?][] = [
      ["channel.follow"],
      ["channel.subscribe"],
      ["channel.channel_points_custom_reward_redemption.add"],
      ["channel.update"],
      ["channel.cheer"],
      ["channel.subscription.gift"],
      ["channel.raid", { to_broadcaster_user_id: this.userId }],
      ["stream.online"],
      ["stream.offline"],
    ]
    for (const [eventType, condition] of eventTypes) {
      const existing = subscriptions.find((sub) => sub.type === eventType)
      if (
        existing &&
        (existing.status === "enabled" ||
          existing.status === "webhook_callback_verification_pending")
      ) {
        continue
      }

      if (existing) {
        await deleteSubscription({
          subscription: existing,
          token,
          clientId: this.clientId,
        })
      }

      await createSubscription({
        token,
        clientId: this.clientId,
        type: eventType,
        webhookSecret: this.webhookSecret,
        callback: this.callback,
        condition: condition ?? { broadcaster_user_id: this.userId },
      })
    }
  }

  async setupChatBot() {
    const authProvider = getAuthProvider()
    this.chatClient = new ChatClient({
      authProvider,
      channels: [this.username],
    })

    try {
      await this.chatClient.connect()
    } catch (error) {
      console.error(error)
    }

    this.chatClient.onMessage(
      async (
        channel: string,
        user: string,
        message: string,
        msg: PrivateMessage
      ) => {
        this.emit("new-chat-message", { channel, user, message })

        this.server.ws.emit("twitch-chat-event", {
          channel,
          user,
          message,
          broadcaster: msg.userInfo.isBroadcaster,
          moderator: msg.userInfo.isMod,
        })
      }
    )
  }

  async handleEvent(event: TwitchEvent) {
    switch (event.subscription.type) {
      case "channel.channel_points_custom_reward_redemption.add":
        await this.redeem(event as TwitchChannelRedemptionEvent)
        break
      case "stream.online":
        this.emit("online")
        break
      case "stream.offline":
        this.emit("offline")
        break

      default:
        break
    }
  }

  async redeem(payload: TwitchChannelRedemptionEvent) {
    const reward = this.rewards.find((r) => r.id === payload.event.reward.id)
    console.log(reward)

    switch (reward?.type) {
      case "shell":
        await this.redeemShell(reward)
        break
      case "snap-filter":
        await this.redeemSnapFilter(reward)
        break
      case "giveaway-entry":
        await this.redeemGiveawayEntry(payload.event.user_name)
        break
      case "meeting":
        await this.redeemMeeting(payload)
        break

      default:
        break
    }

    if (reward?.scene) {
      await this.server.obs.switchScene(reward.scene)
    }
  }

  async redeemShell(reward: ShellScriptReward) {
    const { script } = reward
    if (!script) return

    try {
      await open(script, { background: true })
    } catch (error) {
      console.error(error)
    }
  }

  async redeemSnapFilter(reward: SnapFilterReward) {
    const { key } = reward
    if (!key) return

    try {
      await this.snap.toggleSnapFilter(key)
    } catch (error) {
      console.error(error)
    }
  }

  async redeemGiveawayEntry(username: string) {
    this.emit("new-giveaway-entry", username)
  }

  async redeemMeeting(event: TwitchChannelRedemptionEvent) {
    //     const message = `Congrats! I can't wait to hop on a call with you!
    //
    // We'll have the call live on Twitch through ping.gg. In order to set this all up, please follow these steps:
    //
    // 1. Navigate to https://ping.gg
    // 2. Login with Twitch
    // 3. After signup/signin you should land on the /dashboard page on Ping.
    // 4. Open your browser dev tools and paste the following code snippet into the console: \`const{userId}=await(await fetch("https://ping.gg/api/auth/session")).json();window.location.replace(\`https://savvycal.com/adamdotdev/632648fd?display_name=${event.event.user_name}&questions[0]=\${userId}\`)
    // 5. Hit enter and you should be redirected to a SavvyCal page to book our session.
    //
    // If you hit any snags, let me know! Looking forward chatting about whatever you'd like to discuss!
    //
    // Best,
    // Adam`
    //
    //     const test = await this.chatClient?.say(
    //       event.event.broadcaster_user_login,
    //       message
    //     )
    //     console.log(JSON.stringify(test))
  }

  async getToken() {
    const params: Record<string, string> = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "client_credentials",
    }

    const formBody = []
    for (const property in params) {
      const encodedKey = encodeURIComponent(property)
      const encodedValue = encodeURIComponent(params[property])
      formBody.push(encodedKey + "=" + encodedValue)
    }
    const body = formBody.join("&")

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body,
    })

    const { access_token: token } = (await response.json()) as {
      access_token: string
    }
    return token
  }

  async raidRandom() {
    const response = await this.apiClient?.streams.getFollowedStreams(
      this.userId
    )
    const streams = response?.data
    if (!streams) return

    const randomStream = randomItem(streams)
    await this.apiClient?.raids.startRaid(this.userId, randomStream.userId)
  }

  async getStreamInfo() {
    return this.apiClient?.streams.getStreamByUserId(this.userId)
  }

  async getSchedule() {
    return this.apiClient?.schedule.getSchedule(this.userId)
  }
}

export const getAuthProvider = () => {
  const clientId = process.env.TWITCH_CLIENT_ID as string
  const clientSecret = process.env.TWITCH_CLIENT_SECRET as string
  const tokenData = JSON.parse(readFileSync("./tokens.json", "utf-8"))

  return new RefreshingAuthProvider(
    {
      clientId,
      clientSecret,
      onRefresh: async (newTokenData) =>
        await fs.writeFile(
          "./tokens.json",
          JSON.stringify(newTokenData, null, 4),
          "utf-8"
        ),
    },
    tokenData
  )
}

const listSubscriptions = async ({
  token,
  clientId,
}: {
  token: string
  clientId: string
}) => {
  const subscriptions = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": clientId,
      },
    }
  )

  const { data } = (await subscriptions.json()) as {
    data: TwitchEventSubscription[]
  }
  return data
}

const deleteSubscription = async ({
  subscription,
  token,
  clientId,
}: {
  subscription: TwitchEventSubscription
  token: string
  clientId: string
}) => {
  const { id } = subscription
  const response = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": clientId,
      },
    }
  )

  return response
}

const createSubscription = async ({
  token,
  clientId,
  type,
  condition,
  callback,
  webhookSecret: secret,
}: {
  token: string
  clientId: string
  type: TwitchEventType
  condition: unknown
  callback: string
  webhookSecret: string
}) => {
  const body = JSON.stringify({
    type,
    version: "1",
    condition,
    transport: {
      method: "webhook",
      callback,
      secret,
    },
  })

  try {
    const subscription = await fetch(
      "https://api.twitch.tv/helix/eventsub/subscriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": clientId,
          "Content-Type": "application/json",
        },
        body,
      }
    )

    const response = await subscription.json()
    return response
  } catch (error) {
    console.error(error)
  }
}
