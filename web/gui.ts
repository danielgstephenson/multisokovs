import { SVG } from '@svgdotjs/svg.js'
import type { Client } from './client.js'

export class GUI {
  client: Client
  svgDiv = document.getElementById('svgDiv') as HTMLDivElement
  svg = SVG().addTo('#svgDiv')
  angle = 0
  padding = 1.25

  constructor(client: Client) {
    this.client = client
    this.onResize()
    window.addEventListener('resize', () => this.onResize())
  }

  onResize(): void {
    const vmin = Math.min(window.innerWidth, window.innerHeight)
    const scale = 1
    this.svg.size(scale * vmin, scale * vmin)
  }
}
