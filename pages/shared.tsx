import type { NextPage } from "next"
import Head from "next/head"
import React, { useEffect } from "react"
import { useEvent, useQueue, useSocket, useTwitchEvent } from "../hooks"
import type { TwitchEvent } from "../lib/twitch"
import { NotifiableTwitchEvent, Notification, Stinger } from "../components"
import hash from "object-hash"
import cn from "classnames"
import { motion, AnimatePresence } from "framer-motion"

const MAX_NOTIFICATIONS = 2
const NOTIFICATION_DURATION = 3
const NOTIFICATION_PANEL_HEIGHT = MAX_NOTIFICATIONS * 100 + 65

const Shared: NextPage = () => {
  const [transitioning, setTransitioning] = React.useState(false)

  const [_, setNotifications, notifications, previous] =
    useQueue<NotifiableTwitchEvent>({
      count: MAX_NOTIFICATIONS,
      timeout: NOTIFICATION_DURATION * 1000,
    })

  const notificationsWithPrevious = [previous, ...(notifications || [])].filter(
    (notification) => !!notification
  ) as NotifiableTwitchEvent[]

  const handleTwitchEvent = (twitchEvent: TwitchEvent) => {
    const key = hash(twitchEvent)
    const event = { ...twitchEvent, key }

    if (event.type !== "channel.update") {
      setNotifications((n) => [...n, event])
    }
  }

  useTwitchEvent(handleTwitchEvent)

  const { socket } = useSocket()
  useEvent<boolean>(socket, "transitioning", (value) => {
    setTransitioning(value)
  })

  return (
    <div className="relative h-[1080px] w-[1920px]">
      <Head>
        <title>Adam&apos;s Twitch Overlay</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ul
        className={cn({
          "absolute top-10 right-10 z-50 flex w-[400px] flex-col-reverse justify-end space-y-4 space-y-reverse":
            true,
          "gradient-mask-b-80": true,
        })}
        style={{ height: NOTIFICATION_PANEL_HEIGHT }}
      >
        <AnimatePresence initial={false}>
          {notificationsWithPrevious?.map((notification) => (
            <motion.li
              key={notification.key}
              layout="position"
              initial={{ opacity: 0.33, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.33,
                type: "spring",
                damping: 25,
                stiffness: 300,
                mass: 0.5,
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.33, ease: "anticipate" },
              }}
            >
              <Notification notification={notification} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <Stinger transitioning={transitioning} />
    </div>
  )
}

export default Shared
