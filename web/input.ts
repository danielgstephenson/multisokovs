import type { Vec2 } from '../shared/math.js'
import type { Client } from './client.js'

export class Input {
  client: Client
  pointerId = -1
  start: Vec2 = { x: 0, y: 0 }

  constructor(client: Client) {
    this.client = client
    window.onkeydown = (event: KeyboardEvent) => this.onkeydown(event)
    window.onpointerdown = (event: PointerEvent) => this.onpointerdown(event)
    window.onpointerup = (event: PointerEvent) => this.onpointerup(event)
    window.onpointercancel = (event: PointerEvent) => this.onpointercancel(event)
    window.oncontextmenu = () => false
  }

  onkeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp' || event.key === 'w') {
      this.client.act(1)
    } else if (event.key === 'ArrowDown' || event.key === 's') {
      this.client.act(3)
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
      this.client.act(2)
      this.client.selectTeam(0)
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
      this.client.act(0)
      this.client.selectTeam(1)
    }
  }

  onpointerdown(event: PointerEvent): void {
    if (!event.isPrimary) return
    if (event.pointerType === 'mouse') {
      if (event.button !== 0) return
      const focus = this.client.gui.focus
      this.act(event.clientX - focus.x, focus.y - event.clientY)
      return
    }
    this.pointerId = event.pointerId
    this.start.x = event.clientX
    this.start.y = event.clientY
  }

  onpointerup(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return
    this.pointerId = -1
    const x = event.clientX - this.start.x
    const y = this.start.y - event.clientY
    const vmin = Math.min(window.innerWidth, window.innerHeight)
    if (Math.hypot(x, y) < 0.05 * vmin) return
    this.act(x, y)
  }

  onpointercancel(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return
    this.pointerId = -1
  }

  act(x: number, y: number): void {
    let dir: number
    if (Math.abs(x) > Math.abs(y)) {
      dir = x > 0 ? 0 : 2
    } else {
      dir = y > 0 ? 1 : 3
    }
    this.client.act(dir)
  }
}
