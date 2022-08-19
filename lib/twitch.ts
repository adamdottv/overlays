import fetch from "node-fetch"
import { ChatClient, PrivateMessage } from "@twurple/chat"
import { RefreshingAuthProvider } from "@twurple/auth"
import { promises as fs } from "fs"
import { CustomServer } from "./server"
import {
  ShellScriptReward,
  SnapFilterReward,
  getReward,
  GiveawayEntryReward,
} from "./rewards"
import open from "open"
import SnapController from "./snap"
import GiveawaysController from "./giveaways"

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

export async function setupTwitchEventSub() {
  const clientId = process.env.TWITCH_CLIENT_ID as string
  const clientSecret = process.env.TWITCH_CLIENT_SECRET as string
  const webhookSecret = process.env.TWITCH_WEBHOOK_SECRET as string
  const callback = process.env.TWITCH_CALLBACK_URL as string
  const userId = process.env.TWITCH_USER_ID as string

  const token = await getToken({ clientId, clientSecret })
  const subscriptions = await listSubscriptions({ token, clientId })
  const eventTypes: [TwitchEventType, object?][] = [
    ["channel.follow"],
    ["channel.subscribe"],
    ["channel.channel_points_custom_reward_redemption.add"],
    ["channel.update"],
    ["channel.cheer"],
    ["channel.subscription.gift"],
    ["channel.raid", { to_broadcaster_user_id: userId }],
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
        clientId,
      })
    }

    await createSubscription({
      token,
      clientId,
      type: eventType,
      webhookSecret,
      callback,
      // Note: this condition will change when we add new event types
      condition: condition ?? { broadcaster_user_id: userId },
    })
  }
}

export async function setupTwitchChatBot(server: CustomServer) {
  const authProvider = await getAuthProvider()
  const chatClient = new ChatClient({ authProvider, channels: ["adamelmore"] })

  try {
    await chatClient.connect()
  } catch (error) {
    console.error(error)
  }

  chatClient.onMessage(
    async (
      channel: string,
      user: string,
      message: string,
      msg: PrivateMessage
    ) => {
      if (message.startsWith("!winner") && user === "adamelmore") {
        server.giveaways.selectWinner()
      }

      server.ws.emit("twitch-chat-event", {
        channel,
        user,
        message,
        broadcaster: msg.userInfo.isBroadcaster,
        moderator: msg.userInfo.isMod,
      })
    }
  )
}

export async function handleTwitchEvent(
  event: TwitchEvent,
  server: CustomServer
) {
  switch (event.subscription.type) {
    case "channel.channel_points_custom_reward_redemption.add":
      await redeem(event as TwitchChannelRedemptionEvent, server)
      break

    default:
      break
  }
}

async function redeem(
  payload: TwitchChannelRedemptionEvent,
  server: CustomServer
) {
  const reward = getReward(payload.event.reward.id)
  switch (reward?.type) {
    case "shell":
      await redeemShell(reward)
      break
    case "snap-filter":
      await redeemSnapFilter(reward, server.snap)
      break
    case "giveaway-entry":
      await redeemGiveawayEntry(payload.event.user_name, server.giveaways)
      break

    default:
      break
  }

  if (reward?.scene) {
    await server.obs.switchScene(reward.scene)
  }
}

export const getAuthProvider = async () => {
  const clientId = process.env.TWITCH_CLIENT_ID as string
  const clientSecret = process.env.TWITCH_CLIENT_SECRET as string
  const tokenData = JSON.parse(await fs.readFile("./tokens.json", "utf-8"))

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

async function redeemShell(reward: ShellScriptReward) {
  const { script } = reward
  if (!script) return

  try {
    await open(script, { background: true })
  } catch (error) {
    console.error(error)
  }
}

async function redeemSnapFilter(
  reward: SnapFilterReward,
  snap: SnapController
) {
  const { key } = reward
  if (!key) return

  try {
    await snap.toggleSnapFilter(key)
  } catch (error) {
    console.error(error)
  }
}

async function redeemGiveawayEntry(
  userName: string,
  giveaways: GiveawaysController
) {
  giveaways.handleNewEntry(userName)
}

const getToken = async ({
  clientId,
  clientSecret,
}: {
  clientId: string
  clientSecret: string
}) => {
  const params: Record<string, string> = {
    client_id: clientId,
    client_secret: clientSecret,
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
