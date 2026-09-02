import { Client } from './client.js'
import * as opentype from 'opentype.js'

const response = await fetch('/Lekton-Bold.ttf')
const buffer = await response.arrayBuffer()
const font = opentype.parse(buffer)

void new Client(font)
