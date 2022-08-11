import { useMachine } from "@xstate/react"
import { createMachine, assign } from "xstate"

export interface NotificationContext {
  notifications: object[]
}

export const notificationsMachine = createMachine<NotificationContext>({
  id: "toggle",
  context: {
    notifications: [],
  },
  invoke: {
    src: () => (sendBack) => {
      const i = setInterval(() => {
        sendBack("notification.interval")
      }, 5 * 1000)

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

export function useNotifications<T extends object>(input: { limit?: number }) {
  const { limit = 1 } = input
  const [state, send] = useMachine(notificationsMachine)

  return {
    notifications: state.context.notifications.slice(0, limit) as T[],
    notify: (notification: T) => {
      send({ type: "notification.add", notification })
    },
  }
}
