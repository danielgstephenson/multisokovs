import { G, SVG } from '@svgdotjs/svg.js'
import type { Client } from './client.js'
import { gridSize, unitCount } from '../shared/parameters.js'
import { Grid } from './grid.js'
import { Header } from './header.js'
import { Unit } from './unit.js'
import { range, type Vec2 } from '../shared/math.js'

export class GUI {
  client: Client
  svgDiv = document.getElementById('svgDiv') as HTMLDivElement
  svg = SVG().addTo('#svgDiv')
  padding = 1.25
  focus: Vec2 = { x: 0, y: 0 }
  world: G
  grid: Grid
  header: Header
  units: Unit[] = []

  constructor(client: Client) {
    this.client = client
    this.onResize()
    window.addEventListener('resize', () => this.onResize())
    this.world = this.makeWorld()
    this.world.opacity(0)
    this.grid = new Grid(this)
    this.header = new Header(this)
    range(unitCount).forEach(rank => new Unit(this, rank))
    this.updateFocus()
  }

  update(): void {
    this.grid.update()
    this.header.update()
    this.units.forEach(unit => unit.update())
    this.updateFocus()
  }

  setup(): void {
    this.grid.update()
    this.header.update()
    this.units.forEach(unit => unit.setup())
    this.updateFocus()
    this.world.opacity(1)
  }

  makeWorld(): G {
    const x = -0.5 - this.padding
    const y = -0.5 - this.padding
    const width = gridSize + 2 * this.padding
    const height = gridSize + 2 * this.padding
    this.svg.viewbox(x, y, width, height)
    const world = this.svg.group().transform({
      flip: 'y',
      origin: [0, 0.5 * (gridSize - 1)],
    })
    return world
  }

  onResize(): void {
    const vmin = Math.min(window.innerWidth, window.innerHeight)
    const scale = 1
    this.svg.size(scale * vmin, scale * vmin)
  }

  updateFocus(): void {
    const rank = this.client.round % unitCount
    const svgPoint = this.svg.node.createSVGPoint()
    svgPoint.x = 0
    svgPoint.y = 0
    const unitGroup = this.units[rank].group
    const unitElement = unitGroup.node
    const transform = unitElement.getScreenCTM()
    if (transform == null) return
    const screenPoint = svgPoint.matrixTransform(transform)
    this.focus.x = screenPoint.x
    this.focus.y = screenPoint.y
  }
}
