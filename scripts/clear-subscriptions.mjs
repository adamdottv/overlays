import fetch from "node-fetch"
import { getToken } from "./twitch-auth.mjs"
const [client_id, client_secret] = process.argv.slice(2)

const token = await getToken(client_id, client_secret)

const subscriptions = await fetch(
  "https://api.twitch.tv/helix/eventsub/subscriptions",
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": client_id,
    },
  }
)

const { data } = await subscriptions.json()
for (const subscription of data) {
  const { id } = subscription
  const response = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": client_id,
      },
    }
  )

  console.log(`Deleted subscription ${id} (${response.status})`)
}
