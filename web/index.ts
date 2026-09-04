import { Client } from './client.js'
import * as opentype from 'opentype.js'

const response = await fetch('/Lekton-Bold.ttf')
const buffer = await response.arrayBuffer()
const font = opentype.parse(buffer)
const gameId = location.pathname.split('/')[1] ?? ''

void new Client(font, gameId)
