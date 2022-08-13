import type { NextPage } from "next"
import React, { useEffect } from "react"
import { useEvent, useSocket } from "../hooks"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/router"
import {
  columns,
  defaultAnimation,
  DotProps,
  dotSize,
  height,
  kylian1,
  kylian2,
  kylian3,
  rows,
  width,
} from "../lib/stinger"
import { Scene } from "../lib"

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

    const { initFn, stateFn, fps } = defaultAnimation
    const init = initFn()

    const intervalHandle = setInterval(() => {
      setDots((dots) => {
        return dots.map((row, y) =>
          row.map((dot, x) => {
            return {
              ...dot,
              state: stateFn({ init, dot, x, y }),
            }
          })
        )
      })
    }, 1000 / (fps ?? 10))

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
