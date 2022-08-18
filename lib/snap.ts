import { spawnSync } from "child_process"
import { randomUUID } from "crypto"
import ObsController, { Scene } from "./obs"
const timeout = 5 * 60 * 1000

export default class SnapController {
  id = randomUUID()
  currentFilter: string | undefined
  lastKey: string | undefined
  timeoutHandle: NodeJS.Timeout | undefined

  private obs: ObsController

  constructor(obs: ObsController) {
    this.obs = obs
    this.obs.on("sceneChange", (scene) => this.handleSceneChange(scene))
  }

  private async handleSceneChange(scene: Scene) {
    console.log(
      `Scene changed to ${scene}, current filter is ${this.currentFilter} (${this.id})`
    )

    if (scene === "Camera" && !this.currentFilter) {
      await this.obs.setScene("Camera (HD)")
    } else if (scene === "Camera (HD)" && this.currentFilter) {
      await this.obs.setScene("Camera")
    }
  }

  async toggleSnapFilter(key: string | undefined) {
    if (this.timeoutHandle) clearTimeout(this.timeoutHandle)

    // Empty reward means we should toggle the last filter off
    if (this.lastKey) {
      spawnSync("bash", ["./scripts/toggle-snap-filter.sh", this.lastKey])
      this.lastKey = undefined
    }

    this.currentFilter = key

    if (!this.currentFilter) {
      if (this.obs.currentScene === "Camera") {
        await this.obs.setScene("Camera (HD)")
      }
      return true
    }

    try {
      spawnSync("bash", ["./scripts/toggle-snap-filter.sh", this.currentFilter])
      this.lastKey = this.currentFilter

      if (this.obs.currentScene === "Camera (HD)") {
        await this.obs.setScene("Camera")
      }
    } catch (error) {
      console.error(error)
      return false
    }

    this.timeoutHandle = setTimeout(() => {
      this.toggleSnapFilter(undefined)
    }, timeout)

    return true
  }
}
