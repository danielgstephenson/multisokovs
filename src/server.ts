import { createServer } from 'node:http'
import { join } from 'node:path'
import express from 'express'
import { type Express } from 'express'
import { Server, type Socket, type DefaultEventsMap } from 'socket.io'

export type IOServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, object>
export type IOSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, object>

export function makeServer(app: Express): IOServer {
  const httpServer = createServer(app)
  const io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, object>(httpServer, {
    connectionStateRecovery: {},
  })
  const publicDir = join(import.meta.dirname, '..', '..', 'public')
  app.use(express.static(publicDir))
  return io
}
