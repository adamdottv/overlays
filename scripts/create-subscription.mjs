import fetch from "node-fetch"
import { getToken } from "./twitch-auth.mjs"
const [client_id, client_secret, broadcaster_user_id, callback, secret] =
  process.argv.slice(2)

const token = await getToken(client_id, client_secret)

const subscribe = async (type, condition = { broadcaster_user_id }) => {
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
          "Client-Id": client_id,
          "Content-Type": "application/json",
        },
        body,
      }
    )
    console.log(subscription.statusText)

    const { data } = await subscription.json()
    return data
  } catch (error) {
    console.error(error)
  }
}

await subscribe("channel.follow")
await subscribe("channel.raid", { to_broadcaster_user_id: broadcaster_user_id })
await subscribe("channel.subscribe")
await subscribe("channel.cheer")
await subscribe("channel.channel_points_custom_reward_redemption.add")
