import {
  Face,
  FaceLandmarksDetector,
} from "@tensorflow-models/face-landmarks-detection"
import React, { useState, useCallback, useEffect } from "react"

let detector: FaceLandmarksDetector

export const videoWidth = 1920
export const videoHeight = 1080
export const fps = 1

export const useHeadPosition = () => {
  const [loaded, setLoaded] = useState(false)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  // const [faces, setFaces] = useState<Face[]>()
  const [matrices, setMatrices] = useState<number[]>()

  const trackFace = useCallback(async () => {
    if (!loaded || !videoRef.current || !detector) return

    const faces = await detector.estimateFaces(videoRef.current, {
      flipHorizontal: true,
      staticImageMode: false,
    })
    // setFaces(faces)

    const rotationMatrices = faces.map(getRotationMatrix)
    setMatrices(rotationMatrices.flat().flat())
  }, [loaded])

  useEffect(() => {
    async function init() {
      const video = videoRef.current
      if (!video) return

      const cameras = await navigator.mediaDevices.enumerateDevices()
      const camlinkCameras = cameras.filter(
        (camera) =>
          camera.kind === "videoinput" && camera.label.startsWith("Cam Link 4K")
      )

      const [desiredCamera] = camlinkCameras
      const userMedia = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: desiredCamera
            ? { exact: desiredCamera.deviceId }
            : undefined,
        },
      })

      video.srcObject = userMedia
      video.onloadeddata = () => setLoaded(true)
      video.play()

      detector = await (await import("../lib/detector")).createDetector()
    }

    init()
  }, [])

  useEffect(() => {
    const timer = setInterval(trackFace, 1000 / fps)
    return () => clearInterval(timer)
  }, [trackFace])

  const rotationRelativeToCamera = matrices && matrices[2]
  const lookingAtScreen =
    rotationRelativeToCamera && rotationRelativeToCamera < 0.7

  return { lookingAtScreen, videoRef }
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
    [
      Number.parseFloat(vx[0].toFixed(2)),
      Number.parseFloat(vy[0].toFixed(2)),
      Number.parseFloat(vz[0].toFixed(2)),
    ],
    [
      Number.parseFloat(vx[1].toFixed(2)),
      Number.parseFloat(vy[1].toFixed(2)),
      Number.parseFloat(vz[1].toFixed(2)),
    ],
    [
      Number.parseFloat(vx[2].toFixed(2)),
      Number.parseFloat(vy[2].toFixed(2)),
      Number.parseFloat(vz[2].toFixed(2)),
    ],
  ]
}
