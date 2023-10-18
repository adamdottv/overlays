import { Scene } from "./obs"

export interface RewardBase {
  id?: string
  title: string
  cost: number
  description?: string
  userMax?: number
  streamMax?: number
  cooldown?: number
  enabled?: boolean
  scene?: Scene
  prompt?: string
}

export interface CustomReward extends RewardBase {
  type: "custom"
  name: string
}

export interface GiveawayEntryReward extends RewardBase {
  type: "giveaway-entry"
}

export interface SnapFilterReward extends RewardBase {
  type: "snap-filter"
  key: string
  duration?: number
}

export interface ShellScriptReward extends RewardBase {
  type: "shell"
  script: string
}

export interface MeetingReward extends RewardBase {
  type: "meeting"
}

export type Reward =
  | SnapFilterReward
  | ShellScriptReward
  | GiveawayEntryReward
  | MeetingReward
  | CustomReward

export const defaultSnapFilterDuration = 5 * 60 * 1000
