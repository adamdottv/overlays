import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import Head from "next/head"
import React, { useEffect } from "react"
import {
  Transcript,
  useAssemblyAi,
  useEvent,
  useQueue,
  useSocket,
  useTwitchEvent,
} from "../hooks"
import type { TwitchEvent } from "../lib/twitch"
import {
  Grid,
  NotifiableTwitchEvent,
  Notification,
  Overlay,
  Stinger,
} from "../components"
import hash from "object-hash"
import cn from "classnames"
import { motion, AnimatePresence } from "framer-motion"
import { getStreamInfo, GetStreamResponse } from "../lib/stream"
import { CustomNextApiResponse } from "../lib"
import * as faceapi from "face-api.js"
import { request } from "../lib/utils"

const MAX_NOTIFICATIONS = 3
const NOTIFICATION_DURATION = 3
const NOTIFICATION_PANEL_HEIGHT = MAX_NOTIFICATIONS * 100 + 65

export interface SharedSsrProps {
  stream: GetStreamResponse
  debug: boolean
}

interface Segment {
  title: string
  track?: string
}

export const getServerSideProps: GetServerSideProps<SharedSsrProps> = async (
  context
) => {
  const rawStream = await getStreamInfo(context.res as CustomNextApiResponse)
  const stream = JSON.parse(JSON.stringify(rawStream))

  return {
    props: {
      stream,
      debug: context.query.debug === "true",
    },
  }
}

/**
    This is a test of some comments.
**/
function Shared({
  stream,
  debug,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const [transitioning, setTransitioning] = React.useState(false)
  const [segment, setSegment] = React.useState<Segment>()

  const transcript = useAssemblyAi(debug)
  const [lastTranscript, setLastTranscript] = React.useState<
    Transcript | undefined
  >()
  const [lastSentTranscript, setLastSentTranscript] = React.useState<
    string | undefined
  >()

  const videoRef = React.useRef<HTMLVideoElement | null>(null)

  const loadModels = async () => {
    // const MODEL_URL = `/models`
    // await Promise.all([
    //   faceapi.nets.tinyFaceDetector.load(MODEL_URL),
    //   faceapi.nets.faceExpressionNet.load(MODEL_URL),
    // ])
  }

  const handleLoadWaiting = async () => {
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (videoRef.current?.readyState == 4) {
          resolve(true)
          clearInterval(timer)
        }
      }, 500)
    })
  }

  useEffect(() => {
    async function init() {
      const video = videoRef.current
      if (!video) return

      const cameras = await navigator.mediaDevices.enumerateDevices()
      const camlinkCameras = cameras.filter(
        (camera) =>
          camera.kind === "videoinput" && camera.label.startsWith("Cam Link 4K")
      )

      // const deviceName = router.query.device as Device
      // const deviceIndex = deviceName === "primary" ? 0 : 1
      const desiredCamera =
        camlinkCameras.find(
          (c) =>
            c.deviceId ===
            "09d16b1e893828c0aa4b112785e8d2ee6f5f694731ba188643f4863e9ddd5184"
        ) || camlinkCameras[1]

      const userMedia = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: desiredCamera
            ? { exact: desiredCamera.deviceId }
            : undefined,
        },
      })

      video.srcObject = userMedia
      video.play()

      await loadModels()
      await handleLoadWaiting()

      if (videoRef.current) {
        const video = videoRef.current
        const handle = setInterval(async () => {
          const detectionsWithExpressions = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions()
          if (detectionsWithExpressions.length > 0) {
            const [{ expressions }] = detectionsWithExpressions
            const abnormality = [
              expressions.disgusted,
              expressions.sad,
              expressions.angry,
              expressions.happy,
              expressions.disgusted,
              expressions.fearful,
            ].some((e) => e >= 2)
            const zoomIn =
              !abnormality &&
              Math.min(1, expressions.disgusted) +
                Math.min(1, expressions.sad) +
                Math.min(1, expressions.angry) +
                Math.min(1, expressions.surprised) +
                Math.min(1, expressions.fearful) >
                // Math.min(1, expressions.happy) >
                0.66
            const zoomOut =
              // Math.min(1, expressions.happy) +
              Math.min(1, expressions.neutral) > 0.66

            if (zoomIn) {
              await request("/api/obs/zoom?zoomIn=true", { method: "POST" })
            } else if (zoomOut) {
              await request("/api/obs/zoom?zoomOut=true", { method: "POST" })
            }
          }
        }, 1000)

        return () => clearInterval(handle)
      }
    }

    // init()
  }, [])

  useEffect(() => {
    if (transcript?.text && transcript?.text !== lastTranscript?.text)
      setLastTranscript(transcript)
  }, [transcript, lastTranscript])

  useEffect(() => {
    if (!debug && lastTranscript?.text !== lastSentTranscript) {
      request("/api/store-transcript", {
        method: "POST",
        body: JSON.stringify({
          text: `<transcript>: ${lastTranscript?.text}`,
        }),
        headers: { "Content-Type": "application/json" },
      })
    }

    setLastSentTranscript(lastTranscript?.text)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSentTranscript, transcript?.timestamp, debug])

  const [_, setNotifications, notifications, previous] =
    useQueue<NotifiableTwitchEvent>({
      count: MAX_NOTIFICATIONS,
      timeout: NOTIFICATION_DURATION * 1000,
    })

  const notificationsWithPrevious = [previous, ...(notifications || [])].filter(
    (notification) => !!notification
  ) as NotifiableTwitchEvent[]

  const handleTwitchEvent = (twitchEvent: TwitchEvent) => {
    const key = hash(twitchEvent)
    const event = { ...twitchEvent, key }

    if (event.type !== "channel.update") {
      setNotifications((n) => [...n, event])
    }
  }

  useTwitchEvent(handleTwitchEvent)

  const { socket } = useSocket()
  useEvent<boolean>(socket, "transitioning", (value) => {
    setTransitioning(value)
  })
  useEvent<Segment>(socket, "segment", (segment) => {
    setSegment(segment)
  })

  const creditAuthor = async (author?: string) => {
    // if (!author || debug) return
    //
    // await delay(500)
    // Credit the animation author
    // await request("/api/chat", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     announce: true,
    //     message: `Transition animation brought to you by @${author}`,
    //   }),
    // })
  }

  return (
    <div className="origin-top-left scale-[200%] transform">
      <div className="relative h-[1080px] w-[1920px]">
        <Head>
          <title>Adam&apos;s Twitch Overlay</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ul
          className={cn({
            "absolute top-10 right-10 z-50 flex w-[400px] flex-col-reverse justify-end space-y-4 space-y-reverse":
              true,
            "gradient-mask-b-80": true,
          })}
          style={{ height: NOTIFICATION_PANEL_HEIGHT }}
        >
          <AnimatePresence initial={false}>
            {notificationsWithPrevious?.map((notification) => (
              <motion.li
                key={notification.key}
                layout="position"
                initial={{ opacity: 0.33, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.33,
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  mass: 0.5,
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.33, ease: "anticipate" },
                }}
              >
                <Notification notification={notification} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <Stinger transitioning={transitioning} onTransitioned={creditAuthor} />
        <video
          id="video"
          width="1280"
          height="720"
          autoPlay
          muted
          ref={videoRef}
          className={`absolute inset-0 ${!debug && "invisible"}`}
        ></video>
        {segment ? (
          <div className="origin-top-left scale-50 transform">
            <SegmentScreen segment={segment} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Shared

const SegmentScreen = ({ segment }: { segment: Segment }) => {
  return (
    <Overlay>
      <audio autoPlay src={segment.track || "/media/downward.wav"} />
      <Grid
        center={
          <div className="absolute inset-0 flex items-center justify-center font-holbeard text-[600px] uppercase text-mauve-12">
            {segment.title}
          </div>
        }
      />
    </Overlay>
  )
}
