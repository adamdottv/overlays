import fetch from "node-fetch"

export interface TwitchEventBase {
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
    tier: string
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
    status: "unfulfilled"
    redeemed_at: string
    reward: {
      id: string
      title: string
      prompt: string
      cost: number
    }
  }
}

export type TwitchEventType =
  | "channel.follow"
  | "channel.subscribe"
  | "channel.channel_points_custom_reward_redemption.add"

export type TwitchEvent =
  | TwitchChannelFollowEvent
  | TwitchChannelSubscribeEvent
  | TwitchChannelRedemptionEvent

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
  const eventTypes: TwitchEventType[] = [
    "channel.follow",
    "channel.subscribe",
    "channel.channel_points_custom_reward_redemption.add",
  ]
  for (const eventType of eventTypes) {
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
      condition: { broadcaster_user_id: userId },
    })
  }
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
