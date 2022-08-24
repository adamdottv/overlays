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

export type Reward = SnapFilterReward | ShellScriptReward | GiveawayEntryReward

export const defaultSnapFilterDuration = 5 * 60 * 1000
