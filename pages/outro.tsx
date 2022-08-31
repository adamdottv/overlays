import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { useEffect, useRef } from "react"
import { useEvent, useSocket } from "../hooks"
import { AudioSpectrum, Overlay, Grid, BrandMark } from "../components"
import { fadeAudioOut } from "../lib/audio"
import React from "react"
import { delay } from "../lib/utils"
import { getStreamInfo } from "./api/stream"
import { NextApiResponseServerIO } from "../lib"

export const getServerSideProps: GetServerSideProps = async (context) => {
  const rawStream = await getStreamInfo(context.res as NextApiResponseServerIO)
  const stream = JSON.parse(JSON.stringify(rawStream))

  return {
    props: {
      stream,
    },
  }
}

function Outro({
  stream,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const { socket } = useSocket()
  useEvent(socket, "fade-audio-out", async () => {
    if (!audioRef.current) return

    await fadeAudioOut({ audio: audioRef.current })
  })

  useEffect(() => {
    const timeoutHandle = setTimeout(() => {
      audioRef.current?.play()
      fetch("/api/twitch/raid", { method: "POST" })
    }, 2000)

    return () => clearTimeout(timeoutHandle)
  }, [])

  const handleAudioOnEnd = async () => {
    await delay(2000)
    await fetch("/api/obs/end-stream", { method: "POST" })
  }

  return (
    <Overlay>
      <audio
        ref={audioRef}
        id="audio-element"
        src="/media/theme.wav"
        onEnded={handleAudioOnEnd}
      />
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
