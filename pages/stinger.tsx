import type { NextPage } from "next"
import React, { useEffect } from "react"
import cn from "classnames"
import { useEvent, useSocket } from "../hooks"
import { Scene } from "three"
import { AnimatePresence, motion } from "framer-motion"

const dotSize = 20
const width = 1680
const height = 840
const columns = width / dotSize
const rows = height / dotSize
const fps = 1

type DotState = "empty" | "small" | "large" | "line"

interface DotProps {
  state?: DotState
  top: number
  left: number
}

const states: DotState[] = ["empty", "small", "large", "line"]
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
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [transitioning, setTransitioning] = React.useState(false)
  const [dots, setDots] = React.useState<DotProps[]>([])

  useEffect(() => {
    const initialDots = []
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const dot: DotProps = {
          top: y * dotSize,
          left: x * dotSize,
          state: "empty",
        }
        initialDots.push(dot)
      }
    }

    setDots(initialDots)

    const intervalHandle = setInterval(() => {
      setDots((dots) => {
        return dots.map((dot, index) => ({
          ...dot,
          // state: dots[index - 1]?.state || "large",
          state: randomState(),
        }))
      })
    }, 1000 / fps)

    return () => clearInterval(intervalHandle)
  }, [])

  const { socket } = useSocket()
  useEvent<{ to: Scene; complete?: boolean }>(
    socket,
    "scene-transition",
    ({ to, complete }) => {
      if (!complete) {
        audioRef.current?.play()
      }

      setTransitioning(!complete ?? false)
    }
  )

  return (
    <div className="relative h-[1080px] w-[1920px]">
      <AnimatePresence exitBeforeEnter>
        {transitioning && (
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
              {dots.map((dot) => (
                <Dot key={`${dot.top}_${dot.left}`} {...dot} />
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
      <audio ref={audioRef} src="/media/stinger.wav" />
    </div>
  )
}

export default Stinger
