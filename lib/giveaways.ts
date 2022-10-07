import WsController from "./ws"
import fs from "fs"
import { randomItem } from "./utils"
import TwitchController from "./twitch"

const pathToJsonFile = "./data/giveaways/current.json"
const giveawayRewardId = "3f1bbe3d-9188-4150-938d-07b8d0bf8f85"

export default class GiveawaysController {
  entrants: string[]

  private ws: WsController
  private twitch: TwitchController

  constructor(ws: WsController, twitch: TwitchController) {
    this.ws = ws
    this.twitch = twitch

    this.twitch.on("new-giveaway-entry", this.handleNewEntry.bind(this))

    try {
      this.entrants = JSON.parse(
        fs.readFileSync(pathToJsonFile, { encoding: "utf-8" })
      )
    } catch (error) {
      this.entrants = []
    }
  }

  async start() {
    this.entrants = []

    await this.twitch.enableReward(giveawayRewardId)
    await this.twitch.chatClient?.announce(
      this.twitch.username,
      "Let the giveaway begin! Redeem your channel points now!"
    )
  }

  handleNewEntry(entrant: string) {
    this.entrants.push(entrant)

    try {
      fs.writeFileSync(pathToJsonFile, JSON.stringify(this.entrants))
    } catch (error) {}
  }

  async end() {
    await this.twitch.disableReward(giveawayRewardId)

    const winner = randomItem(this.entrants)

    await this.twitch.chatClient?.announce(
      this.twitch.username,
      `AND THE WINNER IS: @${winner}!`
    )
    this.ws.emit("giveaway-winner-selected", { winner })

    fs.copyFileSync(
      pathToJsonFile,
      `./data/giveaways/${new Date().toISOString()}.json`
    )
    fs.rmSync(pathToJsonFile)
  }
}
