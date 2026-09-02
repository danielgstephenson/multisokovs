import { GUI } from './gui.js'
import { io } from '/socket.io/socket.io.esm.min.js'

export class Client {
  socket = io()
  token = ''
  team = 0
  state = 0
  gui: GUI

  constructor() {
    this.gui = new GUI(this)
    this.socket.on('connect', () => {
      console.log('connected', this.socket.id)
    })
  }
}
