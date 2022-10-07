const host = "http://127.0.0.1:32222"
const linkId = "204D324B4D31"

type Pose = 0 | 1 | 2 | 3 | 4 | 5

export async function goToPose(
  pose: Pose,
  options: { acceleration: number; speed: number } = {
    acceleration: 0.1,
    speed: 1,
  }
) {
  try {
    return await fetch(`${host}/v1/bundle/${linkId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: "keyposeMoveFixedSpeed",
        index: pose,
        ...options,
      }),
    })
  } catch (error) {
    console.error(error)
  }
}
