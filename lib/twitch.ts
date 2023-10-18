import { ChatClient, ChatMessage } from "@twurple/chat"
import { RefreshingAuthProvider } from "@twurple/auth"
import { ApiClient } from "@twurple/api"
import { EventSubWsListener } from "@twurple/eventsub-ws"
import { promises as fs, readFileSync, writeFileSync } from "fs"
import { CustomServer } from "./server"
import {
  ShellScriptReward,
  SnapFilterReward,
  Reward,
  CustomReward,
} from "./rewards"
import open from "open"
import SnapController from "./snap"
import { Scene } from "./obs"
import { randomItem } from "./utils"
import { fadeOut } from "./spotify"

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
    type: TwitchEventType
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

const rewardsPath = "./data/rewards.json"

export default class TwitchController {
  private server: CustomServer
  private snap: SnapController
  private apiClient?: ApiClient
  private listener?: EventSubWsListener
  private clientId = process.env.TWITCH_CLIENT_ID as string
  private userId = process.env.TWITCH_USER_ID as string
  username = process.env.TWITCH_USERNAME as string
  rewards: Reward[] = []

  chatClient?: ChatClient

  constructor(server: CustomServer, snap: SnapController) {
    this.server = server
    this.snap = snap

    this.server.on("sceneChange", (scene) => this.handleSceneChange(scene))
    this.setup()
  }

  async setup() {
    if (!this.clientId) {
      console.warn("You haven't setup your Twitch environment variables!")
      return
    }

    await this.setupApiClient()
    await this.setupRewards()
    await this.setupEventSub()
    await this.setupChatBot()
  }

  async setupRewards() {
    const saved = JSON.parse(
      readFileSync(rewardsPath, {
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

    writeFileSync(rewardsPath, JSON.stringify(this.rewards, undefined, 2))
  }

  async setupApiClient() {
    const authProvider = await getAuthProvider()
    this.apiClient = new ApiClient({ authProvider })
  }

  async enableReward(id: string) {
    try {
      await this.apiClient?.channelPoints.updateCustomReward(this.userId, id, {
        isEnabled: true,
        isPaused: false,
      })
    } catch (error) {
      console.error("failed to enable reward " + id)
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
        await this.disableRewards()
      case "Outro":
        fadeOut()
        break

      default:
        await this.enableRewards()
        break
    }
  }

  async setupEventSub() {
    this.listener = new EventSubWsListener({
      apiClient: this.apiClient!,
    })

    this.listener.onChannelFollow(this.userId, this.userId, (event) => {
      this.handleEvent({
        key: "",
        subscription: {
          type: "channel.follow",
        },
        type: "channel.follow",
        event: {
          user_id: event.userId,
          user_name: event.userDisplayName,
          user_login: event.userName,
          broadcaster_user_id: event.broadcasterId,
          broadcaster_user_login: event.broadcasterName,
          broadcaster_user_name: event.broadcasterDisplayName,
          followed_at: event.followDate.toISOString(),
        },
      })
    })

    for (const reward of this.rewards.filter((r) => !!r.id)) {
      this.listener.onChannelRedemptionAddForReward(
        this.userId,
        reward.id as string,
        (event) => {
          this.handleEvent({
            key: "",
            subscription: {
              type: "channel.channel_points_custom_reward_redemption.add",
            },
            type: "channel.channel_points_custom_reward_redemption.add",
            event: {
              id: event.id,
              user_id: event.userId,
              user_name: event.userDisplayName,
              user_login: event.userName,
              user_input: event.input,
              broadcaster_user_id: event.broadcasterId,
              broadcaster_user_login: event.broadcasterName,
              broadcaster_user_name: event.broadcasterDisplayName,
              status: event.status as "unfulfilled" | "fulfilled",
              redeemed_at: event.redemptionDate.toISOString(),
              reward: {
                id: event.rewardId,
                title: event.rewardTitle,
                prompt: event.rewardPrompt,
                cost: event.rewardCost,
              },
            },
          })
        }
      )
    }

    this.listener.onChannelSubscription(this.userId, (event) => {
      this.handleEvent({
        key: "",
        subscription: {
          type: "channel.subscribe",
        },
        type: "channel.subscribe",
        event: {
          user_id: event.userId,
          user_name: event.userDisplayName,
          user_login: event.userName,
          broadcaster_user_id: event.broadcasterId,
          broadcaster_user_login: event.broadcasterName,
          broadcaster_user_name: event.broadcasterDisplayName,
          tier: event.tier,
          is_gift: event.isGift,
        },
      })
    })

    this.listener.onChannelUpdate(this.userId, (event) => {
      this.handleEvent({
        key: "",
        subscription: {
          type: "channel.update",
        },
        type: "channel.update",
        event: {
          broadcaster_user_id: event.broadcasterId,
          broadcaster_user_login: event.broadcasterName,
          broadcaster_user_name: event.broadcasterDisplayName,
          title: event.streamTitle,
          language: event.streamLanguage,
          category_id: event.categoryId,
          category_name: event.categoryName,
          is_mature: event.isMature,
        },
      })
    })

    this.listener.onChannelCheer(this.userId, (event) => {
      this.handleEvent({
        key: "",
        subscription: {
          type: "channel.cheer",
        },
        type: "channel.cheer",
        event: {
          is_anonymous: event.isAnonymous,
          user_id: event.userId || "",
          user_name: event.userDisplayName || "",
          user_login: event.userName || "",
          broadcaster_user_id: event.broadcasterId,
          broadcaster_user_login: event.broadcasterName,
          broadcaster_user_name: event.broadcasterDisplayName,
          message: event.message,
          bits: event.bits,
        },
      })
    })

    this.listener.onChannelSubscriptionGift(this.userId, (event) => {
      this.handleEvent({
        key: "",
        subscription: {
          type: "channel.subscription.gift",
        },
        type: "channel.subscription.gift",
        event: {
          user_id: event.gifterId || "",
          user_login: event.gifterName || "",
          user_name: event.gifterDisplayName || "",
          broadcaster_user_id: event.broadcasterId,
          broadcaster_user_login: event.broadcasterName,
          broadcaster_user_name: event.broadcasterDisplayName,
          total: event.amount,
          tier: event.tier,
          cumulative_total: event.cumulativeAmount,
          is_anonymous: event.isAnonymous,
        },
      })
    })

    this.listener.onChannelRaidTo(this.userId, (event) => {
      this.handleEvent({
        key: "",
        subscription: {
          type: "channel.raid",
        },
        type: "channel.raid",
        event: {
          from_broadcaster_user_id: event.raidingBroadcasterId || "",
          from_broadcaster_user_login: event.raidingBroadcasterName || "",
          from_broadcaster_user_name: event.raidingBroadcasterDisplayName || "",
          to_broadcaster_user_id: event.raidedBroadcasterId,
          to_broadcaster_user_login: event.raidedBroadcasterName,
          to_broadcaster_user_name: event.raidedBroadcasterDisplayName,
          viewers: event.viewers,
        },
      })
    })

    this.listener.onStreamOnline(this.userId, () => this.server.emit("online"))
    this.listener.onStreamOffline(this.userId, () =>
      this.server.emit("offline")
    )

    this.listener.start()
  }

  async setupChatBot() {
    const authProvider = await getAuthProvider()
    this.chatClient = new ChatClient({
      authProvider,
      channels: [this.username],
    })

    try {
      this.chatClient.connect()
    } catch (error) {
      console.error(error)
    }

    this.chatClient.onMessage(
      async (
        channel: string,
        user: string,
        message: string,
        msg: ChatMessage
      ) => {
        this.server.emit("new-chat-message", { channel, user, message })

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
    this.server.ws.emit("twitch-event", event)

    switch (event.subscription.type) {
      case "channel.channel_points_custom_reward_redemption.add":
        await this.redeem(event as TwitchChannelRedemptionEvent)
        break
      case "stream.online":
        this.server.emit("online")
        break
      case "stream.offline":
        this.server.emit("offline")
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
      case "custom":
        await this.redeemCustom(payload, reward)
        break
      case "meeting":
        await this.redeemMeeting(payload)
        break

      default:
        break
    }

    if (reward?.scene) {
      await this.server.obs.setScene(reward.scene)
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
    this.server.emit("new-giveaway-entry", username)
  }

  async redeemCustom(
    event: TwitchChannelRedemptionEvent,
    reward: CustomReward
  ) {
    switch (reward.name) {
      case "macbook":
        const entry = Math.random() * 100
        if (entry <= 0.01) {
          console.log("WINNER!")
          await this.chatClient?.action(
            this.username,
            `OMG @${event.event.user_name} JUST WON A MACBOOK!`
          )
        }
        break

      default:
        break
    }
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

  async raidRandom() {
    const response =
      (await this.apiClient?.streams.getStreamsByUserNames([
        "thdxr",
        "theprimeagen",
        "teej_dv",
        "StudyTme",
        "acorn1010",
        "bashbunni",
        "thealtf4stream",
        "ottomated",
        "cmgriffing",
        "theo",
        "d0nutptr",
        "roxcodes",
        "melkey",
      ])) || []
    const streams = response.map((r) => r.userId)
    if (!streams) return

    const randomStream = randomItem(streams)
    await this.apiClient?.raids.startRaid(this.userId, randomStream)
  }

  async getStreamInfo() {
    return this.apiClient?.streams.getStreamByUserId(this.userId)
  }

  async getSchedule() {
    return this.apiClient?.schedule.getSchedule(this.userId)
  }
}

export const getAuthProvider = async () => {
  const clientId = process.env.TWITCH_CLIENT_ID as string
  const clientSecret = process.env.TWITCH_CLIENT_SECRET as string
  const userId = process.env.TWITCH_USER_ID as string

  const tokenData = JSON.parse(await fs.readFile("./tokens.json", "utf-8"))
  const provider = new RefreshingAuthProvider({
    clientId,
    clientSecret,
  })

  provider.onRefresh(
    async (userId, newTokenData) =>
      await fs.writeFile(
        `./tokens.json`,
        JSON.stringify(newTokenData, null, 4),
        "utf-8"
      )
  )

  // await provider.addUserForToken(tokenData, ["chat"])
  provider.addUser(userId, tokenData, ["chat"])
  return provider
}
