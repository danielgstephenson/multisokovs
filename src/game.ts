import { range, sample } from '../shared/math.js'
import { getOutcome, stateToLocs } from '../shared/state.js'
import { type Messenger } from './messenger.js'
import { endInterval, goals, maxRound, tickInterval, timeScale } from '../shared/parameters.js'
import { getStartingState } from './startingState.js'
import type { GameSummary } from '../shared/summary.js'
import type { Player } from './player.js'

export class Game {
  lastTime = performance.now()
  time = 0
  round = 0
  countdown = 0
  winner = -1
  phase = 'team'
  angle = sample(range(4))
  takenTeams: number[] = []
  players: Player[] = []
  state: number
  messenger: Messenger
  id: string
  interval: NodeJS.Timeout

  constructor(messenger: Messenger, id: string) {
    this.messenger = messenger
    this.id = id
    this.state = this.reset()
    this.interval = setInterval(() => this.update(), (tickInterval / timeScale) * 1000)
  }

  update(): void {
    const now = performance.now()
    const dt = (now - this.lastTime) / 1000
    this.lastTime = now
    this.countdown = Math.max(0, this.countdown - dt)
    this.time += dt
    if (this.phase === 'team') {
      if (this.takenTeams.length > 1) {
        this.phase = 'choice'
      }
    } else if (this.phase === 'move') {
      if (this.countdown === 0) {
        this.onMoveComplete()
      }
    } else if (this.phase === 'end') {
      if (this.countdown === 0) {
        this.reset()
      }
    }
  }

  reset(): number {
    const level = sample(range(20, 30))
    const advantage = sample([0, 1])
    this.state = getStartingState(level, advantage)
    this.angle = sample(range(4))
    this.round = 0
    this.countdown = 0
    this.winner = -1
    this.phase = 'team'
    this.players.forEach(p => (p.team = -1))
    return this.state
  }

  onMoveComplete(): void {
    this.round += 1
    const scores = this.getScores()
    const maxScore = Math.max(...scores)
    range(2).forEach(team => {
      if (scores[team] > 1) this.winner = team
    })
    if (maxScore > 1 || this.round > maxRound) {
      this.phase = 'end'
      this.countdown = endInterval
      this.players.forEach(player => {
        player.socket.emit('matchComplete', this.summarize())
      })
      return
    }
    this.phase = 'choice'
  }

  advance(dir: number): void {
    const angleDir = (4 - this.angle + dir) % 4
    this.state = getOutcome(this.state, angleDir)
    this.phase = 'move'
    this.countdown = 0.8
    this.players.forEach(player => {
      player.socket.emit('move', player.summarize())
    })
  }

  getScores(): number[] {
    const scores = [0, 0]
    stateToLocs(this.state).forEach((unitLoc, i) => {
      const team = (this.round + i) % 2
      goals.forEach(goal => {
        if (goal === unitLoc) scores[team] += 1
      })
    })
    return scores
  }

  stop(): void {
    clearInterval(this.interval)
    this.messenger.games.delete(this.id)
  }

  summarize(): GameSummary {
    return {
      phase: this.phase,
      state: this.state,
      round: this.round,
      winner: this.winner,
      angle: this.angle,
      takenTeams: this.takenTeams,
    }
  }
}
