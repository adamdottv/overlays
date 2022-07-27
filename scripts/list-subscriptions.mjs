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

console.log(subscriptions.status)

const { data } = await subscriptions.json()
console.log(data)
