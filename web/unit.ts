import type { G, Rect } from '@svgdotjs/svg.js'
import { stateToLocs } from '../shared/state.js'
import type { GUI } from './gui.js'
import { range, sample } from '../shared/math.js'
import { getPosition, moveInterval, teamColors, unitCount } from '../shared/parameters.js'
import type { Client } from './client.js'

export class Unit {
  gui: GUI
  client: Client
  rank: number
  team: number
  dir: number
  group: G
  pointer: Rect
  body: G
  moving = false

  constructor(gui: GUI, rank: number) {
    this.gui = gui
    this.client = this.gui.client
    this.rank = rank
    this.gui.units[this.rank] = this
    this.team = this.rank % 2
    this.dir = sample(range(4))
    const loc = stateToLocs(this.client.state)[this.rank]
    const position = getPosition(loc, this.client.angle)
    this.group = this.gui.world.group().transform({
      translateX: position.x,
      translateY: position.y,
    })
    this.body = this.group.group().transform({
      translateX: 0,
      translateY: 0,
      rotate: 90 * this.dir,
    })
    const color = teamColors[this.team]
    const circle = this.body.circle(0.9).center(0, 0).fill(color)
    const square = this.body.rect(1, 1).center(0, 0).fill('white')
    const pointerMask = this.body.mask().add(square)
    this.pointer = this.body.rect(0.2, 0.15).center(0.4, 0).fill('black')
    if (this.rank > 0) this.pointer.opacity(0)
    pointerMask.add(this.pointer)
    circle.maskWith(pointerMask)
    const text = (rank + 1).toFixed(0)
    const path = this.client.font.getPath(text, 0, 0, 0.7)
    const box = path.getBoundingBox()
    const label = this.group.path(path.toPathData(4)).flip('y')
    label.center(0, box.y1 - box.y2)
  }

  move(): void {
    this.moving = true
    const offset = (this.client.round + 1) % unitCount
    const index = (unitCount - offset + this.rank) % unitCount
    const loc = stateToLocs(this.client.state)[index]
    const position = getPosition(loc, this.client.angle)
    this.group
      .animate(800 * moveInterval)
      .transform({
        translateX: position.x,
        translateY: position.y,
      })
      .after(_ => {
        this.moving = false
      })
  }

  setup(): void {
    this.moving = true
    const offset = this.client.round % unitCount
    const index = (unitCount - offset + this.rank) % unitCount
    const loc = stateToLocs(this.client.state)[index]
    const position = getPosition(loc, this.client.angle)
    this.group.transform({
      translateX: position.x,
      translateY: position.y,
    })
  }

  update(): void {
    this.body.transform({
      translateX: 0,
      translateY: 0,
      rotate: 90 * (this.dir + this.client.angle),
    })
    this.pointer.opacity(0)
  }
}
