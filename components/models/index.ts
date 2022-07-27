import { Camera } from "@react-three/fiber"
import { Face } from "@tensorflow-models/face-landmarks-detection"

export * from "./heart-glasses"
export * from "./st-patrick-hat"

export type ModelProps = {
  face: Face
  camera: Camera | null
} & JSX.IntrinsicElements["group"]

export const videoWidth = 1920
export const videoHeight = 1080
export const fps = 30
export const midwayBetweenEyes = 9
export const noseBottom = 19
export const leftEyeUpper1 = 159
export const rightEyeUpper1 = 386
export const headTop = 151
export const headTopLeft = 103
export const headTopRight = 332

export function getHeadWidth(face: Face): number {
  return Math.sqrt(
    (face.keypoints[headTopLeft].x - face.keypoints[headTopRight].x) ** 2 +
      (face.keypoints[headTopLeft].y - face.keypoints[headTopRight].y) ** 2 +
      ((face.keypoints[headTopLeft].z ?? 0) -
        (face.keypoints[headTopRight].z ?? 0)) **
        2
  )
}

function normalizeVector(v: number[]): number[] {
  const l = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
  return [v[0] / l, v[1] / l, v[2] / l]
}

function crossP(v1: number[], v2: number[]): number[] {
  const e1 = v1[1] * v2[2] - v1[2] * v2[1]
  const e2 = v1[2] * v2[0] - v1[0] * v2[2]
  const e3 = v1[0] * v2[1] - v1[1] * v2[0]

  return [e1, e2, e3]
}

/**
 *
 * @param meshPoints - points produced by facemesh model
 * @returns normalized direction vectors x, y, z; right-handed system
 */
export function getDirectionVectors(
  meshPoints: number[][]
): [number[], number[], number[]] {
  // These points lie *almost* on same line in uv coordinates
  const p1 = meshPoints[127] // cheek
  const p2 = meshPoints[356] // cheek
  const p3 = meshPoints[6] // nose

  const vhelp = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]] as number[]
  const vx_d = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]] as number[]
  const vy_d = crossP(vhelp, vx_d)

  const vx = normalizeVector(vx_d)
  const vy = normalizeVector(vy_d)
  const vz = normalizeVector(crossP(vx_d, vy_d))

  return [vx, vy, vz]
}

/**
 *
 * @param meshPoints - points produced by facemesh model
 * @returns 3x3 rotation matrix; right-handed system
 */
export function getRotationMatrix(face: Face): number[][] {
  if (!face.keypoints)
    return [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]

  const meshPoints = face.keypoints.map((k) => [k.x, k.y, k.z ?? 0])
  const [vx, vy, vz] = getDirectionVectors(meshPoints)

  return [
    [vx[0], vy[0], vz[0]],
    [vx[1], vy[1], vz[1]],
    [vx[2], vy[2], vz[2]],
  ]
}
