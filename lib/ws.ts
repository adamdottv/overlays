import { CustomServer } from "./server"
import { Server as ServerIO } from "socket.io"

export default class WsController {
  socketServer: ServerIO

  constructor(server: CustomServer) {
    this.socketServer = new ServerIO(server)
  }

  emit(event: string, payload: unknown) {
    console.log(`emitting ${event} with payload ${JSON.stringify(payload)}`)
    return this.socketServer.emit(event, payload)
  }
}
