import express from 'express'
import { type Express } from 'express'
import { Server as HttpsServer } from 'node:https'
import { makeServer } from './server.js'
import { type IOServer } from './server.js'
import { once } from 'node:events'
import { Game } from './game.js'
import { Player } from './player.js'

export class Messenger {
  token = `${Math.random()}`
  games = new Map<string, Game>()
  app: Express
  io: IOServer

  constructor() {
    this.app = express()
    this.io = makeServer(this.app)
    this.setupIo()
    const secure = this.io.httpServer instanceof HttpsServer
    const port = secure ? 443 : 3000
    void this.listen(port)
    setInterval(() => this.update(), 100)
  }

  setupIo(): void {
    this.io.on('connection', socket => {
      const rawGameId: unknown = socket.handshake.auth.gameId
      const gameId = typeof rawGameId === 'string' ? rawGameId : ''
      let game = this.games.get(gameId)
      if (game == null) {
        game = new Game(this, gameId)
        this.games.set(gameId, game)
      }
      const player = new Player(game, socket)
      console.log(socket.id, 'connected')
      void socket.join(gameId)
      socket.emit('token', this.token)
      socket.emit('setup', player.summarize())
      socket.on('selectTeam', (team: number) => {
        if (game.phase !== 'team') return
        if (game.takenTeams.includes(team)) return
        player.team = team
      })
      socket.on('act', (dir: number) => {
        if (game.phase !== 'choice') return
        const activeTeam = game.round % 2
        if (player.team !== activeTeam) return
        game.advance(dir)
      })
    })
  }

  update(): void {
    this.games.forEach(game => {
      game.players = game.players.filter(p => p.socket.connected)
      const teams = new Set([0, 1])
      const playerTeams = new Set(game.players.map(p => p.team))
      const takenTeams = teams.intersection(playerTeams)
      game.takenTeams = [...takenTeams]
      if (game.takenTeams.length < 2 && game.phase !== 'team') {
        game.reset()
      }
      game.players.forEach(player => {
        player.socket.emit('summary', player.summarize())
      })
      if (game.players.length === 0) {
        game.stop()
      }
    })
  }

  async listen(port: number): Promise<void> {
    const server = this.io.httpServer
    const secure = server instanceof HttpsServer
    const location = secure ? `port ${port}` : `http://localhost:${port}`
    server.listen(port, () => console.log(`listening on ${location}`))
    await once(server, 'listening')
  }
}
