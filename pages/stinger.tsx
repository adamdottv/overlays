import type { NextPage } from "next"
import React, { useEffect } from "react"
import { useEvent, useSocket } from "../hooks"
import { Scene } from "three"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/router"

const dotSize = 20
const width = 1680
const height = 840
const columns = width / dotSize
const rows = height / dotSize
const fps = 24

type DotState = "empty" | "small" | "medium" | "large" | "line"

interface DotProps {
  state: DotState
  top: number
  left: number
}

const states: DotState[] = ["empty", "small", "medium", "large"]
const randomState = () => states[Math.floor(Math.random() * states.length)]

const Dot: React.FC<DotProps> = ({ top, left, state = "small" }) => {
  switch (state) {
    case "empty":
      return null

    case "small":
      return (
        <rect
          x={left + 9}
          y={top + 9}
          width={2}
          height={2}
          fill="currentColor"
        />
      )

    case "medium":
      return (
        <rect
          x={left + 5}
          y={top + 5}
          width={10}
          height={10}
          fill="currentColor"
        />
      )

    case "large":
      return (
        <rect
          x={left + 2}
          y={top + 2}
          width={16}
          height={16}
          fill="currentColor"
        />
      )

    case "line":
      return (
        <rect x={left + 9} y={top} width={2} height={20} fill="currentColor" />
      )
  }
}

export const Stinger: NextPage = () => {
  const router = useRouter()
  const debug = router.query.debug === "true"

  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [transitioning, setTransitioning] = React.useState(false)
  const [dots, setDots] = React.useState<DotProps[][]>([])

  useEffect(() => {
    const initialDots = []
    for (let y = 0; y < rows; y++) {
      const row = []
      for (let x = 0; x < columns; x++) {
        const dot: DotProps = {
          top: y * dotSize,
          left: x * dotSize,
          state: "empty",
        }
        row.push(dot)
      }
      initialDots.push(row)
    }

    setDots(initialDots)

    const intervalHandle = setInterval(() => {
      setDots((dots) => {
        return dots.map((row, y) =>
          row.map((dot, x) => {
            // const previousRow = dots[y - 1]
            // const above = previousRow && previousRow[x]
            // const left = row[x - 1]
            // const minusTwoAbove = dots[y - 2] && dots[y - 2][x]
            // const minusTwoLeft = row[x - 2]

            // const minusOne = above || left
            // const minusTwo = minusTwoAbove || minusTwoLeft

            // const nextRow = dots[y + 1]
            // const below = nextRow && nextRow[x]
            // const right = row[x + 1]
            // const plusOne = below || right
            // const plusTwoBelow = dots[y + 2] && dots[y + 2][x]
            // const plusTwoRight = row[x + 2]
            // const plusTwo = plusTwoBelow || plusTwoRight

            // // if (!minusOne)
            // //   return {
            // //     ...dot,
            // //     state: "large",
            // //   }

            // if (dot.state === "medium") {
            //   return {
            //     ...dot,
            //     state: "small",
            //   }
            // }

            // if (dot.state === "large") {
            //   return {
            //     ...dot,
            //     state: "medium",
            //   }
            // }

            // return {
            //   ...dot,
            //   // state: dots[index - 1]?.state || "large",
            //   state:
            //     plusOne?.state === "large" || minusOne?.state === "large"
            //       ? "large"
            //       : Math.random() < 0.01
            //       ? "large"
            //       : Math.random() < 0.1
            //       ? "medium"
            //       : "small", // randomState(),
            // }
            const time = Date.now() / 1000
            const stateIndex = states.indexOf(dot.state)

            const cosine = Math.tan(time / x / y).toString()
            const lastDigit = Number.parseInt(cosine[0])
            const quantizedValue = Math.ceil(lastDigit / states.length)

            const newIndex = Math.min(
              Math.max(quantizedValue, 0),
              states.length
            )

            return {
              ...dot,
              state: states[newIndex],
            }
          })
        )
      })
    }, 1000 / fps)

    return () => clearInterval(intervalHandle)
  }, [])

  const { socket } = useSocket()
  useEvent<{ to: Scene; complete?: boolean }>(
    socket,
    "scene-transition",
    ({ to, complete }) => {
      if (!complete) audioRef.current?.play()

      setTransitioning(!complete ?? false)
    }
  )

  return (
    <div className="relative h-[1080px] w-[1920px]">
      <AnimatePresence exitBeforeEnter>
        {(transitioning || debug) && (
          <motion.div
            key="stinger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.33 }}
            exit={{ opacity: 0 }}
            className="relative h-[1080px] w-[1920px]"
          >
            <div className="absolute inset-0 -z-10 bg-black/90" />
            <svg
              viewBox={`0 0 ${width} ${height}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-[120px] fill-current text-mint"
            >
              {dots.map((row) => {
                return row.map((dot) => (
                  <Dot key={`${dot.top}_${dot.left}`} {...dot} />
                ))
              })}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
      <audio ref={audioRef} src="/media/stinger.wav" />
    </div>
  )
}

export default Stinger
