import OBSWebSocket from "obs-websocket-js"
import React from "react"
import { useEffect } from "react"
import { Scene } from "../lib/obs"

const obs = new OBSWebSocket()

export const useObs = () => {
  const [scene, setScene] = React.useState<Scene>()

  useEffect(() => {
    async function init() {
      obs.on("SwitchScenes", (data) => {
        setScene(data["scene-name"] as Scene)
      })

      // You must add this handler to avoid uncaught exceptions.
      obs.on("error", (err) => {
        console.error("socket error:", err)
      })

      try {
        await obs.connect({ address: "127.0.0.1:4444" })
        const scenes = await obs.send("GetSceneList")
        setScene(scenes["current-scene"] as Scene)
      } catch (error) {
        console.log(error)
      }
    }

    init()

    return () => {
      obs.disconnect()
    }
  }, [])

  return {
    scene,
    obs,
  }
}
