import React, { useEffect } from "react"
import cn from "classnames"

export interface AudioSpectrumProps extends React.ComponentProps<"div"> {
  audioRef: React.RefObject<HTMLAudioElement>
  width?: number
  height?: number
  capColor?: string
  capHeight?: number
  meterColor?: string
  meterCount?: number
  meterWidth?: number
  gap?: number
}

let audioContext: AudioContext
let analyser: AnalyserNode
let source: MediaElementAudioSourceNode

export const AudioSpectrum: React.FC<AudioSpectrumProps> = ({
  audioRef,
  width = 1200,
  height = 160,
  capHeight = 2,
  capColor = "#25D0AB",
  meterColor = "#25D0AB",
  meterCount = 60,
  meterWidth = 2,
  gap = 18,
  className = "",
  ...props
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const drawSpectrum = React.useCallback(
    (analyser: AnalyserNode) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const cwidth = canvas.width
      const cheight = canvas.height - capHeight
      const capYPositions: number[] = [] // store the vertical position of the caps for the previous frame
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

      let animationId: number | null = null

      const drawMeter = () => {
        const array = new Uint8Array(analyser.frequencyBinCount) // item value of array: 0 - 255
        analyser.getByteFrequencyData(array)

        const step = Math.round(array.length / meterCount) // sample limited data from the total array
        ctx.clearRect(0, 0, cwidth, cheight + capHeight)

        const coefficient = 270

        for (let i = 0; i < meterCount; i++) {
          const value = array[i * step]
          if (capYPositions.length < Math.round(meterCount)) {
            capYPositions.push(value)
          }

          ctx.fillStyle = capColor
          // draw the cap, with transition effect
          if (value < capYPositions[i]) {
            // let y = cheight - (--capYPositionArray[i])
            const preValue = --capYPositions[i]
            const y = ((coefficient - preValue) * cheight) / coefficient
            ctx.fillRect(i * (meterWidth + gap), y, meterWidth, capHeight)
          } else {
            // let y = cheight - value
            const y = ((coefficient - value) * cheight) / coefficient
            ctx.fillRect(i * (meterWidth + gap), y, meterWidth, capHeight)
            capYPositions[i] = value
          }
          ctx.fillStyle = meterColor // set the filllStyle to gradient for a better look

          // let y = cheight - value + capHeight
          const y = ((coefficient - value) * cheight) / coefficient + capHeight
          ctx.fillRect(i * (meterWidth + gap), y, meterWidth, cheight) // the meter
        }
        animationId = requestAnimationFrame(drawMeter)
      }
      animationId = requestAnimationFrame(drawMeter)
    },
    [capColor, capHeight, gap, meterColor, meterCount, meterWidth]
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!audioContext) audioContext = new window.AudioContext()

    if (!analyser) {
      analyser = audioContext.createAnalyser()
      analyser.smoothingTimeConstant = 0.8
      analyser.fftSize = 128
      analyser.minDecibels = -160
      analyser.maxDecibels = -40
    }

    if (!source) {
      source = audioContext.createMediaElementSource(audio)
      source.connect(analyser)
      source.connect(audioContext.destination)
    }

    drawSpectrum(analyser)
  }, [audioRef, drawSpectrum])

  return (
    <div
      className={cn({
        "absolute inset-x-0 bottom-0": true,
        [className]: className,
      })}
      {...props}
    >
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  )
}
