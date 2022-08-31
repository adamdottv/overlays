import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { useEffect, useRef } from "react"
import { useEvent, useSocket } from "../hooks"
import { AudioSpectrum, Overlay, Grid } from "../components"
import { fadeAudioOut } from "../lib/audio"
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

function Break({
  stream,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const audioRef = useRef<HTMLAudioElement>(null)

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
      <audio
        loop
        ref={audioRef}
        id="audio-element"
        src="/media/theme-piano-lh.wav"
      />
      <Grid
        // topLeft={<BrandMark />}
        // topCenter={
        //   <div className="flex h-full items-center text-mauve-12">
        //     Streaming web development every weekday
        //   </div>
        // }
        centerLeft={
          <div className="mt-10 flex justify-center text-5xl font-light text-mauve-11">
            <div className="absolute z-20 h-4 w-4 rounded-full bg-[#FF8B3E]" />
            <div className="absolute z-10 -mt-1 h-6 w-6 animate-ping rounded-full bg-[#FF8B3E]" />
          </div>
        }
        center={
          <div className="mt-[26px]">
            <div className="text-5xl font-light text-mauve-12">
              I&apos;ll be right back
            </div>
            <div className="mt-6 text-4xl font-light text-mauve-11">
              {stream?.current.title}
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

export default Break
