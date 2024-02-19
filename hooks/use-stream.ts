import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { GetStreamResponse } from "../lib/stream"
import { TwitchEvent } from "../lib/twitch"
import { request } from "../lib/utils"
import { useTwitchEvent } from "./use-twitch-event"

export const useStream = (): GetStreamResponse | undefined => {
  const { data } = useQuery<GetStreamResponse>(["stream"], async () => {
    const res = await request("/api/stream")
    return await res.json()
  })

  const { current, next, schedule } = data || {}

  const [title, setTitle] = useState(current?.title)
  useEffect(() => {
    setTitle(current?.title)
  }, [current])

  const handleTwitchEvent = (event: TwitchEvent) => {
    if (event.type === "channel.update") {
      setTitle(event.event.title)
    }
  }
  useTwitchEvent(handleTwitchEvent)

  return {
    current: {
      ...(current ?? {}),
      title,
    },
    next,
    schedule: schedule || [],
  }
}
