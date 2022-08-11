import { TwitchEvent } from "../lib/twitch"
import { useEvent } from "./use-event"
import { useSocket } from "./use-socket"

export const useTwitchEvent = (handler: (event: TwitchEvent) => void) => {
  const { socket } = useSocket()
  useEvent<TwitchEvent>(socket, "twitch-event", (e) =>
    handler({ ...e, type: e.subscription.type } as TwitchEvent)
  )
}
