import express from 'express'
import { type Express } from 'express'
import { makeServer } from './server.js'
import { type IOServer } from './server.js'
import { once } from 'node:events'
import type { Game } from './game.js'

export class Messenger {
  token = `${Math.random()}`
  game: Game
  app: Express
  io: IOServer

  constructor(game: Game) {
    this.game = game
    this.app = express()
    this.io = makeServer(this.app)
    this.setupIo()
  }

  setupIo(): void {
    this.io.on('connection', socket => {
      console.log(socket.id, 'connected')
      socket.emit('summary', this.game.summarize())
    })
  }

  async listen(port: number): Promise<void> {
    const server = this.io.httpServer
    server.listen(port, () => console.log(`listening on http://localhost:${port}`))
    await once(server, 'listening')
  }
}
