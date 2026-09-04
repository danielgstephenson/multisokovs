import { G, Rect } from '@svgdotjs/svg.js'
import type { GUI } from './gui.js'
import { range } from '../shared/math.js'
import {
  borderColor,
  endInterval,
  getPosition,
  goalColor,
  goals,
  gridSize,
  highlightColor,
  maxRound,
  teamColors,
  tieColor,
} from '../shared/parameters.js'
import { stateToLocs } from '../shared/state.js'
import type { Client } from './client.js'

export class Grid {
  gui: GUI
  client: Client
  group: G
  tiles: Rect[][] = []
  highlights: Rect[][] = []
  goalRects: Rect[] = []
  goalGroups: G[] = []
  outRect: Rect

  constructor(gui: GUI) {
    this.gui = gui
    this.client = gui.client
    this.group = gui.world.group()
    this.addTiles()
    this.outRect = this.makeOutRect()
    this.addGoals()
  }

  update(): void {
    this.updateHighlights()
    this.updateOutRect()
    this.updateGoals()
  }

  updateOutRect(): void {
    if (this.client.phase !== 'end') {
      this.outRect.stroke({ color: borderColor })
      this.outRect.attr('stroke-dasharray', '')
      return
    }
    let mapColor = tieColor
    if (this.client.winner === 0) mapColor = teamColors[0]
    if (this.client.winner === 1) mapColor = teamColors[1]
    this.outRect.stroke({ color: mapColor })
    const sideLength = this.outRect.bbox().width
    const perimeter = 4 * sideLength
    const a = (perimeter * this.client.countdown) / endInterval
    const b = perimeter - a
    this.outRect.attr('stroke-dasharray', `${a} ${b}`)
  }

  updateHighlights(): void {
    this.clearHighlights()
    const unitLocs = stateToLocs(this.client.state)
    const activeTeam = this.client.round % 2
    if (this.client.phase !== 'choice') return
    const loc = unitLocs[0]
    const position = getPosition(loc, this.client.angle)
    const highlight = this.highlights[position.x][position.y]
    highlight.front()
    const alpha = activeTeam === this.client.team ? 0.7 : 0.3
    highlight.opacity(alpha)
  }

  clearHighlights(): void {
    this.highlights.flat().forEach(highlight => {
      highlight.opacity(0)
    })
  }

  updateGoals(): void {
    goals.forEach((loc, i) => {
      const position = getPosition(loc, this.client.angle)
      this.goalGroups[i].transform({
        translateX: position.x,
        translateY: position.y,
      })
    })
    if (this.client.phase === 'end') return
    this.goalRects.forEach(goalRect => {
      const sideLength = goalRect.bbox().width
      const perimeter = 4 * sideLength
      const b = (perimeter * this.client.round) / maxRound
      const a = perimeter - b
      goalRect.attr('stroke-dasharray', `${a} ${b}`)
    })
  }

  addTiles(): void {
    range(gridSize).forEach(x => {
      this.tiles[x] = []
      this.highlights[x] = []
      range(gridSize).forEach(y => {
        const highlight = this.group.rect(1, 1).center(x, y)
        highlight.stroke({
          color: highlightColor,
          width: 0.07,
          linecap: 'square',
        })
        highlight.fill('none')
        highlight.opacity(0)
        this.highlights[x][y] = highlight
        const tile = this.group.rect(1, 1).center(x, y)
        tile.stroke({ color: borderColor, width: 0.05 })
        tile.fill('none')
        this.tiles[x][y] = tile
      })
    })
  }

  makeOutRect(): Rect {
    const gap = 0.25
    const width = gridSize + gap
    const height = gridSize + gap
    const center = 0.5 * (gridSize - 1)
    const outRect = this.gui.world.rect(width, height)
    outRect.fill({ opacity: 0 })
    outRect.stroke({
      color: borderColor,
      width: 0.05,
      linecap: 'square',
    })
    outRect.center(center, center)
    return outRect
  }

  addGoals(): void {
    this.goalGroups = []
    goals.forEach(loc => {
      const position = getPosition(loc, this.client.angle)
      const goalGroup = this.gui.world.group().transform({
        translateX: position.x,
        translateY: position.y,
      })
      this.goalGroups.push(goalGroup)
      const rect = goalGroup.rect(0.9, 0.9).center(0, 0)
      rect.fill({
        color: goalColor,
        opacity: 0.2,
      })
      rect.stroke({
        color: goalColor,
        width: 0.05,
        opacity: 1,
      })
      this.goalRects.push(rect)
    })
  }
}
