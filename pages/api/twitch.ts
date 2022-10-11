import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"
import { TwitchEvent } from "../../lib/twitch"
import { CustomNextApiResponse } from "../../lib/server"

const secret = process.env.TWITCH_WEBHOOK_SECRET as string

// Notification request headers
const TWITCH_MESSAGE_ID = "Twitch-Eventsub-Message-Id".toLowerCase()
const TWITCH_MESSAGE_TIMESTAMP =
  "Twitch-Eventsub-Message-Timestamp".toLowerCase()
const TWITCH_MESSAGE_SIGNATURE =
  "Twitch-Eventsub-Message-Signature".toLowerCase()
const MESSAGE_TYPE = "Twitch-Eventsub-Message-Type".toLowerCase()

// Notification message types
const MESSAGE_TYPE_VERIFICATION = "webhook_callback_verification"
const MESSAGE_TYPE_NOTIFICATION = "notification"
const MESSAGE_TYPE_REVOCATION = "revocation"

// Prepend this string to the HMAC that's created from the message
const HMAC_PREFIX = "sha256="

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const message = getHmacMessage(req)
  const hmac = HMAC_PREFIX + getHmac(secret, message) // Signature to compare

  if (verifyMessage(hmac, req.headers[TWITCH_MESSAGE_SIGNATURE] as string)) {
    console.log("signatures match")

    const notification = req.body
    console.log(notification)

    if (MESSAGE_TYPE_NOTIFICATION === req.headers[MESSAGE_TYPE]) {
      await handleEvent(
        notification as TwitchEvent,
        res as CustomNextApiResponse
      )
      return res.status(200).end()
    } else if (MESSAGE_TYPE_VERIFICATION === req.headers[MESSAGE_TYPE]) {
      return res.status(200).send(notification.challenge)
    } else if (MESSAGE_TYPE_REVOCATION === req.headers[MESSAGE_TYPE]) {
      console.log(`${notification.subscription.type} notifications revoked!`)
      console.log(`reason: ${notification.subscription.status}`)
      console.log(
        `condition: ${JSON.stringify(
          notification.subscription.condition,
          null,
          4
        )}`
      )
      return res.status(200).end()
    } else {
      console.log(`Unknown message type: ${req.headers[MESSAGE_TYPE]}`)
      return res.status(200).end()
    }
  } else {
    return res.status(403).end()
  }
}

async function handleEvent(payload: TwitchEvent, res: CustomNextApiResponse) {
  res.server.ws.emit("twitch-event", payload)

  try {
    await res.server.twitch.handleEvent(payload)
  } catch (error) {
    console.error(error)
  }
}

// Build the message used to get the HMAC.
function getHmacMessage(req: NextApiRequest) {
  return (
    (((req.headers[TWITCH_MESSAGE_ID] as string) +
      req.headers[TWITCH_MESSAGE_TIMESTAMP]) as string) +
    JSON.stringify(req.body)
  )
}

// Get the HMAC.
function getHmac(secret: string, message: string) {
  return crypto.createHmac("sha256", secret).update(message).digest("hex")
}

// Verify whether our hash matches the hash that Twitch passed in the header.
function verifyMessage(hmac: string, verifySignature: string) {
  if (!hmac || !verifySignature) return false

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature))
}
