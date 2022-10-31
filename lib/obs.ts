import OBSWebSocket from "obs-websocket-js"
import { delay } from "./utils"
import WsController from "./ws"
import { CustomServer } from "./server"
import SnapController from "./snap"
import StreamController, { Guest } from "./stream"

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
  | "Camera (Guest)"

export default class ObsController {
  obs = new OBSWebSocket()
  currentScene: Scene | undefined

  private server: CustomServer
  private wsController: WsController
  private snapController: SnapController
  private streamController: StreamController

  constructor(
    server: CustomServer,
    wsController: WsController,
    snapController: SnapController,
    streamController: StreamController
  ) {
    this.server = server
    this.wsController = wsController
    this.snapController = snapController
    this.streamController = streamController
    this.initObsWebsocket()

    this.server.on("guest-joined", this.handleGuestJoined.bind(this))
    this.server.on("guest-left", this.handleGuestLeft.bind(this))
    this.server.on("snap-filter-set", this.handleSnapFilterSet.bind(this))
    this.server.on(
      "snap-filter-cleared",
      this.handleSnapFilterCleared.bind(this)
    )
  }

  private async handleSnapFilterSet(_filter: string) {
    if (this.currentScene === "Camera (HD)") {
      this.setScene("Camera")
    }
  }

  private async handleSnapFilterCleared() {
    if (this.currentScene === "Camera") {
      this.setScene("Camera (HD)")
    }
  }

  private async handleGuestJoined(_guest: Guest) {
    await this.refreshBrowserSource("Camera (Guest)")

    if (this.currentScene?.startsWith("Camera")) {
      this.setScene("Camera (w/ Guest)")
    } else if (this.currentScene?.startsWith("Screen")) {
      this.setScene("Screen (w/ Guest)")
    }
  }

  private async handleGuestLeft(_guest: Guest) {
    await this.refreshBrowserSource("Camera (Guest)")

    if (this.currentScene?.startsWith("Camera")) {
      this.setScene("Camera")
    } else if (this.currentScene?.startsWith("Screen")) {
      this.setScene("Screen")
    }
  }

  private async initObsWebsocket() {
    await this.obs.connect("ws://localhost:4455")

    const response = await this.obs.call("GetCurrentProgramScene")
    this.currentScene = response.currentProgramSceneName as Scene

    this.obs.on("CurrentProgramSceneChanged", (data) => {
      this.currentScene = data.sceneName as Scene
      this.server.emit("sceneChange", this.currentScene)
    })

    await this.refreshBrowserSource("Shared")
    await this.refreshBrowserSource("Overlay")
  }

  async endStream() {
    return this.obs.call("StopStream")
  }

  async refreshBrowserSource(inputName: Source) {
    return this.obs.call("PressInputPropertiesButton", {
      inputName,
      propertyName: "refreshnocache",
    })
  }

  async setScene(sceneName: Scene) {
    const hasGuest = !!this.streamController.guest

    let scene = sceneName
    if (scene === "Camera" && !this.snapController.currentFilter) {
      scene = "Camera (HD)"
    } else if (scene === "Camera (HD)" && this.snapController.currentFilter) {
      scene = "Camera"
    }

    if (scene.startsWith("Camera") && hasGuest) {
      scene = "Camera (w/ Guest)"
    } else if (scene.startsWith("Screen") && hasGuest) {
      scene = "Screen (w/ Guest)"
    }

    this.currentScene = scene
    this.server.emit("sceneChange", scene)

    return this.obs.call("SetCurrentProgramScene", {
      sceneName: scene,
    })
  }

  async transition(to: Scene) {
    this.wsController.emit("transitioning", true)

    await delay(800)

    const camera1 = "BA868701-8131-49CB-8EDD-8C7E6E7CD60B"
    const camera2 = "14029354-EC7B-4409-B4BC-708E88D9D782"
    const url = (layer: string, action: string) =>
      `http://adams-mac-studio.local:8989/api/v1/documents/691811177/layers/${layer}/${action}`

    switch (to) {
      case "Camera":
      case "Camera (HD)":
      case "Camera (w/ Guest)":
        await Promise.all([
          fetch(url(camera1, "setLive")),
          fetch(url(camera2, "setOff")),
          this.setScene(to),
        ])
        break

      case "Screen":
      case "Screen (w/ Guest)":
        await Promise.all([
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
