export const dotSize = 20
export const width = 1680
export const height = 840
export const columns = width / dotSize
export const rows = height / dotSize
export const centerX = columns / 2
export const centerY = rows / 2

export type DotState = "empty" | "small" | "medium" | "large" | "line"

export interface DotProps {
  state: DotState
  top: number
  left: number
}

export const states: DotState[] = ["empty", "small", "medium", "large"]
const randomState = () => states[Math.floor(Math.random() * states.length)]

export type StingerAnimation<T = {}> = {
  stateFn: (props: { init: T; dot: DotProps; x: number; y: number }) => DotState
  initFn: () => T
  fps?: number
  author?: string
}

export const defaultAnimation: StingerAnimation = {
  initFn: () => ({}),
  stateFn: ({ x, y }) => {
    const time = Date.now()
    // const stateIndex = states.indexOf(dot.state)

    const cosine = Math.tan(time / x / y).toString()
    const lastDigit = Number.parseInt(cosine[0])
    const quantizedValue = Math.ceil(lastDigit / states.length)

    const newIndex = Math.min(Math.max(quantizedValue, 0), states.length)

    return states[newIndex]
  },
  fps: 10,
}

export const kyllian2: StingerAnimation<{
  duration: number
  startTime: number
}> = {
  author: "KyllianGamer",
  initFn: () => ({
    duration: 2500,
    startTime: Date.now() % 2500,
  }),
  stateFn: ({ init, x, y }) => {
    const calculated_time = (Date.now() % init.duration) - init.startTime
    const time =
      calculated_time < 0 ? init.duration + calculated_time : calculated_time

    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
    const index = 4 - Math.ceil((50 - distance) * (time / init.duration) ** 3)
    const newIndex = index > 0 ? (index < 4 ? index : 4) : 0

    return states[newIndex]
  },
  fps: 10,
}

export const kyllian3: StingerAnimation<{
  duration: number
  startTime: number
}> = {
  author: "KyllianGamer",
  initFn: () => ({
    duration: 2500,
    startTime: Date.now() % 2500,
  }),
  stateFn: ({ init, x, y }) => {
    const calculated_time = (Date.now() % init.duration) - init.startTime
    const time =
      calculated_time < 0 ? init.duration + calculated_time : calculated_time
    let newIndex = Math.round(
      Math.sqrt((x / columns) * (y / rows)) +
        states.length * (time / init.duration)
    )
    if (newIndex >= 4) newIndex = 0

    return states[newIndex]
  },
  fps: 10,
}

export const kyllian4: StingerAnimation<{
  duration: number
  startTime: number
  phases: number
}> = {
  author: "KyllianGamer",
  initFn: () => ({
    duration: 2500,
    startTime: Date.now() % 2500,
    phases: 4,
  }),
  stateFn: ({ init, x, y }) => {
    const calculated_time = (Date.now() % init.duration) - init.startTime
    const time =
      calculated_time < 0 ? init.duration + calculated_time : calculated_time

    const phase = Math.floor(time / (init.duration / init.phases))
    const phase_duration = init.duration / init.phases
    const phase_time = time - phase * (init.duration / init.phases)
    var newIndex = 3
    if (phase === 0)
      newIndex =
        Math.abs(y - rows / 2) / (rows / 2) <=
        1 - Math.sqrt(phase_time / phase_duration)
          ? 0
          : 2
    if (phase === 1)
      newIndex =
        Math.abs(x - columns / 2) / (columns / 2) <=
        1 - Math.sqrt(phase_time / phase_duration)
          ? 2
          : 3
    if (phase === 2)
      newIndex =
        Math.abs(y - rows / 2) / (rows / 2) <=
        Math.sqrt(phase_time / phase_duration)
          ? 2
          : 3
    if (phase === 3)
      newIndex =
        Math.abs(x - columns / 2) / (columns / 2) <=
        Math.sqrt(phase_time / phase_duration)
          ? 0
          : 2

    return states[newIndex]
  },
  fps: 10,
}

export const kyllian5: StingerAnimation<{
  duration: number
  startTime: number
  column_values: Array<number>
}> = {
  author: "KyllianGamer",
  initFn: () => ({
    duration: 2500,
    startTime: Date.now() % 2500,
    column_values: Array.from({ length: columns }, () =>
      Math.floor(Math.random() * rows)
    ),
  }),
  stateFn: ({ init, x, y }) => {
    const calculated_time = (Date.now() % init.duration) - init.startTime
    const time =
      calculated_time < 0 ? init.duration + calculated_time : calculated_time

    var newIndex = Math.floor(
      time /
        (init.duration / (5 * rows + init.column_values[x] + rows)) /
        (y + rows)
    )
    if (newIndex > 3) newIndex = 3
    if (time >= init.duration - 1000 / 10)
      init.column_values = Array.from({ length: columns }, () =>
        Math.floor(Math.random() * rows)
      )

    return states[newIndex]
  },
  fps: 10,
}

export const matthewbrandt1: StingerAnimation = {
  initFn: () => ({}),
  stateFn: ({ x, y }) => {
    const time = Date.now() / 1000
    const bunny = Math.random() * 69
    const cosine = Math.pow(time / x / y, bunny).toString()
    const lastDigit = Number.parseInt(cosine[10])
    const quantizedValue = Math.floor(lastDigit / states.length)
    const newIndex = Math.min(Math.hypot(quantizedValue / 1), states.length)

    return states[newIndex]
  },
  fps: 10,
  author: "matty_twoshoes",
}

export const schrew: StingerAnimation<{
  duration: number
  startTime: number
}> = {
  author: "schrew",
  initFn: () => ({
    duration: 2500,
    startTime: Date.now(),
  }),
  stateFn: ({ init, x, y }) => {
    const calculated_time = Date.now() - init.startTime
    const time =
      calculated_time < 0 ? init.duration + calculated_time : calculated_time

    const factor = calculated_time > 1350 ? Math.sin(y * 0.85) * 80 : 0
    const distance = Math.sqrt((x - centerX) ** 2 + factor)
    const index = 4 - Math.ceil((50 - distance) * (time / init.duration) ** 3)
    const newIndex = index > 0 ? (index < 4 ? index : 4) : 0

    return states[newIndex]
  },
  fps: 10,
}

export const animations: StingerAnimation[] = [
  defaultAnimation,
  // @ts-ignore
  kyllian2,
  // @ts-ignore
  kyllian3,
  // @ts-ignore
  kyllian4,
  // @ts-ignore
  kyllian5,
  // @ts-ignore
  matthewbrandt1,
  // @ts-ignore
  schrew,
]
