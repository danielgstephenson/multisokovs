import type { Socket } from 'socket.io'
import type { Game } from './game.js'
import type { PlayerSummary } from '../shared/summary.js'

export class Player {
  game: Game
  socket: Socket
  team = -1

  constructor(game: Game, socket: Socket) {
    this.game = game
    this.socket = socket
    this.game.players.push(this)
  }

  summarize(): PlayerSummary {
    const gameSummary = this.game.summarize()
    const playerSummary = {
      ...gameSummary,
      team: this.team,
    }
    return playerSummary
  }
}
