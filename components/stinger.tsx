import React, { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/router"
import {
  columns,
  DotProps,
  dotSize,
  height,
  rows,
  width,
  animations,
  schrew,
} from "../lib/stinger"
import { delay, randomItem } from "../lib/utils"

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

export interface StingerProps {
  transitioning: boolean
  onTransitioned?: (author?: string) => void
}

export const Stinger: React.FC<StingerProps> = ({
  transitioning,
  onTransitioned,
}) => {
  const router = useRouter()
  const debug = router.query.debug === "true"

  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [dots, setDots] = React.useState<DotProps[][]>([])

  useEffect(() => {
    if (transitioning) audioRef.current?.play()

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

    const { initFn, stateFn, fps, author } = randomItem(animations)
    const init = initFn()

    if (transitioning && onTransitioned) onTransitioned(author)

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
  }, [transitioning])

  return (
    <div className="absolute inset-0">
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
