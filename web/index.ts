import { Client } from './client.js'
import * as opentype from 'opentype.js'

const response = await fetch('/Lekton-Bold.ttf')
const buffer = await response.arrayBuffer()
const font = opentype.parse(buffer)

const match = /^\/game\/([^/]+)/.exec(location.pathname)
const gameId = match?.[1] ?? ''

void new Client(font, gameId)
