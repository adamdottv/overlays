import OBSWebSocket from "obs-websocket-js"
import { delay } from "./utils"
import WsController from "./ws"
import { CustomServer } from "./server"
import StreamController, { Guest } from "./stream"

export type Scene =
  | "Init"
  | "Intro"
  | "Camera"
  | "Camera (w/ Guest)"
  | "Screen"
  | "Screen (w/ Guest)"
  | "Behind Screen"
  | "Break"
  | "Outro"

export type Source =
  | "Shared"
  | "Overlay"
  | "Overlay (Intro)"
  | "Overlay (Break)"
  | "Overlay (Outro)"
  | "Camera (Guest)"

const scenes: Scene[] = [
  "Init",
  "Intro",
  "Camera",
  "Camera (w/ Guest)",
  "Screen",
  "Screen (w/ Guest)",
  "Behind Screen",
  "Break",
  "Outro",
]

type ZoomSource = {
  scene: Scene
  sceneItemId: number
  status?: "zoomedIn" | "zoomedOut"
}

const zoomSources: ZoomSource[] = []

export default class ObsController {
  obs = new OBSWebSocket()
  currentScene: Scene | undefined

  private server: CustomServer
  private wsController: WsController
  private streamController: StreamController
  private timerHandler?: NodeJS.Timer

  constructor(
    server: CustomServer,
    wsController: WsController,
    streamController: StreamController
  ) {
    this.server = server
    this.wsController = wsController
    this.streamController = streamController
    this.initObsWebsocket()

    this.server.on("guest-joined", this.handleGuestJoined.bind(this))
    this.server.on("guest-left", this.handleGuestLeft.bind(this))
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

    for (const scene of scenes) {
      const sources = await this.obs.call("GetSceneItemList", {
        sceneName: scene,
      })

      const zooms = sources.sceneItems.filter((i) =>
        i.sourceName?.toString().includes("(Zoomed)")
      ) as { sceneItemId: number }[]

      for (const { sceneItemId } of zooms) {
        zoomSources.push({ scene, sceneItemId })
      }
    }

    await this.refreshBrowserSource("Shared")
    await this.refreshBrowserSource("Overlay")
  }

  async endStream() {
    return this.obs.call("StopStream")
  }

  async zoomIn() {
    for (const source of zoomSources) {
      const { scene, sceneItemId, status } = source
      if (status === "zoomedIn") continue

      await this.obs.call("SetSceneItemEnabled", {
        sceneName: scene,
        sceneItemId,
        sceneItemEnabled: true,
      })

      source.status = "zoomedIn"
    }
  }

  async zoomOut() {
    for (const source of zoomSources) {
      const { scene, sceneItemId, status } = source
      if (status === "zoomedOut") continue

      await this.obs.call("SetSceneItemEnabled", {
        sceneName: scene,
        sceneItemId,
        sceneItemEnabled: false,
      })

      source.status = "zoomedOut"
    }
  }

  async refreshBrowserSource(inputName: Source) {
    return this.obs.call("PressInputPropertiesButton", {
      inputName,
      propertyName: "refreshnocache",
    })
  }

  async startTimer() {
    this.stopTimer()

    this.timerHandler = setInterval(() => {
      if (this.currentScene === "Screen") {
        this.setScene("Behind Screen")
        setTimeout(() => {
          if (this.currentScene === "Behind Screen") {
            this.setScene("Screen")
          }
        }, 1000 * 15) // for 15 seconds
      }
    }, 1000 * 60 * 6) // every 6 minutes
  }

  async stopTimer() {
    if (this.timerHandler) clearInterval(this.timerHandler)
  }

  async setScene(sceneName: Scene) {
    const hasGuest = !!this.streamController.guest

    let scene = sceneName
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
    await this.stopTimer()

    await delay(800)

    switch (to) {
      case "Camera":
      case "Camera (w/ Guest)":
        await this.setScene(to)
        break

      case "Screen":
        await this.startTimer()
      case "Screen (w/ Guest)":
        await this.setScene(to)
        break

      default:
        await this.setScene(to)
    }

    await delay(1000)
    this.wsController.emit("transitioning", false)
  }
}
