export interface RewardBase {
  id: string
  name: string
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

export type Reward = SnapFilterReward | ShellScriptReward

export const defaultSnapFilterDuration = 5 * 60 * 1000

export const rewards: Reward[] = [
  {
    id: "90cda788-68d5-48bb-b4e6-08bcf4ec132d",
    name: "Rick Roll",
    type: "shell",
    script: "./scripts/rick-roll.sh",
  },
  {
    id: "28bc0aea-98c0-4f5e-ba44-1b72ab7281fc",
    name: "Ray-Bans",
    type: "snap-filter",
    key: "122",
  },
]

export const getReward = (id?: string): Reward | undefined => {
  if (!id) return undefined
  return rewards.find((r) => r.id === id)
}
