export const fadeAudioOut = async ({
  audio,
  length = 5 * 1000,
  interval = 100,
}: {
  audio: HTMLAudioElement
  length?: number
  interval?: number
}) => {
  if (!audio) return

  return new Promise<void>((resolve) => {
    let intervalHandle = setInterval(() => {
      if (audio.volume === 0) {
        audio.pause()
        clearInterval(intervalHandle)
        resolve()
      }
      const newVolume = audio.volume - 1 / (length / interval)
      audio.volume = Math.max(newVolume, 0)
    }, interval)
  })
}
