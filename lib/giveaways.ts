import WsController from "./ws"
import fs from "fs"
import { randomItem } from "./utils"

const pathToJsonFile = "./giveaway.json"

export default class GiveawaysController {
  entrants: string[]

  private ws: WsController

  constructor(ws: WsController) {
    this.ws = ws

    try {
      this.entrants = JSON.parse(
        fs.readFileSync(pathToJsonFile, { encoding: "utf-8" })
      )
    } catch (error) {
      this.entrants = []
    }
  }

  handleNewEntry(entrant: string) {
    this.entrants.push(entrant)

    try {
      fs.writeFileSync(pathToJsonFile, JSON.stringify(this.entrants))
    } catch (error) {}
  }

  selectWinner() {
    const winner = randomItem(this.entrants)
    this.ws.emit("giveaway-winner-selected", { winner })
  }
}
