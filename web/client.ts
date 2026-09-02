import type { GameSummary } from '../shared/summary.js'
import { GUI } from './gui.js'
import { io } from 'socket.io-client'
import * as opentype from 'opentype.js'
import { tickInterval, timeScale } from '../shared/parameters.js'

export class Client {
  socket = io()
  token = ''
  time = 0
  team = 0
  angle = 0
  state = 0
  round = 0
  winner = -1
  countdown = 0
  phase = 'choice'
  font: opentype.Font
  gui: GUI

  constructor(font: opentype.Font) {
    this.font = font
    this.gui = new GUI(this)
    this.socket.on('connect', () => {
      console.log('connected', this.socket.id)
    })
    this.socket.on('team', (team: number) => {
      this.team = team
    })
    this.socket.on('summary', (summary: GameSummary) => {
      this.readSummary(summary)
      this.gui.update()
    })
    this.socket.on('setup', (summary: GameSummary) => {
      this.readSummary(summary)
      this.gui.setup()
    })
    this.socket.on('token', (token: string) => this.checkToken(token))
    setInterval(() => this.update(), (tickInterval / timeScale) * 1000)
  }

  readSummary(summary: GameSummary) {
    this.state = summary.state
    this.round = summary.round
    this.winner = summary.winner
    this.countdown = summary.countdown
    this.phase = summary.phase
    this.angle = summary.angle
  }

  update(): void {
    this.time += tickInterval
  }

  checkToken(token: string): void {
    if (this.token === '') {
      this.token = token
      return
    }
    if (token !== this.token) {
      location.reload()
    }
  }
}
