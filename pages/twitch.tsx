import type { NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import React from "react"

const Twitch: NextPage = () => {
  const router = useRouter()
  const { channel } = router.query

  return (
    <div>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0" />
      </Head>
      <div className="twitch md:relative">
        <div className="twitch-video relative h-0 pt-[56.25%] md:w-3/4 md:pt-[42.1875%]">
          <iframe
            className="absolute top-0 h-full w-full"
            src={`https://player.twitch.tv/?channel=${channel}&parent=overlays.adam.tv&autoplay=false&muted=true`}
            frameBorder={0}
            scrolling="no"
            allowFullScreen={false}
            height="100%"
            width="100%"
          ></iframe>
        </div>
        <div className="twitch-chat h-[400px] md:absolute md:top-0 md:right-0 md:bottom-0 md:h-auto md:w-1/4">
          <iframe
            className="h-full w-full"
            frameBorder={0}
            scrolling="no"
            src={`https://www.twitch.tv/embed/${channel}/chat?parent=overlays.adam.tv`}
            height="100%"
            width="100%"
          ></iframe>
        </div>
      </div>
    </div>
  )
}

export default Twitch
