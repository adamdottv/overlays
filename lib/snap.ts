import { spawnSync } from "child_process"
import { CustomServer } from "./server"
const timeout = 5 * 60 * 1000

export default class SnapController {
  currentFilter: string | undefined
  timeoutHandle: NodeJS.Timeout | undefined

  private server: CustomServer
  private lastKey: string | undefined

  constructor(server: CustomServer) {
    this.server = server
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
      this.server.emit("snap-filter-cleared")
      return true
    }

    try {
      spawnSync("bash", ["./scripts/toggle-snap-filter.sh", this.currentFilter])
      this.lastKey = this.currentFilter
      this.server.emit("snap-filter-set")
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
