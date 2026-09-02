import type { GameSummary } from '../shared/summary.js'
import { GUI } from './gui.js'
import { io } from 'socket.io-client'

export class Client {
  socket = io()
  token = ''
  team = 0
  angle = 0
  state = 0
  round = 0
  winner = -1
  countdown = 0
  phase = 'choice'
  gui: GUI

  constructor() {
    this.gui = new GUI(this)
    this.socket.on('connect', () => {
      console.log('connected', this.socket.id)
    })
    this.socket.on('team', (team: number) => {
      this.team = team
    })
    this.socket.on('summary', (summary: GameSummary) => {
      this.state = summary.state
      this.round = summary.round
      this.winner = summary.winner
      this.countdown = summary.countdown
      this.phase = summary.phase
      this.angle = summary.angle
      this.gui.update()
    })
  }
}
