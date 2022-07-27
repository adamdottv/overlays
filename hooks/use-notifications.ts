import React from "react"
import { useMachine } from "@xstate/react"
import { createMachine, assign } from "xstate"

export interface NotificationContext<T> {
  notifications: T[]
}

export const notificationsMachineFactory = <T>(interval: number) =>
  createMachine<NotificationContext<T>>({
    id: "toggle",
    context: {
      notifications: [],
    },
    invoke: {
      src: () => (sendBack) => {
        const i = setInterval(() => {
          sendBack("notification.interval")
        }, interval)

        return () => clearInterval(i)
      },
    },
    on: {
      "notification.add": {
        actions: assign({
          notifications: (ctx, e) => {
            return ctx.notifications.concat(e.notification)
          },
        }),
      },
      "notification.interval": {
        actions: assign({
          notifications: (ctx) => {
            ctx.notifications.shift()
            return ctx.notifications
          },
        }),
      },
    },
  })

export function useNotifications<T>(input: {
  initialNotifications?: T[]
  limit?: number
  interval?: number
}) {
  const { initialNotifications = [], limit = 5, interval = 1000 * 10 } = input

  const machine = React.useMemo(() => {
    return notificationsMachineFactory<T>(interval)
  }, [interval])

  const [state, send] = useMachine(
    machine.withContext({
      notifications: initialNotifications,
    })
  )

  return {
    notifications: state.context.notifications.slice(0, limit),
    notify: (notification: T) => {
      send({ type: "notification.add", notification })
    },
  }
}
