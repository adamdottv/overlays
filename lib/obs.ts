import OBSWebSocket from "obs-websocket-js"
import { toggleLight } from "../pages/api/kasa"
import { delay } from "./utils"
import WsController from "./ws"

import metadata from "../stream.json"
import EventEmitter from "events"
const guestMode = metadata.mode === "guest"

export type Scene =
  | "Init"
  | "Intro"
  | "Camera"
  | "Camera (w/ Guest)"
  | "Camera (HD)"
  | "Screen"
  | "Screen (w/ Guest)"
  | "Break"
  | "Outro"

export type Source =
  | "Shared"
  | "Overlay"
  | "Overlay (Intro)"
  | "Overlay (Break)"
  | "Overlay (Outro)"

export default class ObsController extends EventEmitter {
  obs = new OBSWebSocket()
  currentScene: Scene | undefined
  wsController: WsController

  private async initObsWebsocket() {
    await this.obs.connect({ address: "127.0.0.1:4444" })

    const response = await this.obs.send("GetCurrentScene")
    this.currentScene = response.name as Scene

    this.obs.on("SwitchScenes", (data) => {
      this.currentScene = data["scene-name"] as Scene
      this.emit("sceneChange", this.currentScene)
    })

    await this.refreshBrowserSource("Shared")
    await this.refreshBrowserSource("Overlay")
  }

  constructor(wsController: WsController) {
    super()

    this.wsController = wsController
    this.initObsWebsocket()
  }

  async endStream() {
    return this.obs.send("StopStreaming")
  }

  async refreshBrowserSource(sourceName: Source) {
    return this.obs.send("RefreshBrowserSource", { sourceName })
  }

  async setScene(scene: Scene) {
    this.currentScene = scene
    this.emit("sceneChange", scene)

    return this.obs.send("SetCurrentScene", {
      "scene-name": scene,
    })
  }

  async switchScene(to: Scene) {
    console.log(`Switching to ${to}`)
    if (to === "Camera" && guestMode) {
      this.transition("Camera (w/ Guest)")
    } else if (to === "Screen" && guestMode) {
      this.transition("Screen (w/ Guest)")
    } else if (to === "Camera") {
      this.transition("Camera (HD)")
    } else {
      this.transition(to)
    }
  }

  private async transition(to: Scene) {
    this.wsController.emit("transitioning", true)

    await delay(800)

    const camera1 = "BA868701-8131-49CB-8EDD-8C7E6E7CD60B"
    const camera2 = "14029354-EC7B-4409-B4BC-708E88D9D782"
    const url = (layer: string, action: string) =>
      `http://adams-mac-mini.local:8989/api/v1/documents/691811177/layers/${layer}/${action}`

    switch (to) {
      case "Camera":
      case "Camera (HD)":
      case "Camera (w/ Guest)":
        await Promise.all([
          // toggleLight(false),
          fetch(url(camera1, "setLive")),
          fetch(url(camera2, "setOff")),
          this.setScene(to),
        ])
        break

      case "Screen":
      case "Screen (w/ Guest)":
        await Promise.all([
          // toggleLight(true),
          this.setScene(to),
          fetch(url(camera2, "setLive")),
          fetch(url(camera1, "setOff")),
        ])
        break

      default:
        await this.setScene(to)
    }

    await delay(1000)
    this.wsController.emit("transitioning", false)
  }
}
