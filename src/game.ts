import { range, sample } from '../shared/math.js'
import { getOutcome, stateToLocs } from '../shared/state.js'
import { Messenger } from './messenger.js'
import { endInterval, goals, maxRound, tickInterval, timeScale } from '../shared/parameters.js'
import { getStartingState } from './startingState.js'
import type { GameSummary } from '../shared/summary.js'
import type { Player } from './player.js'

export class Game {
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

  constructor(messenger: Messenger, id: string) {
    this.messenger = messenger
    this.id = id
    const level = sample(range(10, 30))
    const advantage = sample([0, 1])
    this.state = getStartingState(level, advantage)
    setInterval(() => this.update(), (tickInterval / timeScale) * 1000)
  }

  update(): void {
    this.countdown = Math.max(0, this.countdown - tickInterval)
    this.time += tickInterval
    if (this.phase === 'team') {
      if (this.takenTeams.length > 1) {
        console.log(this.takenTeams)
        this.phase = 'choice'
      }
    } else if (this.phase === 'move') {
      if (this.countdown === 0) {
        this.onMoveComplete()
      }
    } else if (this.phase === 'end') {
      if (this.countdown === 0) {
        this.onMatchComplete()
      }
    }
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
      return
    }
    this.phase = 'choice'
  }

  onMatchComplete(): void {
    const losers = [0, 1].filter(i => i !== this.winner)
    const advantage = sample(losers)
    const level = sample(range(10, 30))
    this.state = getStartingState(level, advantage)
    this.round = 0
    this.winner = -1
    this.phase = 'choice'
  }

  advance(dir: number): void {
    this.state = getOutcome(this.state, dir)
    this.phase = 'move'
    this.countdown = 1
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

  summarize(): GameSummary {
    return {
      phase: this.phase,
      state: this.state,
      round: this.round,
      winner: this.winner,
      countdown: this.countdown,
      angle: this.angle,
      takenTeams: this.takenTeams,
    }
  }
}
