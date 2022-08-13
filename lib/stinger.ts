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

export const kylian1: StingerAnimation<{
  duration: number
  startTime: number
}> = {
  initFn: () => ({
    duration: 6000,
    startTime: Date.now() % 6000,
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

export const kylian2: StingerAnimation<{
  duration: number
  startTime: number
}> = {
  initFn: () => ({
    duration: 5000,
    startTime: Date.now() % 5000,
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
