export type Scene =
  | "Intro"
  | "Camera"
  | "Screen"
  | "Screen (w/ Guest)"
  | "Camera (HD)"
  | "Keyboard"

export interface RewardBase {
  id: string
  name: string
  scene?: Scene
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

const keyCodes = {
  F1: "122",
  F2: "120",
  F3: "99",
  F4: "118",
  F5: "96",
  F6: "97",
  F7: "98",
  F8: "100",
  F9: "101",
  F10: "109",
  F11: "103",
  F12: "111",
}

export const rewards: Reward[] = [
  {
    id: "90cda788-68d5-48bb-b4e6-08bcf4ec132d",
    name: "Rick Roll",
    type: "shell",
    script: "./scripts/rick-roll.sh",
    scene: "Screen",
  },
  {
    id: "28bc0aea-98c0-4f5e-ba44-1b72ab7281fc",
    name: "Ray-Bans",
    type: "snap-filter",
    key: keyCodes.F1,
  },
  {
    id: "14fcf962-4f8c-48be-a1c2-d812ea288451",
    name: "Cartoon Face",
    type: "snap-filter",
    key: keyCodes.F2,
  },
  {
    id: "4a861926-1c01-46bc-9503-2ffc5c9b4e75",
    name: "Deal With It",
    type: "snap-filter",
    key: keyCodes.F5,
  },
  {
    id: "9abdf7d7-1948-40f4-b68e-8c230a2939d6",
    name: "Mustache",
    type: "snap-filter",
    key: keyCodes.F6,
  },
  {
    id: "3f573c02-9551-4d1e-8ab4-2f2af295cb3b",
    name: "Messy Hairstyle",
    type: "snap-filter",
    key: keyCodes.F7,
  },
  {
    id: "b466bd8e-fa86-49e0-ba37-03e7eee276d6",
    name: "Cowboy Stache",
    type: "snap-filter",
    key: keyCodes.F8,
  },
  {
    id: "f12d645d-d7be-4629-b124-34282d5ce68d",
    name: "Heart Shaped Glasses",
    type: "snap-filter",
    key: keyCodes.F9,
  },
]

export const getReward = (id?: string): Reward | undefined => {
  if (!id) return undefined
  return rewards.find((r) => r.id === id)
}
