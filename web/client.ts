import type { PlayerSummary } from '../shared/summary.js'
import { GUI } from './gui.js'
import { io, Socket } from 'socket.io-client'
import * as opentype from 'opentype.js'
import { tickInterval, timeScale } from '../shared/parameters.js'

export class Client {
  gameId: string
  socket: Socket
  token = ''
  time = 0
  team = -1
  takenTeams: number[] = []
  angle = 0
  state = 0
  round = 0
  winner = -1
  countdown = 0
  phase = 'choice'
  font: opentype.Font
  gui: GUI

  constructor(font: opentype.Font, gameId: string) {
    this.font = font
    this.gameId = gameId
    this.socket = io({ auth: { gameId } })
    this.gui = new GUI(this)
    this.socket.on('connect', () => {
      console.log('connected', this.socket.id)
    })
    this.socket.on('team', (team: number) => {
      this.team = team
    })
    this.socket.on('summary', (summary: PlayerSummary) => {
      this.readSummary(summary)
      this.gui.update()
    })
    this.socket.on('setup', (summary: PlayerSummary) => {
      this.readSummary(summary)
      this.gui.setup()
    })
    this.socket.on('token', (token: string) => this.checkToken(token))
    setInterval(() => this.update(), (tickInterval / timeScale) * 1000)
  }

  readSummary(summary: PlayerSummary) {
    this.state = summary.state
    this.round = summary.round
    this.winner = summary.winner
    this.countdown = summary.countdown
    this.phase = summary.phase
    this.angle = summary.angle
    this.team = summary.team
    this.takenTeams = summary.takenTeams
  }

  update(): void {
    this.time += tickInterval
    this.gui.update()
  }

  selectTeam(team: number) {
    if (this.phase !== 'team') return
    if (this.takenTeams.includes(team)) return
    this.socket.emit('selectTeam', team)
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
