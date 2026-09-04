import { range, sample } from '../shared/math.js'
import { getOutcome } from '../shared/state.js'
import { Messenger } from './messenger.js'
import { tickInterval } from '../shared/parameters.js'
import { getStartingState } from './startingState.js'
import type { GameSummary } from '../shared/summary.js'

export class Game {
  time = 0
  round = 0
  countdown = 0
  winner = -1
  phase = 'team'
  angle = sample(range(4))
  state: number
  messenger: Messenger
  id: string

  constructor(messenger: Messenger, id: string) {
    this.messenger = messenger
    this.id = id
    const level = sample(range(10, 30))
    const advantage = sample([0, 1])
    this.state = getStartingState(level, advantage)
  }

  update(): void {
    this.countdown = Math.max(0, this.countdown - tickInterval)
    this.time += tickInterval
    if (this.phase === 'end') {
      if (this.countdown === 0) {
        this.onMatchComplete()
      }
    }
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
  }

  summarize(): GameSummary {
    return {
      phase: this.phase,
      state: this.state,
      round: this.round,
      winner: this.winner,
      countdown: this.countdown,
      angle: this.angle,
    }
  }
}
