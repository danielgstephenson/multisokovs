import { createServer as createHttp } from 'node:http'
import { createServer as createHttps } from 'node:https'
import { join } from 'node:path'
import express from 'express'
import { type Express } from 'express'
import { Server, type Socket, type DefaultEventsMap } from 'socket.io'
import { existsSync, readFileSync } from 'node:fs'

export type IOServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, object>
export type IOSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, object>

export function makeServer(app: Express): IOServer {
  const credentials = getCredentials()
  const webServer = credentials == null ? createHttp(app) : createHttps(credentials, app)
  const io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, object>(webServer, {
    connectionStateRecovery: {},
  })
  const publicDir = join(import.meta.dirname, '..', '..', 'public')
  app.get('/', (_req, res) => {
    const id = Math.random().toString(36).slice(2, 8)
    res.redirect(`/game/${id}`)
  })
  app.use(express.static(publicDir, { index: false }))
  app.get('/game/:id', (_req, res) => {
    res.sendFile(join(publicDir, 'index.html'))
  })
  return io
}

interface Credentials {
  key: Buffer
  cert: Buffer
}

function getCredentials(): Credentials | null {
  const keyPath = join(import.meta.dirname, '..', '..', 'sis-key.pem')
  const certPath = join(import.meta.dirname, '..', '..', 'sis-cert.pem')
  const exists = existsSync(keyPath) && existsSync(certPath)
  if (!exists) return null
  const key = readFileSync(keyPath)
  const cert = readFileSync(certPath)
  return { key, cert }
}
