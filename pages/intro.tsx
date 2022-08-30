/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next"
import { ComponentProps, useEffect, useRef, useState } from "react"
import { useStream, UseStreamResponse } from "../hooks"
import cn from "classnames"
import {
  AudioSpectrum,
  BrandMark,
  Grid,
  Overlay,
  Carousel,
  Ticket,
} from "../components"
import { fadeAudioOut } from "../lib/audio"
import React from "react"
import metadata from "../stream.json"
import { useRouter } from "next/router"

const AUDIO_FADE_LENGTH = 5 * 1000
const LOADING_INTERVAL = 200

export const Intro: NextPage = () => {
  const router = useRouter()
  const debug = router.query.debug === "true"

  const [showTitleScreen, setShowTitleScreen] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const stream = useStream()

  const handleClockStart = React.useCallback(() => {
    setTimeout(() => {
      audioRef.current?.play()
    }, 2000)
  }, [])

  const handleClockStop = React.useCallback(async () => {
    if (!audioRef.current) return

    await fadeAudioOut({ audio: audioRef.current, length: AUDIO_FADE_LENGTH })
    setShowTitleScreen(true)
  }, [])

  return (
    <Overlay>
      <audio
        loop
        ref={audioRef}
        id="audio-element"
        src="/media/theme-lofi.wav"
      // src="/media/theme-piano-stem.mp3"
      />
      {showTitleScreen ? (
        metadata.mode === "guest" ? (
          <GuestTitleScreen stream={stream} />
        ) : (
          <TitleScreen />
        )
      ) : (
        <Grid
          topLeft={<BrandMark />}
          topCenter={
            <div className="flex h-full items-center text-mauve-12">
              Streaming web development every weekday
            </div>
          }
          centerLeft={
            <div className="mt-[26px] text-right text-5xl font-light text-mauve-11">
              Next
            </div>
          }
          center={
            <div className="mt-[26px]">
              <div className="text-5xl font-light text-mauve-12">
                {stream?.current.title ?? stream?.next?.title}
              </div>
              <div className="mt-6 text-4xl font-light text-mauve-11">
                {stream?.current.start?.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  year: "numeric",
                  day: "numeric",
                  hour: "numeric",
                }) || ""}
                <span> CT</span>
              </div>
            </div>
          }
          centerRight={
            <Clock
              minutes={debug ? 0.25 : 10}
              onStopTime={AUDIO_FADE_LENGTH}
              className="absolute right-0 -top-[118px] h-[360px] w-[360px]"
              onStart={handleClockStart}
              onStop={handleClockStop}
            />
          }
          bottomCenter={
            <Carousel>
              <AudioSpectrum audioRef={audioRef} />
              <Ticket />
            </Carousel>
          }
        />
      )}
    </Overlay>
  )
}

export default Intro

const TitleScreen = () => {
  const [loadingPercentage, setLoadingPercentage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const lengths = [
        0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.007, 0.008, 0.009, 0.075,
        0.1,
      ]
      const maxIncrease = lengths[Math.floor(Math.random() * lengths.length)]
      const increase = Math.random() * maxIncrease
      setLoadingPercentage((p) => Math.min(p + increase, 1))
    }, LOADING_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return (
    <Grid
      center={
        <div className="absolute inset-0 flex items-center justify-center font-holbeard text-[600px] uppercase text-mauve-12">
          Let&apos;s Go
        </div>
      }
      bottomCenter={
        <div className="absolute inset-0 flex items-center">
          <div className="relative h-[2px] w-full bg-mauve-10">
            <div
              className="absolute inset-y-0 bg-mint"
              style={{ width: `${loadingPercentage * 100}%` }}
            />
          </div>
        </div>
      }
    />
  )
}

const GuestTitleScreen: React.FC<{ stream?: UseStreamResponse }> = ({
  stream,
}) => {
  return (
    <Grid
      compact
      center={
        <div className="absolute inset-0">
          <GuestBrandDetail className="absolute inset-0" />

          <div className="absolute inset-x-0 top-0 z-50 flex justify-center font-holbeard text-[400px] uppercase leading-[299px] text-mauve-12">
            Guest Stream
          </div>

          <div className="leading-1 absolute inset-x-0 top-[324px] z-50 flex justify-center font-bebas text-[38px] uppercase text-mauve-12">
            With
          </div>

          <div className="absolute top-[30px] left-[30px] z-40 h-[360px] w-[360px] border border-mauve-11" />
          <div className="absolute top-[30px] right-[58px] z-40 h-[360px] w-[360px] border border-mauve-11" />
          <img
            className="absolute top-[40px] left-[40px] h-[360px] w-[360px]"
            src="/images/adam.png"
            alt="Adam Elmore"
          />
          <img
            className="absolute top-[40px] right-[48px] h-[360px] w-[360px]"
            src={metadata.guest.image}
            alt={metadata.guest.name}
          />

          <div className="absolute bottom-[20px] right-[788px] z-50 w-auto min-w-[150px] bg-mint px-4 py-2">
            <div className="text-lg font-bold text-mauve-1">Adam Elmore</div>
            <div className="text-sm font-medium text-[#040013] text-opacity-[48%]">
              @aeduhm
            </div>
          </div>

          <div className="absolute bottom-[20px] right-[28px] z-50 w-auto min-w-[150px] bg-mint px-4  py-2">
            <div className="text-lg font-bold text-mauve-1">
              {metadata.guest.name}
            </div>
            <div className="text-sm font-medium text-[#040013] text-opacity-[48%]">
              {metadata.guest.twitter}
            </div>
          </div>
        </div>
      }
      bottomCenter={
        <div className="absolute inset-0 flex flex-col justify-center text-center">
          <div className="text-2xl text-mauve-12">
            {stream?.current.title ?? "Building web things"}
          </div>
          <div className="mt-6 text-xl text-mauve-12">
            {stream?.current.start?.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              year: "numeric",
              day: "numeric",
              hour: "numeric",
            }) || ""}
            <span className="text-mauve-11"> CT</span>
          </div>
        </div>
      }
    />
  )
}

interface ClockProps extends ComponentProps<"div"> {
  minutes: number
  onStart?: () => void
  onStop?: () => void
  onStopTime?: number
}

const paths = [
  "M179 0H181V40H179V0Z",
  "M200.413 17.273L202.396 17.534L199.263 41.3287L197.28 41.0676L200.413 17.273Z",
  "M221.479 21.3291L223.41 21.8467L217.199 45.029L215.267 44.5113L221.479 21.3291Z",
  "M241.834 28.1011L243.682 28.8664L234.498 51.0396L232.65 50.2742L241.834 28.1011Z",
  "M269.133 23.6152L270.865 24.6152L250.865 59.2562L249.133 58.2562L269.133 23.6152Z",
  "M279.041 49.2817L280.628 50.4993L266.018 69.5397L264.431 68.3222L279.041 49.2817Z",
  "M295.259 63.3271L296.673 64.7414L279.702 81.7119L278.288 80.2977L295.259 63.3271Z",
  "M309.501 79.3701L310.718 80.9568L291.678 95.5671L290.46 93.9804L309.501 79.3701Z",
  "M335.383 89.1338L336.383 90.8658L301.742 110.866L300.742 109.134L335.383 89.1338Z",
  "M331.133 116.316L331.898 118.164L309.725 127.349L308.96 125.501L331.133 116.316Z",
  "M338.152 136.588L338.67 138.52L315.487 144.731L314.97 142.8L338.152 136.588Z",
  undefined,
  undefined,
  undefined,
  "M338.671 221.481L338.154 223.413L314.971 217.201L315.489 215.269L338.671 221.481Z",
  "M331.9 241.836L331.135 243.684L308.962 234.5L309.727 232.652L331.9 241.836Z",
  "M336.383 269.134L335.383 270.866L300.742 250.866L301.742 249.134L336.383 269.134Z",
  "M310.72 279.043L309.503 280.63L290.462 266.02L291.68 264.433L310.72 279.043Z",
  "M296.671 295.259L295.257 296.673L278.286 279.703L279.7 278.289L296.671 295.259Z",
  "M280.63 309.501L279.043 310.719L264.433 291.679L266.02 290.461L280.63 309.501Z",
  "M270.868 335.384L269.136 336.384L249.136 301.743L250.868 300.743L270.868 335.384Z",
  "M243.683 331.134L241.835 331.899L232.651 309.726L234.499 308.961L243.683 331.134Z",
  "M223.415 338.154L221.483 338.672L215.271 315.49L217.203 314.972L223.415 338.154Z",
  "M202.399 342.467L200.416 342.728L197.283 318.933L199.266 318.672L202.399 342.467Z",
  "M181 359.728L179 359.728L179 319.728L181 319.728L181 359.728Z",
  "M159.587 342.455L157.604 342.194L160.737 318.399L162.72 318.66L159.587 342.455Z",
  "M138.521 338.399L136.59 337.881L142.801 314.699L144.733 315.217L138.521 338.399Z",
  "M118.165 331.627L116.317 330.862L125.501 308.688L127.349 309.454L118.165 331.627Z",
  "M90.8666 336.113L89.1346 335.113L109.135 300.472L110.867 301.472L90.8666 336.113Z",
  "M80.9586 310.446L79.3719 309.229L93.9821 290.188L95.5689 291.406L80.9586 310.446Z",
  "M64.7414 296.401L63.3271 294.987L80.2977 278.016L81.7119 279.43L64.7414 296.401Z",
  "M50.4992 280.358L49.2816 278.771L68.3221 264.161L69.5396 265.748L50.4992 280.358Z",
  "M24.6171 270.594L23.6171 268.862L58.2581 248.862L59.2581 250.594L24.6171 270.594Z",
  "M28.867 243.412L28.1017 241.564L50.2748 232.379L51.0402 234.227L28.867 243.412Z",
  "M21.848 223.14L21.3304 221.208L44.5126 214.997L45.0302 216.928L21.848 223.14Z",
  "M17.5348 202.125L17.2738 200.143L41.0684 197.01L41.3295 198.993L17.5348 202.125Z",
  "M0 180.728L2.62268e-07 178.728L40 178.728L40 180.728L0 180.728Z",
  "M17.2753 159.313L17.5363 157.33L41.331 160.463L41.07 162.446L17.2753 159.313Z",
  "M21.3288 138.247L21.8465 136.315L45.0287 142.527L44.5111 144.459L21.3288 138.247Z",
  "M28.0997 117.892L28.865 116.044L51.0382 125.228L50.2728 127.076L28.0997 117.892Z",
  "M23.6173 90.5942L24.6173 88.8622L59.2583 108.862L58.2583 110.594L23.6173 90.5942Z",
  "M49.2796 80.6846L50.4971 79.0979L69.5376 93.7081L68.3201 95.2948L49.2796 80.6846Z",
  "M63.3291 64.4687L64.7433 63.0545L81.7139 80.0251L80.2997 81.4393L63.3291 64.4687Z",
  "M79.3698 50.2266L80.9565 49.009L95.5668 68.0495L93.9801 69.267L79.3698 50.2266Z",
  "M89.1322 24.3437L90.8643 23.3437L110.864 57.9848L109.132 58.9848L89.1322 24.3437Z",
  "M116.317 28.5942L118.165 27.8289L127.349 50.002L125.501 50.7673L116.317 28.5942Z",
  "M136.585 21.5737L138.517 21.0561L144.729 44.2383L142.797 44.7559L136.585 21.5737Z",
  "M157.601 17.2612L159.584 17.0002L162.717 40.7949L160.734 41.0559L157.601 17.2612Z",
]

const Clock: React.FC<ClockProps> = ({
  className,
  onStart,
  onStop,
  onStopTime,
  ...props
}) => {
  const { minutes } = props
  const [time, setTime] = useState<string>()
  // 48 total ticks
  const [elapsedTicks, setElapsedTicks] = useState<number>(0)
  const stoppedRef = useRef(false)

  useEffect(() => {
    const startTime = Number(new Date())
    const endTime = startTime + minutes * 60 * 1000

    const interval = setInterval(() => {
      const current = Number(new Date())
      const remainingMs = endTime - current

      if (remainingMs <= (onStopTime ?? 0) && !stoppedRef.current) {
        stoppedRef.current = true
        if (onStop) onStop()
      }

      if (remainingMs < 0) {
        setTime("00:00:00")
        return
      }

      const remaining = new Date(remainingMs)
      setTime(remaining.toISOString().substring(11, 19))

      const elapsed = (current - startTime) / 1000
      const totalSeconds = minutes * 60
      const percentageComplete = (elapsed / totalSeconds) * 100
      const ticks = Math.floor((percentageComplete / 100) * 48)
      setElapsedTicks(ticks)
    }, 100)

    if (onStart) onStart()

    return () => clearInterval(interval)
  }, [minutes, onStart, onStop, onStopTime])

  const pastTicksColor = "#D9D9D9"
  const futureTicksColor = "#25D0AB"

  return (
    <div
      className={cn({
        "flex items-center justify-end": true,
        [className ?? ""]: true,
      })}
      {...props}
    >
      <svg
        viewBox="0 0 360 360"
        fill="none"
        className="absolute inset-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map(
          (path, index) =>
            path && (
              <path
                key={index}
                d={path}
                fill={elapsedTicks >= index ? futureTicksColor : pastTicksColor}
              />
            )
        )}
      </svg>
      <div
        className="text-5xl font-light text-mauve-12"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {time}
      </div>
    </div>
  )
}

export const BrandDetail: React.FC<ComponentProps<"svg">> = (props) => {
  return (
    <svg
      viewBox="0 0 1200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-mint"
      {...props}
    >
      <rect x="9" y="9" width="2" height="2" fill="currentColor" />
      <rect x="169" y="9" width="2" height="2" fill="currentColor" />
      <rect x="329" y="9" width="2" height="2" fill="currentColor" />
      <rect x="489" y="9" width="2" height="2" fill="currentColor" />
      <rect x="649" y="9" width="2" height="2" fill="currentColor" />
      <rect x="809" y="9" width="2" height="2" fill="currentColor" />
      <rect x="969" y="9" width="2" height="2" fill="currentColor" />
      <rect x="1129" y="9" width="2" height="2" fill="currentColor" />
      <rect x="9" y="29" width="2" height="2" fill="currentColor" />
      <rect x="169" y="29" width="2" height="2" fill="currentColor" />
      <rect x="329" y="29" width="2" height="2" fill="currentColor" />
      <rect x="489" y="29" width="2" height="2" fill="currentColor" />
      <rect x="649" y="29" width="2" height="2" fill="currentColor" />
      <rect x="809" y="29" width="2" height="2" fill="currentColor" />
      <rect x="969" y="29" width="2" height="2" fill="currentColor" />
      <rect x="1129" y="29" width="2" height="2" fill="currentColor" />
      <rect x="9" y="49" width="2" height="2" fill="currentColor" />
      <rect x="169" y="49" width="2" height="2" fill="currentColor" />
      <rect x="329" y="49" width="2" height="2" fill="currentColor" />
      <rect x="489" y="49" width="2" height="2" fill="currentColor" />
      <rect x="649" y="49" width="2" height="2" fill="currentColor" />
      <rect x="809" y="49" width="2" height="2" fill="currentColor" />
      <rect x="969" y="49" width="2" height="2" fill="currentColor" />
      <rect x="1129" y="49" width="2" height="2" fill="currentColor" />
      <rect x="9" y="69" width="2" height="2" fill="currentColor" />
      <rect x="169" y="69" width="2" height="2" fill="currentColor" />
      <rect x="329" y="69" width="2" height="2" fill="currentColor" />
      <rect x="489" y="69" width="2" height="2" fill="currentColor" />
      <rect x="649" y="69" width="2" height="2" fill="currentColor" />
      <rect x="809" y="69" width="2" height="2" fill="currentColor" />
      <rect x="969" y="69" width="2" height="2" fill="currentColor" />
      <rect x="1129" y="69" width="2" height="2" fill="currentColor" />
      <rect x="9" y="89" width="2" height="2" fill="currentColor" />
      <rect x="169" y="89" width="2" height="2" fill="currentColor" />
      <rect x="329" y="89" width="2" height="2" fill="currentColor" />
      <rect x="489" y="89" width="2" height="2" fill="currentColor" />
      <rect x="649" y="89" width="2" height="2" fill="currentColor" />
      <rect x="809" y="89" width="2" height="2" fill="currentColor" />
      <rect x="969" y="89" width="2" height="2" fill="currentColor" />
      <rect x="1129" y="89" width="2" height="2" fill="currentColor" />
      <rect x="9" y="109" width="2" height="2" fill="currentColor" />
      <rect x="169" y="109" width="2" height="2" fill="currentColor" />
      <rect x="329" y="109" width="2" height="2" fill="currentColor" />
      <rect x="489" y="109" width="2" height="2" fill="currentColor" />
      <rect x="649" y="109" width="2" height="2" fill="currentColor" />
      <rect x="809" y="109" width="2" height="2" fill="currentColor" />
      <rect x="969" y="109" width="2" height="2" fill="currentColor" />
      <rect x="1129" y="109" width="2" height="2" fill="currentColor" />
      <rect x="9" y="129" width="2" height="2" fill="currentColor" />
      <rect x="169" y="129" width="2" height="2" fill="currentColor" />
      <rect x="329" y="129" width="2" height="2" fill="currentColor" />
      <rect x="489" y="129" width="2" height="2" fill="currentColor" />
      <rect x="649" y="129" width="2" height="2" fill="currentColor" />
      <rect x="809" y="129" width="2" height="2" fill="currentColor" />
      <rect x="969" y="129" width="2" height="2" fill="currentColor" />
      <rect x="1129" y="129" width="2" height="2" fill="currentColor" />
      <rect x="9" y="149" width="2" height="2" fill="currentColor" />
      <rect x="169" y="149" width="2" height="2" fill="currentColor" />
      <rect x="329" y="149" width="2" height="2" fill="currentColor" />
      <rect x="489" y="149" width="2" height="2" fill="currentColor" />
      <rect x="649" y="149" width="2" height="2" fill="currentColor" />
      <rect x="809" y="149" width="2" height="2" fill="currentColor" />
      <rect x="969" y="149" width="2" height="2" fill="currentColor" />
      <rect x="1129" y="149" width="2" height="2" fill="currentColor" />
      <rect x="29" y="9" width="2" height="2" fill="currentColor" />
      <rect x="189" y="9" width="2" height="2" fill="currentColor" />
      <rect x="349" y="9" width="2" height="2" fill="currentColor" />
      <rect x="509" y="9" width="2" height="2" fill="currentColor" />
      <rect x="669" y="9" width="2" height="2" fill="currentColor" />
      <rect x="829" y="9" width="2" height="2" fill="currentColor" />
      <rect x="989" y="9" width="2" height="2" fill="currentColor" />
      <rect x="1149" y="9" width="2" height="2" fill="currentColor" />
      <rect x="29" y="29" width="2" height="2" fill="currentColor" />
      <rect x="189" y="29" width="2" height="2" fill="currentColor" />
      <rect x="349" y="29" width="2" height="2" fill="currentColor" />
      <rect x="509" y="29" width="2" height="2" fill="currentColor" />
      <rect x="669" y="29" width="2" height="2" fill="currentColor" />
      <rect x="829" y="29" width="2" height="2" fill="currentColor" />
      <rect x="989" y="29" width="2" height="2" fill="currentColor" />
      <rect x="1149" y="29" width="2" height="2" fill="currentColor" />
      <rect x="29" y="49" width="2" height="2" fill="currentColor" />
      <rect x="189" y="49" width="2" height="2" fill="currentColor" />
      <rect x="349" y="49" width="2" height="2" fill="currentColor" />
      <rect x="509" y="49" width="2" height="2" fill="currentColor" />
      <rect x="669" y="49" width="2" height="2" fill="currentColor" />
      <rect x="829" y="49" width="2" height="2" fill="currentColor" />
      <rect x="989" y="49" width="2" height="2" fill="currentColor" />
      <rect x="1149" y="49" width="2" height="2" fill="currentColor" />
      <rect x="29" y="69" width="2" height="2" fill="currentColor" />
      <rect x="189" y="69" width="2" height="2" fill="currentColor" />
      <rect x="349" y="69" width="2" height="2" fill="currentColor" />
      <rect x="509" y="69" width="2" height="2" fill="currentColor" />
      <rect x="669" y="69" width="2" height="2" fill="currentColor" />
      <rect x="829" y="69" width="2" height="2" fill="currentColor" />
      <rect x="989" y="69" width="2" height="2" fill="currentColor" />
      <rect x="1149" y="69" width="2" height="2" fill="currentColor" />
      <rect x="29" y="89" width="2" height="2" fill="currentColor" />
      <rect x="189" y="89" width="2" height="2" fill="currentColor" />
      <rect x="349" y="89" width="2" height="2" fill="currentColor" />
      <rect x="509" y="89" width="2" height="2" fill="currentColor" />
      <rect x="669" y="89" width="2" height="2" fill="currentColor" />
      <rect x="829" y="89" width="2" height="2" fill="currentColor" />
      <rect x="989" y="89" width="2" height="2" fill="currentColor" />
      <rect x="1149" y="89" width="2" height="2" fill="currentColor" />
      <rect x="29" y="109" width="2" height="2" fill="currentColor" />
      <rect x="189" y="109" width="2" height="2" fill="currentColor" />
      <rect x="349" y="109" width="2" height="2" fill="currentColor" />
      <rect x="509" y="109" width="2" height="2" fill="currentColor" />
      <rect x="669" y="109" width="2" height="2" fill="currentColor" />
      <rect x="829" y="109" width="2" height="2" fill="currentColor" />
      <rect x="989" y="109" width="2" height="2" fill="currentColor" />
      <rect x="1149" y="109" width="2" height="2" fill="currentColor" />
      <rect x="29" y="129" width="2" height="2" fill="currentColor" />
      <rect x="189" y="129" width="2" height="2" fill="currentColor" />
      <rect x="349" y="129" width="2" height="2" fill="currentColor" />
      <rect x="509" y="129" width="2" height="2" fill="currentColor" />
      <rect x="669" y="129" width="2" height="2" fill="currentColor" />
      <rect x="829" y="129" width="2" height="2" fill="currentColor" />
      <rect x="989" y="129" width="2" height="2" fill="currentColor" />
      <rect x="1149" y="129" width="2" height="2" fill="currentColor" />
      <rect x="29" y="149" width="2" height="2" fill="currentColor" />
      <rect x="189" y="149" width="2" height="2" fill="currentColor" />
      <rect x="349" y="149" width="2" height="2" fill="currentColor" />
      <rect x="509" y="149" width="2" height="2" fill="currentColor" />
      <rect x="669" y="149" width="2" height="2" fill="currentColor" />
      <rect x="829" y="149" width="2" height="2" fill="currentColor" />
      <rect x="989" y="149" width="2" height="2" fill="currentColor" />
      <rect x="1149" y="149" width="2" height="2" fill="currentColor" />
      <rect x="49" y="9" width="2" height="2" fill="currentColor" />
      <rect x="209" y="9" width="2" height="2" fill="currentColor" />
      <rect x="369" y="9" width="2" height="2" fill="currentColor" />
      <rect x="529" y="9" width="2" height="2" fill="currentColor" />
      <rect x="689" y="9" width="2" height="2" fill="currentColor" />
      <rect x="849" y="9" width="2" height="2" fill="currentColor" />
      <rect x="1009" y="9" width="2" height="2" fill="currentColor" />
      <rect x="1169" y="9" width="2" height="2" fill="currentColor" />
      <rect x="49" y="29" width="2" height="2" fill="currentColor" />
      <rect x="209" y="29" width="2" height="2" fill="currentColor" />
      <rect x="369" y="29" width="2" height="2" fill="currentColor" />
      <rect x="529" y="29" width="2" height="2" fill="currentColor" />
      <rect x="689" y="29" width="2" height="2" fill="currentColor" />
      <rect x="849" y="29" width="2" height="2" fill="currentColor" />
      <rect x="1009" y="29" width="2" height="2" fill="currentColor" />
      <rect x="1169" y="29" width="2" height="2" fill="currentColor" />
      <rect x="49" y="49" width="2" height="2" fill="currentColor" />
      <rect x="209" y="49" width="2" height="2" fill="currentColor" />
      <rect x="369" y="49" width="2" height="2" fill="currentColor" />
      <rect x="529" y="49" width="2" height="2" fill="currentColor" />
      <rect x="689" y="49" width="2" height="2" fill="currentColor" />
      <rect x="849" y="49" width="2" height="2" fill="currentColor" />
      <rect x="1009" y="49" width="2" height="2" fill="currentColor" />
      <rect x="1169" y="49" width="2" height="2" fill="currentColor" />
      <rect x="49" y="69" width="2" height="2" fill="currentColor" />
      <rect x="209" y="69" width="2" height="2" fill="currentColor" />
      <rect x="369" y="69" width="2" height="2" fill="currentColor" />
      <rect x="529" y="69" width="2" height="2" fill="currentColor" />
      <rect x="689" y="69" width="2" height="2" fill="currentColor" />
      <rect x="849" y="69" width="2" height="2" fill="currentColor" />
      <rect x="1009" y="69" width="2" height="2" fill="currentColor" />
      <rect x="1169" y="69" width="2" height="2" fill="currentColor" />
      <rect x="49" y="89" width="2" height="2" fill="currentColor" />
      <rect x="209" y="89" width="2" height="2" fill="currentColor" />
      <rect x="369" y="89" width="2" height="2" fill="currentColor" />
      <rect x="529" y="89" width="2" height="2" fill="currentColor" />
      <rect x="689" y="89" width="2" height="2" fill="currentColor" />
      <rect x="849" y="89" width="2" height="2" fill="currentColor" />
      <rect x="1009" y="89" width="2" height="2" fill="currentColor" />
      <rect x="1169" y="89" width="2" height="2" fill="currentColor" />
      <rect x="49" y="109" width="2" height="2" fill="currentColor" />
      <rect x="209" y="109" width="2" height="2" fill="currentColor" />
      <rect x="369" y="109" width="2" height="2" fill="currentColor" />
      <rect x="529" y="109" width="2" height="2" fill="currentColor" />
      <rect x="689" y="109" width="2" height="2" fill="currentColor" />
      <rect x="849" y="109" width="2" height="2" fill="currentColor" />
      <rect x="1009" y="109" width="2" height="2" fill="currentColor" />
      <rect x="1169" y="109" width="2" height="2" fill="currentColor" />
      <rect x="49" y="129" width="2" height="2" fill="currentColor" />
      <rect x="209" y="129" width="2" height="2" fill="currentColor" />
      <rect x="369" y="129" width="2" height="2" fill="currentColor" />
      <rect x="529" y="129" width="2" height="2" fill="currentColor" />
      <rect x="689" y="129" width="2" height="2" fill="currentColor" />
      <rect x="849" y="129" width="2" height="2" fill="currentColor" />
      <rect x="1009" y="129" width="2" height="2" fill="currentColor" />
      <rect x="1169" y="129" width="2" height="2" fill="currentColor" />
      <rect x="49" y="149" width="2" height="2" fill="currentColor" />
      <rect x="209" y="149" width="2" height="2" fill="currentColor" />
      <rect x="369" y="149" width="2" height="2" fill="currentColor" />
      <rect x="529" y="149" width="2" height="2" fill="currentColor" />
      <rect x="689" y="149" width="2" height="2" fill="currentColor" />
      <rect x="849" y="149" width="2" height="2" fill="currentColor" />
      <rect x="1009" y="149" width="2" height="2" fill="currentColor" />
      <rect x="1169" y="149" width="2" height="2" fill="currentColor" />
      <rect x="69" y="9" width="2" height="2" fill="currentColor" />
      <rect x="229" y="9" width="2" height="2" fill="currentColor" />
      <rect x="389" y="9" width="2" height="2" fill="currentColor" />
      <rect x="549" y="9" width="2" height="2" fill="currentColor" />
      <rect x="709" y="9" width="2" height="2" fill="currentColor" />
      <rect x="869" y="9" width="2" height="2" fill="currentColor" />
      <rect x="1029" y="9" width="2" height="2" fill="currentColor" />
      <rect x="1189" y="9" width="2" height="2" fill="currentColor" />
      <rect x="69" y="29" width="2" height="2" fill="currentColor" />
      <rect x="229" y="29" width="2" height="2" fill="currentColor" />
      <rect x="389" y="29" width="2" height="2" fill="currentColor" />
      <rect x="549" y="29" width="2" height="2" fill="currentColor" />
      <rect x="709" y="29" width="2" height="2" fill="currentColor" />
      <rect x="869" y="29" width="2" height="2" fill="currentColor" />
      <rect x="1029" y="29" width="2" height="2" fill="currentColor" />
      <rect x="1189" y="29" width="2" height="2" fill="currentColor" />
      <rect x="69" y="49" width="2" height="2" fill="currentColor" />
      <rect x="229" y="49" width="2" height="2" fill="currentColor" />
      <rect x="389" y="49" width="2" height="2" fill="currentColor" />
      <rect x="549" y="49" width="2" height="2" fill="currentColor" />
      <rect x="709" y="49" width="2" height="2" fill="currentColor" />
      <rect x="869" y="49" width="2" height="2" fill="currentColor" />
      <rect x="1029" y="49" width="2" height="2" fill="currentColor" />
      <rect x="1189" y="49" width="2" height="2" fill="currentColor" />
      <rect x="69" y="69" width="2" height="2" fill="currentColor" />
      <rect x="229" y="69" width="2" height="2" fill="currentColor" />
      <rect x="389" y="69" width="2" height="2" fill="currentColor" />
      <rect x="549" y="69" width="2" height="2" fill="currentColor" />
      <rect x="709" y="69" width="2" height="2" fill="currentColor" />
      <rect x="869" y="69" width="2" height="2" fill="currentColor" />
      <rect x="1029" y="69" width="2" height="2" fill="currentColor" />
      <rect x="1189" y="69" width="2" height="2" fill="currentColor" />
      <rect x="69" y="89" width="2" height="2" fill="currentColor" />
      <rect x="229" y="89" width="2" height="2" fill="currentColor" />
      <rect x="389" y="89" width="2" height="2" fill="currentColor" />
      <rect x="549" y="89" width="2" height="2" fill="currentColor" />
      <rect x="709" y="89" width="2" height="2" fill="currentColor" />
      <rect x="869" y="89" width="2" height="2" fill="currentColor" />
      <rect x="1029" y="89" width="2" height="2" fill="currentColor" />
      <rect x="1189" y="89" width="2" height="2" fill="currentColor" />
      <rect x="69" y="109" width="2" height="2" fill="currentColor" />
      <rect x="229" y="109" width="2" height="2" fill="currentColor" />
      <rect x="389" y="109" width="2" height="2" fill="currentColor" />
      <rect x="549" y="109" width="2" height="2" fill="currentColor" />
      <rect x="709" y="109" width="2" height="2" fill="currentColor" />
      <rect x="869" y="109" width="2" height="2" fill="currentColor" />
      <rect x="1029" y="109" width="2" height="2" fill="currentColor" />
      <rect x="1189" y="109" width="2" height="2" fill="currentColor" />
      <rect x="69" y="129" width="2" height="2" fill="currentColor" />
      <rect x="229" y="129" width="2" height="2" fill="currentColor" />
      <rect x="389" y="129" width="2" height="2" fill="currentColor" />
      <rect x="549" y="129" width="2" height="2" fill="currentColor" />
      <rect x="709" y="129" width="2" height="2" fill="currentColor" />
      <rect x="869" y="129" width="2" height="2" fill="currentColor" />
      <rect x="1029" y="129" width="2" height="2" fill="currentColor" />
      <rect x="1189" y="129" width="2" height="2" fill="currentColor" />
      <rect x="69" y="149" width="2" height="2" fill="currentColor" />
      <rect x="229" y="149" width="2" height="2" fill="currentColor" />
      <rect x="389" y="149" width="2" height="2" fill="currentColor" />
      <rect x="549" y="149" width="2" height="2" fill="currentColor" />
      <rect x="709" y="149" width="2" height="2" fill="currentColor" />
      <rect x="869" y="149" width="2" height="2" fill="currentColor" />
      <rect x="1029" y="149" width="2" height="2" fill="currentColor" />
      <rect x="1189" y="149" width="2" height="2" fill="currentColor" />
      <rect x="89" y="9" width="2" height="2" fill="currentColor" />
      <rect x="249" y="9" width="2" height="2" fill="currentColor" />
      <rect x="409" y="9" width="2" height="2" fill="currentColor" />
      <rect x="569" y="9" width="2" height="2" fill="currentColor" />
      <rect x="729" y="9" width="2" height="2" fill="currentColor" />
      <rect x="889" y="9" width="2" height="2" fill="currentColor" />
      <rect x="1049" y="9" width="2" height="2" fill="currentColor" />
      <rect x="89" y="29" width="2" height="2" fill="currentColor" />
      <rect x="249" y="29" width="2" height="2" fill="currentColor" />
      <rect x="409" y="29" width="2" height="2" fill="currentColor" />
      <rect x="569" y="29" width="2" height="2" fill="currentColor" />
      <rect x="729" y="29" width="2" height="2" fill="currentColor" />
      <rect x="889" y="29" width="2" height="2" fill="currentColor" />
      <rect x="1049" y="29" width="2" height="2" fill="currentColor" />
      <rect x="89" y="49" width="2" height="2" fill="currentColor" />
      <rect x="249" y="49" width="2" height="2" fill="currentColor" />
      <rect x="409" y="49" width="2" height="2" fill="currentColor" />
      <rect x="569" y="49" width="2" height="2" fill="currentColor" />
      <rect x="729" y="49" width="2" height="2" fill="currentColor" />
      <rect x="889" y="49" width="2" height="2" fill="currentColor" />
      <rect x="1049" y="49" width="2" height="2" fill="currentColor" />
      <rect x="89" y="69" width="2" height="2" fill="currentColor" />
      <rect x="249" y="69" width="2" height="2" fill="currentColor" />
      <rect x="409" y="69" width="2" height="2" fill="currentColor" />
      <rect x="569" y="69" width="2" height="2" fill="currentColor" />
      <rect x="729" y="69" width="2" height="2" fill="currentColor" />
      <rect x="889" y="69" width="2" height="2" fill="currentColor" />
      <rect x="1049" y="69" width="2" height="2" fill="currentColor" />
      <rect x="89" y="89" width="2" height="2" fill="currentColor" />
      <rect x="249" y="89" width="2" height="2" fill="currentColor" />
      <rect x="409" y="89" width="2" height="2" fill="currentColor" />
      <rect x="569" y="89" width="2" height="2" fill="currentColor" />
      <rect x="729" y="89" width="2" height="2" fill="currentColor" />
      <rect x="889" y="89" width="2" height="2" fill="currentColor" />
      <rect x="1049" y="89" width="2" height="2" fill="currentColor" />
      <rect x="89" y="109" width="2" height="2" fill="currentColor" />
      <rect x="249" y="109" width="2" height="2" fill="currentColor" />
      <rect x="409" y="109" width="2" height="2" fill="currentColor" />
      <rect x="569" y="109" width="2" height="2" fill="currentColor" />
      <rect x="729" y="109" width="2" height="2" fill="currentColor" />
      <rect x="889" y="109" width="2" height="2" fill="currentColor" />
      <rect x="1049" y="109" width="2" height="2" fill="currentColor" />
      <rect x="89" y="129" width="2" height="2" fill="currentColor" />
      <rect x="249" y="129" width="2" height="2" fill="currentColor" />
      <rect x="409" y="129" width="2" height="2" fill="currentColor" />
      <rect x="569" y="129" width="2" height="2" fill="currentColor" />
      <rect x="729" y="129" width="2" height="2" fill="currentColor" />
      <rect x="889" y="129" width="2" height="2" fill="currentColor" />
      <rect x="1049" y="129" width="2" height="2" fill="currentColor" />
      <rect x="89" y="149" width="2" height="2" fill="currentColor" />
      <rect x="249" y="149" width="2" height="2" fill="currentColor" />
      <rect x="409" y="149" width="2" height="2" fill="currentColor" />
      <rect x="569" y="149" width="2" height="2" fill="currentColor" />
      <rect x="729" y="149" width="2" height="2" fill="currentColor" />
      <rect x="889" y="149" width="2" height="2" fill="currentColor" />
      <rect x="1049" y="149" width="2" height="2" fill="currentColor" />
      <rect x="109" y="9" width="2" height="2" fill="currentColor" />
      <rect x="269" y="9" width="2" height="2" fill="currentColor" />
      <rect x="429" y="9" width="2" height="2" fill="currentColor" />
      <rect x="589" y="9" width="2" height="2" fill="currentColor" />
      <rect x="749" y="9" width="2" height="2" fill="currentColor" />
      <rect x="909" y="9" width="2" height="2" fill="currentColor" />
      <rect x="1069" y="9" width="2" height="2" fill="currentColor" />
      <rect x="109" y="29" width="2" height="2" fill="currentColor" />
      <rect x="269" y="29" width="2" height="2" fill="currentColor" />
      <rect x="429" y="29" width="2" height="2" fill="currentColor" />
      <rect x="589" y="29" width="2" height="2" fill="currentColor" />
      <rect x="749" y="29" width="2" height="2" fill="currentColor" />
      <rect x="909" y="29" width="2" height="2" fill="currentColor" />
      <rect x="1069" y="29" width="2" height="2" fill="currentColor" />
      <rect x="109" y="49" width="2" height="2" fill="currentColor" />
      <rect x="269" y="49" width="2" height="2" fill="currentColor" />
      <rect x="429" y="49" width="2" height="2" fill="currentColor" />
      <rect x="589" y="49" width="2" height="2" fill="currentColor" />
      <rect x="749" y="49" width="2" height="2" fill="currentColor" />
      <rect x="909" y="49" width="2" height="2" fill="currentColor" />
      <rect x="1069" y="49" width="2" height="2" fill="currentColor" />
      <rect x="109" y="69" width="2" height="2" fill="currentColor" />
      <rect x="269" y="69" width="2" height="2" fill="currentColor" />
      <rect x="429" y="69" width="2" height="2" fill="currentColor" />
      <rect x="589" y="69" width="2" height="2" fill="currentColor" />
      <rect x="749" y="69" width="2" height="2" fill="currentColor" />
      <rect x="909" y="69" width="2" height="2" fill="currentColor" />
      <rect x="1069" y="69" width="2" height="2" fill="currentColor" />
      <rect x="109" y="89" width="2" height="2" fill="currentColor" />
      <rect x="269" y="89" width="2" height="2" fill="currentColor" />
      <rect x="429" y="89" width="2" height="2" fill="currentColor" />
      <rect x="589" y="89" width="2" height="2" fill="currentColor" />
      <rect x="749" y="89" width="2" height="2" fill="currentColor" />
      <rect x="909" y="89" width="2" height="2" fill="currentColor" />
      <rect x="1069" y="89" width="2" height="2" fill="currentColor" />
      <rect x="109" y="109" width="2" height="2" fill="currentColor" />
      <rect x="269" y="109" width="2" height="2" fill="currentColor" />
      <rect x="429" y="109" width="2" height="2" fill="currentColor" />
      <rect x="589" y="109" width="2" height="2" fill="currentColor" />
      <rect x="749" y="109" width="2" height="2" fill="currentColor" />
      <rect x="909" y="109" width="2" height="2" fill="currentColor" />
      <rect x="1069" y="109" width="2" height="2" fill="currentColor" />
      <rect x="109" y="129" width="2" height="2" fill="currentColor" />
      <rect x="269" y="129" width="2" height="2" fill="currentColor" />
      <rect x="429" y="129" width="2" height="2" fill="currentColor" />
      <rect x="589" y="129" width="2" height="2" fill="currentColor" />
      <rect x="749" y="129" width="2" height="2" fill="currentColor" />
      <rect x="909" y="129" width="2" height="2" fill="currentColor" />
      <rect x="1069" y="129" width="2" height="2" fill="currentColor" />
      <rect x="109" y="149" width="2" height="2" fill="currentColor" />
      <rect x="269" y="149" width="2" height="2" fill="currentColor" />
      <rect x="429" y="149" width="2" height="2" fill="currentColor" />
      <rect x="589" y="149" width="2" height="2" fill="currentColor" />
      <rect x="749" y="149" width="2" height="2" fill="currentColor" />
      <rect x="909" y="149" width="2" height="2" fill="currentColor" />
      <rect x="1069" y="149" width="2" height="2" fill="currentColor" />
      <rect x="129" y="9" width="2" height="2" fill="currentColor" />
      <rect x="289" y="9" width="2" height="2" fill="currentColor" />
      <rect x="449" y="9" width="2" height="2" fill="currentColor" />
      <rect x="609" y="9" width="2" height="2" fill="currentColor" />
      <rect x="769" y="9" width="2" height="2" fill="currentColor" />
      <rect x="929" y="9" width="2" height="2" fill="currentColor" />
      <rect x="1089" y="9" width="2" height="2" fill="currentColor" />
      <rect x="129" y="29" width="2" height="2" fill="currentColor" />
      <rect x="289" y="29" width="2" height="2" fill="currentColor" />
      <rect x="449" y="29" width="2" height="2" fill="currentColor" />
      <rect x="609" y="29" width="2" height="2" fill="currentColor" />
      <rect x="769" y="29" width="2" height="2" fill="currentColor" />
      <rect x="929" y="29" width="2" height="2" fill="currentColor" />
      <rect x="1089" y="29" width="2" height="2" fill="currentColor" />
      <rect x="129" y="49" width="2" height="2" fill="currentColor" />
      <rect x="289" y="49" width="2" height="2" fill="currentColor" />
      <rect x="449" y="49" width="2" height="2" fill="currentColor" />
      <rect x="609" y="49" width="2" height="2" fill="currentColor" />
      <rect x="769" y="49" width="2" height="2" fill="currentColor" />
      <rect x="929" y="49" width="2" height="2" fill="currentColor" />
      <rect x="1089" y="49" width="2" height="2" fill="currentColor" />
      <rect x="129" y="69" width="2" height="2" fill="currentColor" />
      <rect x="289" y="69" width="2" height="2" fill="currentColor" />
      <rect x="449" y="69" width="2" height="2" fill="currentColor" />
      <rect x="609" y="69" width="2" height="2" fill="currentColor" />
      <rect x="769" y="69" width="2" height="2" fill="currentColor" />
      <rect x="929" y="69" width="2" height="2" fill="currentColor" />
      <rect x="1089" y="69" width="2" height="2" fill="currentColor" />
      <rect x="129" y="89" width="2" height="2" fill="currentColor" />
      <rect x="289" y="89" width="2" height="2" fill="currentColor" />
      <rect x="449" y="89" width="2" height="2" fill="currentColor" />
      <rect x="609" y="89" width="2" height="2" fill="currentColor" />
      <rect x="769" y="89" width="2" height="2" fill="currentColor" />
      <rect x="929" y="89" width="2" height="2" fill="currentColor" />
      <rect x="1089" y="89" width="2" height="2" fill="currentColor" />
      <rect x="129" y="109" width="2" height="2" fill="currentColor" />
      <rect x="289" y="109" width="2" height="2" fill="currentColor" />
      <rect x="449" y="109" width="2" height="2" fill="currentColor" />
      <rect x="609" y="109" width="2" height="2" fill="currentColor" />
      <rect x="769" y="109" width="2" height="2" fill="currentColor" />
      <rect x="929" y="109" width="2" height="2" fill="currentColor" />
      <rect x="1089" y="109" width="2" height="2" fill="currentColor" />
      <rect x="129" y="129" width="2" height="2" fill="currentColor" />
      <rect x="289" y="129" width="2" height="2" fill="currentColor" />
      <rect x="449" y="129" width="2" height="2" fill="currentColor" />
      <rect x="609" y="129" width="2" height="2" fill="currentColor" />
      <rect x="769" y="129" width="2" height="2" fill="currentColor" />
      <rect x="929" y="129" width="2" height="2" fill="currentColor" />
      <rect x="1089" y="129" width="2" height="2" fill="currentColor" />
      <rect x="129" y="149" width="2" height="2" fill="currentColor" />
      <rect x="289" y="149" width="2" height="2" fill="currentColor" />
      <rect x="449" y="149" width="2" height="2" fill="currentColor" />
      <rect x="609" y="149" width="2" height="2" fill="currentColor" />
      <rect x="769" y="149" width="2" height="2" fill="currentColor" />
      <rect x="929" y="149" width="2" height="2" fill="currentColor" />
      <rect x="1089" y="149" width="2" height="2" fill="currentColor" />
      <rect x="149" y="9" width="2" height="2" fill="currentColor" />
      <rect x="309" y="9" width="2" height="2" fill="currentColor" />
      <rect x="469" y="9" width="2" height="2" fill="currentColor" />
      <rect x="629" y="9" width="2" height="2" fill="currentColor" />
      <rect x="789" y="9" width="2" height="2" fill="currentColor" />
      <rect x="949" y="9" width="2" height="2" fill="currentColor" />
      <rect x="1109" y="9" width="2" height="2" fill="currentColor" />
      <rect x="149" y="29" width="2" height="2" fill="currentColor" />
      <rect x="309" y="29" width="2" height="2" fill="currentColor" />
      <rect x="469" y="29" width="2" height="2" fill="currentColor" />
      <rect x="629" y="29" width="2" height="2" fill="currentColor" />
      <rect x="789" y="29" width="2" height="2" fill="currentColor" />
      <rect x="949" y="29" width="2" height="2" fill="currentColor" />
      <rect x="1109" y="29" width="2" height="2" fill="currentColor" />
      <rect x="149" y="49" width="2" height="2" fill="currentColor" />
      <rect x="309" y="49" width="2" height="2" fill="currentColor" />
      <rect x="469" y="49" width="2" height="2" fill="currentColor" />
      <rect x="629" y="49" width="2" height="2" fill="currentColor" />
      <rect x="789" y="49" width="2" height="2" fill="currentColor" />
      <rect x="949" y="49" width="2" height="2" fill="currentColor" />
      <rect x="1109" y="49" width="2" height="2" fill="currentColor" />
      <rect x="149" y="69" width="2" height="2" fill="currentColor" />
      <rect x="309" y="69" width="2" height="2" fill="currentColor" />
      <rect x="469" y="69" width="2" height="2" fill="currentColor" />
      <rect x="629" y="69" width="2" height="2" fill="currentColor" />
      <rect x="789" y="69" width="2" height="2" fill="currentColor" />
      <rect x="949" y="69" width="2" height="2" fill="currentColor" />
      <rect x="1109" y="69" width="2" height="2" fill="currentColor" />
      <rect x="149" y="89" width="2" height="2" fill="currentColor" />
      <rect x="309" y="89" width="2" height="2" fill="currentColor" />
      <rect x="469" y="89" width="2" height="2" fill="currentColor" />
      <rect x="629" y="89" width="2" height="2" fill="currentColor" />
      <rect x="789" y="89" width="2" height="2" fill="currentColor" />
      <rect x="949" y="89" width="2" height="2" fill="currentColor" />
      <rect x="1109" y="89" width="2" height="2" fill="currentColor" />
      <rect x="149" y="109" width="2" height="2" fill="currentColor" />
      <rect x="309" y="109" width="2" height="2" fill="currentColor" />
      <rect x="469" y="109" width="2" height="2" fill="currentColor" />
      <rect x="629" y="109" width="2" height="2" fill="currentColor" />
      <rect x="789" y="109" width="2" height="2" fill="currentColor" />
      <rect x="949" y="109" width="2" height="2" fill="currentColor" />
      <rect x="1109" y="109" width="2" height="2" fill="currentColor" />
      <rect x="149" y="129" width="2" height="2" fill="currentColor" />
      <rect x="309" y="129" width="2" height="2" fill="currentColor" />
      <rect x="469" y="129" width="2" height="2" fill="currentColor" />
      <rect x="629" y="129" width="2" height="2" fill="currentColor" />
      <rect x="789" y="129" width="2" height="2" fill="currentColor" />
      <rect x="949" y="129" width="2" height="2" fill="currentColor" />
      <rect x="1109" y="129" width="2" height="2" fill="currentColor" />
      <rect x="149" y="149" width="2" height="2" fill="currentColor" />
      <rect x="309" y="149" width="2" height="2" fill="currentColor" />
      <rect x="469" y="149" width="2" height="2" fill="currentColor" />
      <rect x="629" y="149" width="2" height="2" fill="currentColor" />
      <rect x="789" y="149" width="2" height="2" fill="currentColor" />
      <rect x="949" y="149" width="2" height="2" fill="currentColor" />
      <rect x="1109" y="149" width="2" height="2" fill="currentColor" />
    </svg>
  )
}

export const GuestBrandDetail: React.FC<ComponentProps<"svg">> = (props) => {
  return (
    <svg
      viewBox="0 0 1200 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="9" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="9" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="169" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="329" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="489" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="649" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="809" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="969" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="1129" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="29" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="189" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="349" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="509" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="669" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="829" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="989" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="1149" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="49" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="209" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="369" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="529" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="689" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="849" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="1009" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="1169" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="69" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="229" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="389" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="549" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="709" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="869" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="1029" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="1189" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="89" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="249" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="409" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="729" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="889" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="1049" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="109" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="269" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="429" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="749" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="909" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="1069" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="129" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="289" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="449" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="769" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="929" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="1089" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="289" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="129" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="29" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="9" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="309" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="149" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="49" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="329" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="169" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="69" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="349" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="189" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="89" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="369" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="209" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="109" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="569" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="589" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="609" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="389" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="229" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="409" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="249" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="149" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="309" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="469" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="629" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="789" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="949" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="429" width="2" height="2" fill="#25D0AB" />
      <rect x="1109" y="269" width="2" height="2" fill="#25D0AB" />
      <rect x="412" y="417" width="2" height="2" fill="#25D0AB" />
    </svg>
  )
}
