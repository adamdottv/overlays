import type { NextPage } from "next"
import Head from "next/head"
import React, { useEffect } from "react"
import { useEvent, useQueue } from "../hooks"
import type {
  TwitchChannelFollowEvent,
  TwitchChannelRedemptionEvent,
  TwitchChannelSubscribeEvent,
  TwitchEvent,
} from "../lib/twitch"
import { Notification } from "../components"
import { useRouter } from "next/router"
import { getReward } from "../lib/rewards"

const getTimeoutForReward = (event?: TwitchChannelRedemptionEvent) => {
  if (!event) return 0

  const reward = getReward(event.event.reward.id)
  switch (reward?.type) {
    case "shell":
      return 100

    case "snap-filter":
      return 5 * 60 * 1000

    default:
      return 0
  }
}

const Home: NextPage = () => {
  const router = useRouter()
  const [, setNotifications, activeNotification] = useQueue<
    TwitchChannelFollowEvent | TwitchChannelSubscribeEvent
  >()
  const [, setRedemptions, activeRedemption] =
    useQueue<TwitchChannelRedemptionEvent>(getTimeoutForReward)

  const handleTwitchEvent = (event: TwitchEvent) => {
    if (event.type === "channel.follow" || event.type === "channel.subscribe") {
      setNotifications((notifications) => [...notifications, event])
    }
    if (event.type === "channel.channel_points_custom_reward_redemption.add") {
      setRedemptions((redemptions) => [...redemptions, event])
    }
  }

  useEvent<TwitchEvent>("twitch-event", (e) =>
    handleTwitchEvent({ ...e, type: e.subscription.type } as TwitchEvent)
  )

  useEffect(() => {
    const rewardId = activeRedemption?.event.reward.id
    const reward = getReward(rewardId)

    // If there's no active redemption, we need to toggle the snap filter off
    if (!activeRedemption || reward?.type === "snap-filter") {
      fetch("/api/snap", {
        method: "post",
        body: JSON.stringify({ rewardId }),
      })
    } else if (reward?.type === "shell") {
      fetch("/api/shell", {
        method: "post",
        body: JSON.stringify({ rewardId }),
      })
    }
  }, [activeRedemption])

  useEffect(() => {
    const timer = setInterval(() => {
      fetch(`/api/ping?id=${router.query.id}`, {
        method: "post",
      })
    }, 1000 * 5)
    return () => clearInterval(timer)
  }, [router.query.id])

  return (
    <div className="relative h-[1080px] w-[1920px]">
      <Head>
        <title>Adam&apos;s Twitch Overlay</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {activeNotification && (
        <Notification>
          {contentFromTwitchEvent(activeNotification)}
        </Notification>
      )}
    </div>
  )
}

export default Home

function contentFromTwitchEvent(event: TwitchEvent) {
  switch (event.subscription.type) {
    case "channel.follow":
      return `${event.event.user_name} followed!`
    case "channel.subscribe":
      return `${event.event.user_name} subscribed!`

    default:
      break
  }
}
