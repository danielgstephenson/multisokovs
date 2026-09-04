import type { PlayerSummary } from '../shared/summary.js'
import { GUI } from './gui.js'
import { io, type Socket } from 'socket.io-client'
import * as opentype from 'opentype.js'
import { endInterval, tickInterval, timeScale } from '../shared/parameters.js'
import { Input } from './input.js'

export class Client {
  gameId: string
  socket: Socket
  token = ''
  lastTime = performance.now()
  time = 0
  team = -1
  takenTeams: number[] = []
  angle = 0
  state = 0
  round = 0
  winner = -1
  countdown = 0
  phase = 'team'
  font: opentype.Font
  gui: GUI
  input: Input

  constructor(font: opentype.Font, gameId: string) {
    this.font = font
    this.gameId = gameId
    this.socket = io({ auth: { gameId } })
    this.gui = new GUI(this)
    this.input = new Input(this)
    this.socket.on('connect', () => {
      console.log('connected', this.socket.id)
    })
    this.socket.on('token', (token: string) => this.checkToken(token))
    this.socket.on('summary', (summary: PlayerSummary) => {
      this.readSummary(summary)
      this.gui.update()
    })
    this.socket.on('setup', (summary: PlayerSummary) => {
      this.readSummary(summary)
      this.gui.setup()
    })
    this.socket.on('move', (summary: PlayerSummary) => {
      this.readSummary(summary)
      this.gui.units.forEach(unit => unit.move())
    })
    this.socket.on('matchComplete', (summary: PlayerSummary) => {
      this.readSummary(summary)
      this.countdown = endInterval
    })
    setInterval(() => this.update(), (tickInterval / timeScale) * 1000)
  }

  readSummary(summary: PlayerSummary) {
    this.state = summary.state
    this.round = summary.round
    this.winner = summary.winner
    this.phase = summary.phase
    this.angle = summary.angle
    this.team = summary.team
    this.takenTeams = summary.takenTeams
  }

  update(): void {
    const now = performance.now()
    const dt = (now - this.lastTime) / 1000
    this.lastTime = now
    this.countdown = Math.max(0, this.countdown - dt)
    this.time += dt
    this.gui.update()
  }

  act(dir: number) {
    if (this.phase !== 'choice') return
    const activeTeam = this.round % 2
    if (activeTeam !== this.team) return
    this.socket.emit('act', dir)
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
