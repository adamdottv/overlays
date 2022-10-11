/* eslint-disable @next/next/no-img-element */
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { useEffect, useRef, useState } from "react"
import { useEvent, useSocket } from "../hooks"
import { AudioSpectrum, Overlay, Grid } from "../components"
import { fadeAudioOut } from "../lib/audio"
import { CustomNextApiResponse } from "../lib"
import { getStreamInfo, Guest, songs } from "../lib/stream"
import { randomItem } from "../lib/utils"

export const getServerSideProps: GetServerSideProps = async (context) => {
  const rawStream = await getStreamInfo(context.res as CustomNextApiResponse)
  const stream = JSON.parse(JSON.stringify(rawStream))
  const song = randomItem(songs)

  return {
    props: {
      stream,
      song,
    },
  }
}

function Break({
  stream,
  song,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [guest, setGuest] = useState<Guest | undefined>(stream?.guest)

  const { socket } = useSocket()
  useEvent(socket, "fade-audio-out", async () => {
    if (!audioRef.current) return

    await fadeAudioOut({ audio: audioRef.current })
  })
  useEvent<Guest>(socket, "guest-joined", async (guest) => {
    setGuest(guest)
  })
  useEvent<Guest>(socket, "guest-left", async () => {
    setGuest(undefined)
  })

  useEffect(() => {
    setTimeout(() => {
      audioRef.current?.play()
    }, 2000)
  }, [])

  return (
    <Overlay>
      <audio loop ref={audioRef} id="audio-element" src={`/media/${song}`} />
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
          <div className="relative mt-[26px] h-full">
            <div className="text-5xl font-light text-mauve-12">
              I&apos;ll be right back{guest && `, with ${guest.name}`}
            </div>
            <div className="mt-6 text-4xl font-light text-mauve-11">
              {stream?.current.title}
            </div>
            {guest && (
              <div className="absolute inset-0">
                <div className="absolute top-[30px] right-[58px] z-40 h-[280px] w-[280px] border border-mauve-11" />

                <img
                  className="absolute top-[40px] right-[48px] h-[280px] w-[280px]"
                  src={guest.image}
                  alt={guest.name}
                />

                <div className="absolute bottom-[20px] right-[28px] z-50 w-auto min-w-[150px] bg-mint px-4  py-2">
                  <div className="text-lg font-bold text-mauve-1">
                    {guest.name}
                  </div>
                  <div className="text-sm font-medium text-[#040013] text-opacity-[48%]">
                    @{guest.twitter}
                  </div>
                </div>
              </div>
            )}
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
