import express from 'express'
import { type Express } from 'express'
import { makeServer } from './server.js'
import { type IOServer } from './server.js'
import { once } from 'node:events'
import { Game } from './game.js'

export class Messenger {
  token = `${Math.random()}`
  games = new Map<string, Game>()
  app: Express
  io: IOServer

  constructor() {
    this.app = express()
    this.io = makeServer(this.app)
    this.setupIo()
    void this.listen(3000)
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
      console.log(socket.id, 'connected')
      void socket.join(gameId)
      socket.emit('token', this.token)
      socket.emit('setup', game.summarize())
    })
  }

  async listen(port: number): Promise<void> {
    const server = this.io.httpServer
    server.listen(port, () => console.log(`listening on http://localhost:${port}`))
    await once(server, 'listening')
  }
}
