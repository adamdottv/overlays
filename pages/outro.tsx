import type { NextPage } from "next"
import { useEffect, useRef } from "react"
import { useEvent, useSocket, useStream } from "../hooks"
import { AudioSpectrum, Overlay, Grid, BrandMark } from "../components"
import { fadeAudioOut } from "../lib/audio"
import React from "react"

export const Outro: NextPage = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const stream = useStream()

  const { socket } = useSocket()
  useEvent(socket, "fade-audio-out", async () => {
    if (!audioRef.current) return

    await fadeAudioOut({ audio: audioRef.current })
  })

  useEffect(() => {
    setTimeout(() => {
      audioRef.current?.play()
    }, 2000)
  }, [])

  return (
    <Overlay>
      <audio loop ref={audioRef} id="audio-element" src="/media/theme.wav" />
      <Grid
        topLeft={<BrandMark />}
        topCenter={
          <div className="flex h-full items-center text-mauve-12">
            Streaming again soon, check the schedule for full details
          </div>
        }
        centerLeft={
          <div className="mt-[26px] text-right text-5xl font-light text-mauve-11">
            Soon
          </div>
        }
        center={
          <div className="mt-[26px]">
            <div className="text-5xl font-light text-mauve-12">
              {stream?.next?.title}
            </div>
            <div className="mt-6 text-4xl font-light text-mauve-11">
              {stream?.next?.start?.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                year: "numeric",
                day: "numeric",
                hour: "numeric",
              }) || ""}
              {stream?.next?.start && <span> CT</span>}
            </div>
          </div>
        }
        bottomCenter={
          <div className="absolute inset-0">
            {/* <BrandDetail /> */}
            <AudioSpectrum audioRef={audioRef} />
          </div>
        }
      />
    </Overlay>
  )
}

export default Outro
