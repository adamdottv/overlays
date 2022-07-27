import "@tensorflow/tfjs-core"
import "@tensorflow/tfjs-backend-webgl"
import "@mediapipe/face_mesh"
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection"

export const createDetector = async () => {
  return await faceLandmarksDetection.createDetector(
    faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
    {
      runtime: "tfjs",
      refineLandmarks: false,
    }
  )
}
