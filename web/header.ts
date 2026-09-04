import type { Path, Rect } from '@svgdotjs/svg.js'
import type { GUI } from './gui.js'
import { labelColor, teamColors } from '../shared/parameters.js'
import type { Client } from './client.js'
import * as opentype from 'opentype.js'

export class Header {
  gui: GUI
  client: Client
  font: opentype.Font
  levelLabel: Path
  flags: Rect[] = []

  constructor(gui: GUI) {
    this.gui = gui
    this.client = gui.client
    this.font = this.client.font
    this.levelLabel = this.makeLevelLabel()
    this.updateLevelLabel()
    this.addFlags()
  }

  update(): void {
    this.updateFlags()
    this.updateLevelLabel()
  }

  updateFlags(): void {
    this.flags.forEach((flag, team) => {
      const playerTeamColor = teamColors[this.client.team]
      const fillColor = team === this.client.team ? playerTeamColor : 'black'
      const flashOpacity = 0.5 + 0.5 * Math.sin(6 * this.client.time)
      const flashing = this.client.phase == 'team'
      const opacity = flashing ? flashOpacity : 1
      flag.opacity(opacity)
      flag.fill(fillColor)
      if (this.client.phase !== 'team') return
      if (this.client.team === team) return
      if (this.client.takenTeams.includes(team)) {
        flag.opacity(0)
      }
    })
  }

  updateLevelLabel() {
    const text = ``
    const path = this.font.getPath(text, 0, 0, 0.5)
    this.levelLabel.attr({ d: path.toPathData(4) })
    this.levelLabel.fill(labelColor)
    const box = path.getBoundingBox()
    this.levelLabel.transform({
      translateX: 0.5 * (box.x1 - box.x2),
      translateY: 0.5 * (box.y2 - box.y1),
    })
  }

  makeLevelLabel(): Path {
    const group = this.gui.world.group()
    group.translate(2, 5.01)
    group.transform({ flip: 'y', origin: [0, 0] }, true)
    const levelLabel = group.path()
    return levelLabel
  }

  addFlags(): void {
    const points = [
      [0.5, 5.1],
      [3.5, 5.1],
    ]
    points.forEach((point, team) => {
      const x = point[0]
      const y = point[1]
      const rect = this.gui.world.rect(0.5, 0.5)
      rect.center(x, y)
      rect.stroke({
        color: teamColors[team],
        width: 0.1,
      })
      rect.click(_ => this.client.selectTeam(team))
      this.flags.push(rect)
    })
  }
}
