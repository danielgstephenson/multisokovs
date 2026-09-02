import { G, SVG } from '@svgdotjs/svg.js'
import type { Client } from './client.js'
import { gridSize } from '../shared/parameters.js'
import { Grid } from './grid.js'

export class GUI {
  client: Client
  svgDiv = document.getElementById('svgDiv') as HTMLDivElement
  svg = SVG().addTo('#svgDiv')
  padding = 1.25
  world: G
  grid: Grid

  constructor(client: Client) {
    this.client = client
    this.onResize()
    window.addEventListener('resize', () => this.onResize())
    this.world = this.makeWorld()
    this.grid = new Grid(this)
  }

  update(): void {
    this.grid.update()
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
}
