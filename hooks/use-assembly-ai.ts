import React from "react"
import { useEffect } from "react"

let socket: WebSocket | null
let startTime: number | undefined

export interface Transcript {
  timestamp: number
  text: string
}

export const useAssemblyAi = (debug: boolean = false) => {
  const [transcript, setTranscript] = React.useState<Transcript>()

  useEffect(() => {
    const run = async () => {
      if (debug) return

      if (!socket) {
        const RecordRTC = (await import("recordrtc")).default
        const response = await fetch("/api/assembly-ai", { cache: "no-cache" })
        const data = await response.json()
        const { token } = data

        // establish wss with AssemblyAI (AAI) at 16000 sample rate
        socket = new WebSocket(
          `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
        )

        socket.onerror = (event) => {
          console.error(event)
          socket?.close()
        }

        socket.onclose = (event) => {
          console.log(event)
          socket = null
        }

        socket.onopen = async () => {
          startTime = Date.now()

          const devices = await navigator.mediaDevices.enumerateDevices()
          const device = devices.find(
            (d) =>
              d.kind === "audioinput" &&
              d.label.toLowerCase().startsWith("universal audio")
          )
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: device?.deviceId } },
          })

          // once socket is open, begin recording
          const recorder = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm", // endpoint requires 16bit PCM audio
            recorderType: RecordRTC.StereoAudioRecorder,
            timeSlice: 250, // set 250 ms intervals of data that sends to AAI
            desiredSampRate: 16000,
            numberOfAudioChannels: 1, // real-time requires only one channel
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: (blob) => {
              const reader = new FileReader()
              reader.onload = () => {
                const base64data = reader.result as string

                // audio data must be sent as a base64 encoded string
                if (socket && socket.readyState === 1) {
                  socket.send(
                    JSON.stringify({
                      audio_data: base64data.split("base64,")[1],
                    })
                  )
                }
              }
              reader.readAsDataURL(blob)
            },
          })

          recorder.startRecording()
        }
      }

      // handle incoming messages to display transcription to the DOM
      socket.onmessage = (message) => {
        const { data } = message
        const transcript = JSON.parse(data)
        setTranscript({
          timestamp: startTime + transcript.audio_start,
          text: transcript.text,
        })
      }
    }

    run()
  }, [debug])

  return transcript
}
