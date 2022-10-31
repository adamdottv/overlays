import React, { PropsWithChildren, useEffect, useState } from "react"
import { Ticker } from "./ticker"
import cn from "classnames"
import {
  TwitchChannelCheerEvent,
  TwitchChannelFollowEvent,
  TwitchChannelRaidEvent,
  TwitchChannelRedemptionEvent,
  TwitchChannelSubscribeEvent,
  TwitchChannelSubscriptionGiftEvent,
} from "../lib"
import { AnimationProps, motion } from "framer-motion"

const formatBigNumber = (number: number) => {
  if (number < 10000) {
    return number
  }
  return `${Math.floor(number / 1000)}K`
}

export interface NotificationContainerProps
  extends PropsWithChildren<React.ComponentProps<"div">> {
  accent?: "crimson" | "lime" | "mint" | "purple" | "sky"
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  children,
  accent = "lime",
  className = "",
  ...props
}) => {
  return (
    <div
      className={cn({
        "h-20 border-l bg-black backdrop-blur-lg": true,
        "border border-border": true,
        "border-l-lime": accent === "lime",
        "border-l-crimson": accent === "crimson",
        "border-l-mint": accent === "mint",
        "border-l-purple": accent === "purple",
        "border-l-sky": accent === "sky",
        [className]: true,
      })}
      {...props}
    >
      {children}
    </div>
  )
}

const newFollowerAlert =
  typeof Audio !== "undefined" ? new Audio("/media/tada-05.wav") : undefined
const newSubscriberAlert =
  typeof Audio !== "undefined" ? new Audio("/media/tada-04.wav") : undefined
const rewardRedemptionAlert =
  typeof Audio !== "undefined" ? new Audio("/media/nope.wav") : undefined
const raidAlert =
  typeof Audio !== "undefined" ? new Audio("/media/tada-02.wav") : undefined
const giftSubAlert =
  typeof Audio !== "undefined" ? new Audio("/media/tada-03.wav") : undefined
const cheerAlert =
  typeof Audio !== "undefined" ? new Audio("/media/tada-01.wav") : undefined

export interface FollowerNotificationProps {
  event: TwitchChannelFollowEvent
}

export const FollowerNotification: React.FC<FollowerNotificationProps> = ({
  event,
}) => {
  useEffect(() => {
    newFollowerAlert?.play()
  }, [])

  return (
    <NotificationContainer
      accent="lime"
      className="flex items-center justify-between px-8"
    >
      <div>
        <div className="text-xs font-semibold uppercase text-lime">
          New Follower
        </div>
        <div className="text-lg font-[400] text-white">
          @{event.event.user_name}
        </div>
      </div>
      <Ticker />
    </NotificationContainer>
  )
}

export interface SubscriberNotificationProps {
  event: TwitchChannelSubscribeEvent
}

export const SubscriberNotification: React.FC<SubscriberNotificationProps> = ({
  event,
}) => {
  useEffect(() => {
    newSubscriberAlert?.play()
  }, [])

  return (
    <NotificationContainer
      accent="crimson"
      className="flex items-center justify-between px-8"
    >
      <div>
        <div className="text-xs font-semibold uppercase text-crimson">
          Tier {event.event.tier[0]} Subscriber
        </div>
        <div className="text-lg font-[400] text-white">
          @{event.event.user_name}
        </div>
      </div>
      <Ticker />
    </NotificationContainer>
  )
}

export interface RewardRedemptionNotificationProps
  extends React.ComponentProps<"div"> {
  event: TwitchChannelRedemptionEvent
}

export const RewardRedemptionNotification: React.FC<
  RewardRedemptionNotificationProps
> = ({ event, className = "", ...props }) => {
  useEffect(() => {
    rewardRedemptionAlert?.play()
  }, [])

  return (
    <div
      className={cn({
        "relative flex h-[100px] items-center justify-between border-l bg-black px-8 backdrop-blur-lg":
          true,
        "border border-border border-l-mint": true,
        [className]: true,
      })}
      {...props}
    >
      <div className="absolute inset-y-0 right-0 h-full w-[191px] gradient-mask-l-30">
        <BrandedDots className="absolute inset-0" />
        <Confetti className="absolute inset-0" />
      </div>

      <div className="absolute inset-y-0 right-[24px] flex items-center overflow-visible text-center font-bebas font-normal text-white">
        <div className="h-[54px] w-[49px]">
          <div className="mt-2 -ml-[100%] -mr-[100%] text-[40px] leading-6">
            {formatBigNumber(event.event.reward.cost)}
          </div>
          <div className="text-xl uppercase">points</div>
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.02em] text-mint">
          Reward Redeemed
        </div>
        <div className="text-lg font-normal text-white">
          @{event.event.user_name}
        </div>
        <div className="mt-1 w-[200px] truncate text-xs font-semibold text-mauve-11">
          {event.event.reward.title}
        </div>
      </div>
    </div>
  )
}

export interface CheerNotificationProps extends React.ComponentProps<"div"> {
  event: TwitchChannelCheerEvent
}

export const CheerNotification: React.FC<CheerNotificationProps> = ({
  event,
  className = "",
  ...props
}) => {
  useEffect(() => {
    cheerAlert?.play()
  }, [])

  const cleanupCheerMessage = (message: string) => {
    return message
      .replace(
        /(Anon|Cheer|BibleThump|cheerwhal|Corgo|uni|ShowLove|Party|SeemsGood|Pride|Kappa|FrankerZ|HeyGuys|DansGame|EleGiggle|TriHard|Kreygasm|4Head|SwiftRage|NotLikeThis|FailFish|VoHiYo|PJSalt|MrDestructoid|bday|RIPCheer|Shamrock)\d+/gi,
        ""
      )
      .replace(/\s+/g, " ")
      .trim()
  }

  const message = cleanupCheerMessage(event.event.message)
  const { bits } = event.event
  const color =
    bits >= 10_000
      ? "#FE2C2D"
      : bits >= 5_000
      ? "#4FAFFC"
      : bits >= 1_000
      ? "#47D7B3"
      : bits >= 100
      ? "#C982FC"
      : "#CCC9D0"

  return (
    <div
      className={cn({
        "relative flex h-[100px] items-center justify-between border-l bg-black px-8 backdrop-blur-lg":
          true,
        "border border-border": true,
        [className]: true,
      })}
      style={{ borderLeftColor: color }}
      {...props}
    >
      <div className="absolute inset-y-0 right-0 h-full w-[191px] gradient-mask-l-30">
        <BrandedDots className="absolute inset-0" style={{ color }} />
        <Confetti className="absolute inset-0" />
      </div>

      <div className="absolute inset-y-0 right-[24px] flex items-center overflow-visible text-center font-bebas font-normal text-white">
        <div className="h-[54px] w-[49px]">
          <div className="mt-2 -ml-[100%] -mr-[100%] text-[40px] leading-6">
            {formatBigNumber(bits)}
          </div>
          <div className="text-xl uppercase">bits</div>
        </div>
      </div>
      <div>
        <div
          className="text-xs font-semibold uppercase tracking-[0.02em]"
          style={{ color }}
        >
          Cheer!
        </div>
        <div className="text-lg font-normal text-white">
          {event.event.user_name ? `@${event.event.user_name}` : "(anonymous)"}
        </div>
        <div className="mt-1 w-[200px] truncate text-xs font-semibold text-mauve-11">
          {message}
        </div>
      </div>
    </div>
  )
}

export interface SubscriptionGiftNotificationProps
  extends React.ComponentProps<"div"> {
  event: TwitchChannelSubscriptionGiftEvent
}

export const SubscriptionGiftNotification: React.FC<
  SubscriptionGiftNotificationProps
> = ({ event, className = "", ...props }) => {
  useEffect(() => {
    giftSubAlert?.play()
  }, [])

  return (
    <div
      className={cn({
        "relative flex h-[100px] items-center justify-between border-l bg-black px-8 backdrop-blur-lg":
          true,
        "border border-border border-l-sky": true,
        [className]: true,
      })}
      {...props}
    >
      <div className="absolute inset-y-0 right-0 h-full w-[191px] gradient-mask-l-30">
        <BrandedDots className="absolute inset-0 text-sky" />
        <Confetti className="absolute inset-0" />
      </div>

      <div className="absolute inset-y-0 right-[24px] flex items-center overflow-visible text-center font-bebas font-normal text-white">
        <div className="h-[54px] w-[49px]">
          <div className="mt-2 -ml-[100%] -mr-[100%] text-[40px] leading-6">
            {event.event.total}
          </div>
          <div className="text-xl uppercase">subs</div>
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.02em] text-sky">
          Subscription Gift
        </div>
        <div className="text-lg font-normal text-white">
          {event.event.user_name ? `@${event.event.user_name}` : "(anonymous)"}
        </div>
        <div className="mt-1 w-[200px] truncate text-xs font-semibold text-mauve-11">
          {`Gifted ${event.event.total}x Tier ${event.event.tier[0]} subs!`}
        </div>
      </div>
    </div>
  )
}

export interface RaidNotificationProps extends React.ComponentProps<"div"> {
  event: TwitchChannelRaidEvent
}

export const RaidNotification: React.FC<RaidNotificationProps> = ({
  event,
  className = "",
  ...props
}) => {
  useEffect(() => {
    raidAlert?.play()
  }, [])

  return (
    <div
      className={cn({
        "relative flex h-[100px] items-center justify-between border-l bg-black px-8 backdrop-blur-lg":
          true,
        "border border-border border-l-amber": true,
        [className]: true,
      })}
      {...props}
    >
      <div className="absolute inset-y-0 right-0 h-full w-[191px] gradient-mask-l-30">
        <BrandedDots className="absolute inset-0 text-amber" />
        <Confetti className="absolute inset-0" />
      </div>

      <div className="absolute inset-y-0 right-[24px] flex items-center overflow-visible text-center font-bebas font-normal text-white">
        <div className="h-[54px] w-[49px]">
          <div className="mt-2 -ml-[100%] -mr-[100%] text-[40px] leading-6">
            {event.event.viewers}
          </div>
          <div className="text-xl uppercase">
            {event.event.viewers === 1 ? "viewer" : "viewers"}
          </div>
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.02em] text-amber">
          Incoming Raid
        </div>
        <div className="text-lg font-normal text-white">
          @{event.event.from_broadcaster_user_name}
        </div>
        <div className="mt-1 w-[200px] truncate text-xs font-semibold text-mauve-11">
          {`Raiding with a party of ${event.event.viewers}!`}
        </div>
      </div>
    </div>
  )
}

export type NotifiableTwitchEvent =
  | TwitchChannelFollowEvent
  | TwitchChannelSubscribeEvent
  | TwitchChannelRedemptionEvent
  | TwitchChannelCheerEvent
  | TwitchChannelSubscriptionGiftEvent
  | TwitchChannelRaidEvent

export interface NotificationProps extends React.ComponentProps<"div"> {
  notification: NotifiableTwitchEvent
}

export const Notification: React.FC<NotificationProps> = ({
  notification,
  ...props
}) => {
  switch (notification.type) {
    case "channel.follow":
      return <FollowerNotification event={notification} {...props} />
    case "channel.subscribe":
      return <SubscriberNotification event={notification} {...props} />
    case "channel.channel_points_custom_reward_redemption.add":
      return <RewardRedemptionNotification event={notification} {...props} />
    case "channel.cheer":
      return <CheerNotification event={notification} {...props} />
    case "channel.subscription.gift":
      return <SubscriptionGiftNotification event={notification} {...props} />
    case "channel.raid":
      return <RaidNotification event={notification} {...props} />

    default:
      return null
  }
}

const BrandedDots: React.FC<React.ComponentProps<"svg">> = ({
  className = "",
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 191 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn({ "fill-current text-mint": true, [className]: className })}
      {...props}
    >
      <rect x="81" y="9" width="2" height="2" fill="currentColor" />
      <rect x="61" y="9" width="2" height="2" fill="currentColor" />
      <rect x="41" y="9" width="2" height="2" fill="currentColor" />
      <rect x="21" y="9" width="2" height="2" fill="currentColor" />
      <rect x="1" y="9" width="2" height="2" fill="currentColor" />
      <rect x="81" y="29" width="2" height="2" fill="currentColor" />
      <rect x="61" y="29" width="2" height="2" fill="currentColor" />
      <rect x="41" y="29" width="2" height="2" fill="currentColor" />
      <rect x="21" y="29" width="2" height="2" fill="currentColor" />
      <rect x="1" y="29" width="2" height="2" fill="currentColor" />
      <rect x="81" y="49" width="2" height="2" fill="currentColor" />
      <rect x="61" y="49" width="2" height="2" fill="currentColor" />
      <rect x="41" y="49" width="2" height="2" fill="currentColor" />
      <rect x="21" y="49" width="2" height="2" fill="currentColor" />
      <rect x="1" y="49" width="2" height="2" fill="currentColor" />
      <rect x="81" y="69" width="2" height="2" fill="currentColor" />
      <rect x="61" y="69" width="2" height="2" fill="currentColor" />
      <rect x="41" y="69" width="2" height="2" fill="currentColor" />
      <rect x="21" y="69" width="2" height="2" fill="currentColor" />
      <rect x="1" y="69" width="2" height="2" fill="currentColor" />
      <rect x="101" y="9" width="2" height="2" fill="currentColor" />
      <rect x="101" y="29" width="2" height="2" fill="currentColor" />
      <rect x="101" y="49" width="2" height="2" fill="currentColor" />
      <rect x="101" y="69" width="2" height="2" fill="currentColor" />
      <rect x="121" y="9" width="2" height="2" fill="currentColor" />
      <rect x="141" y="9" width="2" height="2" fill="currentColor" />
      <rect x="161" y="9" width="2" height="2" fill="currentColor" />
      <rect x="181" y="9" width="2" height="2" fill="currentColor" />
      <rect x="181" y="29" width="2" height="2" fill="currentColor" />
      <rect x="181" y="49" width="2" height="2" fill="currentColor" />
      <rect x="181" y="69" width="2" height="2" fill="currentColor" />
      <rect x="81" y="89" width="2" height="2" fill="currentColor" />
      <rect x="61" y="89" width="2" height="2" fill="currentColor" />
      <rect x="41" y="89" width="2" height="2" fill="currentColor" />
      <rect x="21" y="89" width="2" height="2" fill="currentColor" />
      <rect x="1" y="89" width="2" height="2" fill="currentColor" />
      <rect x="101" y="89" width="2" height="2" fill="currentColor" />
      <rect x="121" y="89" width="2" height="2" fill="currentColor" />
      <rect x="141" y="89" width="2" height="2" fill="currentColor" />
      <rect x="161" y="89" width="2" height="2" fill="currentColor" />
      <rect x="181" y="89" width="2" height="2" fill="currentColor" />
    </svg>
  )
}

const animate = ({
  opacity,
  translateX,
  translateY,
  rotation,
}: {
  translateX: number
  translateY: number
  rotation?: number
  opacity?: number
}): AnimationProps => {
  const minRotate = 140
  const maxRotate = 270
  const rotateDegrees = Math.max(
    Math.min(Math.random() * 360, maxRotate),
    minRotate
  )
  const rotate = translateX < 0 ? -rotateDegrees : rotateDegrees
  // const minDuration = 3.33
  // const maxDuration = 5.33
  // const duration = Math.max(
  //   (Math.abs(translateX) / 130) * maxDuration,
  //   minDuration
  // )
  // const minStep = 0.05
  // const maxStep = 0.15
  // const step = Math.min(
  //   Math.max((translateX / 130) * maxStep, minStep),
  //   maxStep
  // )
  const duration = 3.66
  const step = 0.133
  const maxDivisorX = 4
  const minDivisorX = 1.266
  const divisorX = Math.max(
    (1 - Math.abs(translateX) / 130) * maxDivisorX,
    minDivisorX
  )
  const maxDivisorY = 4
  const minDivisorY = 2.33
  const divisorY = Math.max(
    (1 - Math.abs(translateY) / 50) * maxDivisorY,
    minDivisorY
  )

  return {
    initial: {
      scaleX: 0.66,
      scaleY: 0.66,
      opacity: 0,
      translateX,
      translateY,
      rotate,
    },
    animate: {
      scaleX: [null, 1, 1],
      scaleY: [null, 1, 1],
      translateX: [null, translateX / divisorX, 0],
      translateY: [null, translateY / divisorY, 0],
      rotate: [null, rotate / 2, rotation ?? 0],
      opacity: [null, 1, opacity ?? 1],
    },
    transition: {
      type: "keyframes",
      duration,
      times: [0, step, 1],
      ease: ["linear", "easeOut"],
    },
  }
}

const Confetti: React.FC<React.ComponentProps<"svg">> = (props) => {
  const [animations] = React.useState([
    animate({ translateX: 90, translateY: 15 }),
    animate({ translateX: 65, translateY: 20 }),
    animate({ translateX: 40, translateY: -10 }),
    animate({ translateX: 75, translateY: 32 }),
    animate({ translateX: 77, translateY: 50, opacity: 0.881787 }),
    animate({ translateX: 65, translateY: 0 }),
    animate({
      translateX: -27,
      translateY: 35,
      rotation: -53.7859,
      opacity: 0.346083,
    }),
    animate({ translateX: 122, translateY: -25, opacity: 0.1717 }),
    animate({ translateX: -35, translateY: -25, opacity: 0.525657 }),
    animate({
      translateX: 82,
      translateY: 35,
      rotation: 45.6331,
      opacity: 0.147262,
    }),
    animate({ translateX: 90, translateY: -33, opacity: 0.930633 }),
    animate({
      translateX: -49,
      translateY: 38,
      rotation: -25.8594,
      opacity: 0.422557,
    }),
    animate({ translateX: 10, translateY: 35, opacity: 0.57685 }),
    animate({
      translateX: 130,
      translateY: 10,
      rotation: -94.8179,
      opacity: 0.2621493,
    }),
    animate({
      translateX: 105,
      translateY: 40,
      rotation: -155.157,
      opacity: 0.440399,
    }),
    animate({ translateX: -10, translateY: 40, opacity: 0.447445 }),
    animate({ translateX: 50, translateY: -50, opacity: 0.852373 }),
    animate({ translateX: -48, translateY: 20, opacity: 0.97332 }),
    animate({ translateX: -36, translateY: -13, opacity: 0.639544 }),
    animate({
      translateX: -12,
      translateY: -40,
      rotation: -109.015,
      opacity: 0.957374,
    }),
    animate({ translateX: 31, translateY: -35, opacity: 0.55369 }),
    animate({
      translateX: 12,
      translateY: -40,
      rotation: 33.9704,
      opacity: 0.119396,
    }),
    animate({ translateX: 116, translateY: -10, opacity: 0.280772 }),
    animate({ translateX: -32, translateY: -40, opacity: 0.97803 }),
    animate({
      translateX: 132,
      translateY: -10,
      rotation: -168.339,
      opacity: 0.655915,
    }),
    animate({ translateX: 99, translateY: -15, opacity: 0.231231 }),
    animate({
      translateX: 63,
      translateY: -30,
      rotation: 153.633,
      opacity: 0.650661,
    }),
    animate({ translateX: -17, translateY: -40, opacity: 0.0380352 }),
    animate({ translateX: 112, translateY: -10, opacity: 0.878993 }),
    animate({
      translateX: -45,
      translateY: -17,
      rotation: 88.7321,
      opacity: 0.470757,
    }),
    animate({ translateX: -28, translateY: 50, opacity: 0.415084 }),
    animate({ translateX: -43, translateY: 6, opacity: 0.125176 }),
    animate({ translateX: 33, translateY: 30, opacity: 0.329884 }),
    animate({
      translateX: 5,
      translateY: -90,
      rotation: 88.7321,
      opacity: 0.470757,
    }),
  ])

  return (
    <svg
      viewBox="0 0 191 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_172_178843)">
        <motion.circle
          {...animations[0]}
          cx="52"
          cy="35"
          r="4"
          fill="#BD6DFF"
          fillOpacity="0.8"
        />
        <motion.rect
          {...animations[1]}
          x="72"
          y="30"
          width="12"
          height="4"
          rx="2"
          fill="#8AE8FF"
        />
        <motion.path
          {...animations[2]}
          d="M101.896 55.8749C102.329 55.2384 103.289 55.3095 103.623 56.0027L106.635 62.242C106.97 62.9353 106.428 63.7308 105.661 63.674L98.7514 63.1626C97.9837 63.1058 97.5654 62.2392 97.9984 61.6028L101.896 55.8749Z"
          fill="#00DDFF"
          fillOpacity="0.77"
        />
        <motion.path
          {...animations[3]}
          d="M66.1751 11.2036C66.5723 10.624 67.4277 10.624 67.8249 11.2036L68.5623 12.2796C68.6924 12.4694 68.8838 12.6085 69.1044 12.6735L70.3557 13.0423C71.0297 13.241 71.294 14.0545 70.8655 14.6113L70.07 15.6452C69.9298 15.8275 69.8566 16.0526 69.8629 16.2825L69.8988 17.5865C69.9181 18.2889 69.2262 18.7916 68.5641 18.5562L67.335 18.1191C67.1183 18.0421 66.8817 18.0421 66.665 18.1191L65.4359 18.5562C64.7738 18.7916 64.0819 18.2889 64.1012 17.5865L64.1371 16.2825C64.1434 16.0526 64.0702 15.8275 63.93 15.6452L63.1345 14.6113C62.706 14.0545 62.9703 13.241 63.6443 13.0423L64.8956 12.6735C65.1162 12.6085 65.3076 12.4694 65.4377 12.2796L66.1751 11.2036Z"
          fill="#FF53BD"
          fillOpacity="0.88"
        />
        <motion.circle
          {...animations[4]}
          opacity="0.881787"
          cx="65.399"
          cy="0.311453"
          r="4"
          fill="#BD6DFF"
          fillOpacity="0.8"
        />
        <motion.path
          {...animations[5]}
          opacity="0.616132"
          d="M73.3322 46.8592C72.7652 46.4443 72.7917 45.5894 73.3833 45.2103L74.4816 44.5065C74.6753 44.3824 74.8202 44.1953 74.8921 43.9768L75.2995 42.7376C75.5189 42.0701 76.3401 41.8311 76.8835 42.2766L77.8922 43.1037C78.0701 43.2495 78.2928 43.3296 78.5228 43.3303L79.8273 43.3349C80.5299 43.3373 81.011 44.0445 80.7552 44.6989L80.2803 45.9139C80.1966 46.1281 80.1893 46.3646 80.2596 46.5836L80.6584 47.8257C80.8732 48.4947 80.3493 49.1707 79.6479 49.1297L78.3456 49.0535C78.116 49.0401 77.8888 49.1062 77.7022 49.2407L76.6442 50.0039C76.0744 50.4149 75.2695 50.1255 75.0918 49.4458L74.7618 48.1837C74.7036 47.9611 74.5705 47.7655 74.3849 47.6296L73.3322 46.8592Z"
          fill="#FF53BD"
          fillOpacity="0.88"
        />
        <motion.rect
          {...animations[6]}
          opacity="0.346083"
          x="165"
          y="20.6816"
          width="12"
          height="4"
          rx="2"
          transform="rotate(-53.7859)"
          fill="#8AE8FF"
        />
        <motion.path
          {...animations[7]}
          opacity="0.1717"
          d="M22.4846 71.5647C23.1582 71.3647 23.8225 71.9035 23.766 72.6038L23.661 73.9041C23.6424 74.1333 23.7035 74.362 23.8339 74.5515L24.5734 75.6261C24.9717 76.2049 24.6646 77.0032 23.9811 77.1658L22.712 77.4678C22.4882 77.521 22.2897 77.6498 22.1498 77.8323L21.3562 78.8677C20.9288 79.4254 20.0747 79.38 19.7088 78.7802L19.0295 77.6665C18.9097 77.4701 18.7259 77.3211 18.5091 77.2444L17.2791 76.8097C16.6167 76.5755 16.3959 75.7492 16.8533 75.2159L17.7025 74.2256C17.8523 74.0511 17.9372 73.8302 17.9431 73.6002L17.9765 72.2962C17.9945 71.5938 18.7122 71.1285 19.3608 71.3987L20.5649 71.9003C20.7773 71.9888 21.0136 72.0014 21.2341 71.9359L22.4846 71.5647Z"
          fill="#FF53BD"
          fillOpacity="0.88"
        />
        <motion.path
          {...animations[8]}
          opacity="0.525657"
          d="M175.333 73.1485C175.505 72.4671 176.307 72.1706 176.881 72.5766L177.946 73.3302C178.133 73.4631 178.361 73.5272 178.591 73.5118L179.892 73.424C180.593 73.3767 181.123 74.0481 180.914 74.719L180.527 75.9645C180.458 76.1841 180.468 76.4206 180.553 76.6341L181.039 77.8448C181.3 78.4969 180.826 79.2084 180.123 79.217L178.819 79.2331C178.589 79.236 178.367 79.318 178.19 79.4654L177.189 80.3014C176.649 80.7517 175.826 80.52 175.601 79.8545L175.182 78.619C175.109 78.4011 174.962 78.2153 174.767 78.093L173.663 77.3989C173.068 77.0251 173.034 76.1705 173.597 75.7505L174.643 74.9708C174.827 74.8333 174.959 74.6364 175.015 74.4134L175.333 73.1485Z"
          fill="#FF53BD"
          fillOpacity="0.88"
        />
        <motion.rect
          {...animations[9]}
          opacity="0.147262"
          x="58"
          y="8"
          width="12"
          height="4"
          rx="2"
          transform="rotate(45.6331 58 8)"
          fill="#8AE8FF"
        />
        <motion.path
          {...animations[10]}
          opacity="0.930633"
          d="M55.3166 79.1409C56.0191 79.1496 56.4939 79.861 56.2324 80.5131L55.7467 81.7238C55.6611 81.9373 55.6516 82.1738 55.72 82.3934L56.1078 83.6389C56.3167 84.3098 55.7868 84.9812 55.0858 84.9339L53.7842 84.8462C53.5547 84.8307 53.3269 84.8948 53.1392 85.0277L52.0745 85.7814C51.501 86.1874 50.6987 85.8909 50.527 85.2096L50.2083 83.9446C50.1521 83.7216 50.0207 83.5247 49.8363 83.3872L48.7905 82.6075C48.2272 82.1876 48.2612 81.3329 48.8561 80.9591L49.9607 80.2651C50.1554 80.1427 50.302 79.9569 50.3758 79.739L50.7942 78.5035C51.0195 77.838 51.8429 77.6062 52.3822 78.0565L53.3836 78.8925C53.5602 79.04 53.7822 79.122 54.0122 79.1248L55.3166 79.1409Z"
          fill="#FF53BD"
          fillOpacity="0.88"
        />
        <motion.rect
          {...animations[11]}
          opacity="0.422557"
          x="185"
          y="12"
          width="12"
          height="4"
          rx="2"
          transform="rotate(-25.8594 185 12)"
          fill="#8AE8FF"
        />
        <motion.path
          {...animations[12]}
          opacity="0.57685"
          d="M135.61 11.1659C136.285 11.536 136.306 12.498 135.648 12.8975L129.727 16.4935C129.069 16.8931 128.225 16.4305 128.208 15.6609L128.054 8.73442C128.037 7.96481 128.86 7.46536 129.535 7.83542L135.61 11.1659Z"
          fill="#00DDFF"
          fillOpacity="0.77"
        />
        <motion.rect
          {...animations[13]}
          opacity="0.2621493"
          x="11"
          y="46"
          width="12"
          height="4"
          rx="2"
          transform="rotate(-94.8179 11 46)"
          fill="#8AE8FF"
        />
        <motion.rect
          {...animations[14]}
          opacity="0.440399"
          x="43"
          y="14"
          width="12"
          height="4"
          rx="2"
          transform="rotate(-155.157 43 14)"
          fill="#8AE8FF"
        />
        <motion.circle
          {...animations[15]}
          opacity="0.447445"
          cx="151.67"
          cy="5.67051"
          r="4"
          fill="#BD6DFF"
          fillOpacity="0.8"
        />
        <motion.path
          {...animations[16]}
          opacity="0.852373"
          d="M95.4437 94.9768C96.2064 94.8727 96.7959 95.6333 96.5047 96.3459L93.8842 102.759C93.593 103.472 92.6396 103.602 92.1681 102.994L87.9241 97.5176C87.4525 96.9091 87.8165 96.0183 88.5792 95.9142L95.4437 94.9768Z"
          fill="#00DDFF"
          fillOpacity="0.77"
        />
        <motion.circle
          {...animations[17]}
          opacity="0.97332"
          cx="190.344"
          cy="26.3441"
          r="4"
          fill="#BD6DFF"
          fillOpacity="0.8"
        />
        <motion.circle
          {...animations[18]}
          opacity="0.639544"
          cx="178.662"
          cy="62.382"
          r="4"
          fill="#BD6DFF"
          fillOpacity="0.8"
        />
        <motion.rect
          {...animations[19]}
          opacity="0.957374"
          x="154.91"
          y="94.6484"
          width="12"
          height="4"
          rx="2"
          transform="rotate(-109.015 154.91 94.6484)"
          fill="#8AE8FF"
        />
        <motion.circle
          {...animations[20]}
          opacity="0.55369"
          cx="111.529"
          cy="84.5276"
          r="4"
          fill="#BD6DFF"
          fillOpacity="0.8"
        />
        <motion.rect
          {...animations[21]}
          opacity="0.119396"
          x="126"
          y="85"
          width="12"
          height="4"
          rx="2"
          transform="rotate(33.9704 126 85)"
          fill="#8AE8FF"
        />
        <motion.path
          {...animations[22]}
          opacity="0.280772"
          d="M22.6388 56.3374C22.4248 55.598 23.0915 54.9041 23.8389 55.0885L30.5654 56.7479C31.3128 56.9323 31.5803 57.8566 31.047 58.4117L26.2466 63.4073C25.7132 63.9624 24.779 63.7319 24.565 62.9925L22.6388 56.3374Z"
          fill="#00DDFF"
          fillOpacity="0.77"
        />
        <motion.circle
          {...animations[23]}
          opacity="0.97803"
          cx="173.567"
          cy="89.5691"
          r="4"
          fill="#BD6DFF"
          fillOpacity="0.8"
        />
        <motion.rect
          {...animations[24]}
          opacity="0.655915"
          x="15.7539"
          y="63.3428"
          width="12"
          height="4"
          rx="2"
          transform="rotate(-168.339 15.7539 63.3428)"
          fill="#8AE8FF"
        />
        <motion.path
          {...animations[25]}
          opacity="0.231231"
          d="M39.7626 68.7965C38.9928 68.792 38.5166 67.9558 38.9054 67.2914L42.4048 61.3119C42.7936 60.6475 43.7558 60.6532 44.1368 61.3221L47.5655 67.3423C47.9465 68.0113 47.4605 68.8418 46.6907 68.8372L39.7626 68.7965Z"
          fill="#00DDFF"
          fillOpacity="0.77"
        />
        <motion.rect
          {...animations[26]}
          opacity="0.650661"
          x="85"
          y="76"
          width="12"
          height="4"
          rx="2"
          transform="rotate(153.633 85 76)"
          fill="#8AE8FF"
        />
        <motion.path
          {...animations[27]}
          opacity="0.0380352"
          d="M159.433 84.9934C160.002 84.4757 160.919 84.769 161.082 85.5213L162.553 92.2916C162.716 93.0439 162.004 93.6909 161.271 93.4563L154.672 91.3447C153.939 91.1101 153.735 90.1698 154.305 89.6521L159.433 84.9934Z"
          fill="#00DDFF"
          fillOpacity="0.77"
        />
        <motion.circle
          {...animations[28]}
          opacity="0.878993"
          cx="29.9375"
          cy="57.6565"
          r="4"
          fill="#BD6DFF"
          fillOpacity="0.8"
        />
        <motion.rect
          {...animations[29]}
          opacity="0.470757"
          x="190"
          y="60"
          width="12"
          height="4"
          rx="2"
          transform="rotate(88.7321 190 60)"
          fill="#8AE8FF"
        />
        <motion.path
          {...animations[30]}
          opacity="0.415084"
          d="M174.543 3.0989C174.884 3.78911 174.35 4.5895 173.582 4.5396L166.668 4.09048C165.9 4.04058 165.474 3.17781 165.901 2.5375L169.747 -3.22532C170.174 -3.86564 171.134 -3.80326 171.475 -3.11304L174.543 3.0989Z"
          fill="#00DDFF"
          fillOpacity="0.77"
        />
        <motion.circle
          {...animations[31]}
          opacity="0.125176"
          cx="186.312"
          cy="41.2893"
          r="4"
          fill="#BD6DFF"
          fillOpacity="0.8"
        />
        <motion.path
          {...animations[32]}
          opacity="0.329884"
          d="M113.189 15.2688C113.803 15.6105 113.882 16.4622 113.342 16.9114L112.339 17.7456C112.162 17.8926 112.042 18.0962 111.997 18.3219L111.746 19.602C111.611 20.2915 110.826 20.6301 110.231 20.2552L109.128 19.5591C108.934 19.4364 108.703 19.3844 108.474 19.4121L107.179 19.5688C106.482 19.6532 105.917 19.0109 106.09 18.3299L106.411 17.0655C106.468 16.8426 106.446 16.607 106.349 16.3983L105.8 15.2151C105.504 14.5778 105.94 13.8421 106.641 13.7962L107.943 13.7109C108.172 13.6958 108.39 13.6021 108.558 13.4456L109.514 12.5576C110.029 12.0793 110.863 12.2669 111.123 12.9195L111.607 14.1312C111.692 14.3448 111.848 14.5225 112.049 14.6344L113.189 15.2688Z"
          fill="#FF53BD"
          fillOpacity="0.88"
        />
        {/* Offscreen */}
        <motion.rect
          {...animations[33]}
          opacity="0.770757"
          x="140"
          y="110"
          width="12"
          height="4"
          rx="2"
          transform="rotate(88.7321 140 110)"
          fill="#8AE8FF"
        />
      </g>
      <defs>
        <clipPath id="clip0_172_178843">
          <rect
            width="200"
            height="100"
            fill="white"
            transform="translate(-3)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}
