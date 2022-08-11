import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { GetStreamResponse, Stream } from "../lib/stream"
import { TwitchEvent } from "../lib/twitch"
import { useTwitchEvent } from "./use-twitch-event"

export type ClientStream = Stream & {
  start?: Date
}

export type UseStreamResponse = {
  current: ClientStream
  next?: ClientStream
}

export const useStream = (): UseStreamResponse | undefined => {
  const { data } = useQuery<GetStreamResponse>(["stream"], async () => {
    const res = await fetch("/api/stream")
    return await res.json()
  })

  const stream = data?.current
  const nextStream = data?.next

  const [title, setTitle] = useState(stream?.title)
  const start = stream?.scheduledStart
    ? new Date(stream.scheduledStart)
    : undefined

  const nextStart = nextStream?.scheduledStart
    ? new Date(nextStream.scheduledStart)
    : undefined

  useEffect(() => {
    setTitle(stream?.title)
  }, [stream])

  const handleTwitchEvent = (event: TwitchEvent) => {
    if (event.type === "channel.update") {
      setTitle(event.event.title)
    }
  }
  useTwitchEvent(handleTwitchEvent)

  return {
    current: {
      ...(stream ?? {}),
      active: stream?.active ?? false,
      title,
      start,
    },
    next: {
      ...(nextStream ?? {}),
      start: nextStart,
    },
  }
}
