import { Camera } from "@react-three/fiber"
import { Face } from "@tensorflow-models/face-landmarks-detection"
import { RefObject, useEffect, useRef } from "react"
import THREE, { Matrix3, Matrix4, Vector3 } from "three"
import {
  getRotationMatrix,
  leftEyeUpper1,
  midwayBetweenEyes,
  noseBottom,
  rightEyeUpper1,
  videoHeight,
  videoWidth,
} from "../components/models"

export interface Transforms {
  ref: RefObject<THREE.Group>
  position: THREE.Vector3
  scale: THREE.Vector3
  up: THREE.Vector3
}

const matrix3 = new Matrix3()
const matrix4 = new Matrix4()

export const useTransforms = (options: {
  face: Face
  camera: Camera | null
  anchor: {
    index: number
    offset?: {
      x?: number
      y?: number
      z?: number
    }
  }
  scaleCoefficient: number
}): Transforms => {
  const ref = useRef<THREE.Group>(null)
  const { face, camera, anchor, scaleCoefficient } = options

  const positionX = -(face.keypoints[anchor.index].x - videoWidth / 2)
  const positionY = -(face.keypoints[anchor.index].y - videoHeight / 2)
  const positionZ = -(
    -(camera?.position.z ?? 0) + (face.keypoints[anchor.index].z ?? 0)
  )
  const position = new Vector3(positionX, positionY, positionZ)

  // Calculate an Up-Vector using the eyes position and the bottom of the nose
  let upX = face.keypoints[midwayBetweenEyes].x - face.keypoints[noseBottom].x
  let upY = -(
    face.keypoints[midwayBetweenEyes].y - face.keypoints[noseBottom].y
  )
  let upZ =
    (face.keypoints[midwayBetweenEyes].z ?? 0) -
    (face.keypoints[noseBottom].z ?? 0)

  const length = Math.sqrt(upX ** 2 + upY ** 2 + upZ ** 2)
  upX /= length
  upY /= length
  upZ /= length
  const up = new Vector3(upX, upY, upZ)

  // Scale to the size of the head
  const eyeDist = Math.sqrt(
    (face.keypoints[leftEyeUpper1].x - face.keypoints[rightEyeUpper1].x) ** 2 +
      (face.keypoints[leftEyeUpper1].y - face.keypoints[rightEyeUpper1].y) **
        2 +
      ((face.keypoints[leftEyeUpper1].z ?? 0) -
        (face.keypoints[rightEyeUpper1].z ?? 0)) **
        2
  )

  const scaleX = eyeDist * scaleCoefficient
  const scaleY = eyeDist * scaleCoefficient
  const scaleZ = eyeDist * scaleCoefficient
  const scale = new Vector3(scaleX, scaleY, scaleZ)

  const rotationMatrix = getRotationMatrix(face)
  matrix3.fromArray(rotationMatrix.flat())
  matrix4.setFromMatrix3(matrix3)
  // const rotationX = 0
  // const rotationY = -rotationMatrix[2][0]
  // const rotationZ = Math.PI / 2 - Math.acos(upX) // gooooood

  useEffect(() => {
    if (ref.current) {
      if (anchor.offset?.x) ref.current.translateX(-anchor.offset?.x) //(-headWidth * 2)
      if (anchor.offset?.y) ref.current.translateY(-anchor.offset?.y) //(-headWidth * 2)
      if (anchor.offset?.z) ref.current.translateZ(-anchor.offset?.z) //(-headWidth * 2)
      ref.current.setRotationFromMatrix(matrix4)
    }
  }, [
    anchor.offset?.x,
    anchor.offset?.y,
    anchor.offset?.z,
    ref,
    rotationMatrix,
  ])

  return {
    ref,
    scale,
    position,
    up,
  }
}
