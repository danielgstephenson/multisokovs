import { range, sample } from '../web/shared/math.js'
import { getOutcome } from '../web/shared/state.js'
import { Messenger } from './messenger.js'
import { tickInterval } from '../web/shared/parameters.js'
import { getStartingState } from './startingState.js'

export class Game {
  time = 0
  round = 0
  countdown = 0
  winner = -1
  phase = 'choice'
  angle = sample(range(4))
  state: number
  messenger: Messenger

  constructor() {
    const level = sample(range(10, 30))
    const advantage = sample([0, 1])
    this.state = getStartingState(level, advantage)
    this.messenger = new Messenger(this)
    this.messenger.listen(3000)
  }

  update(): void {
    this.countdown = Math.max(0, this.countdown - tickInterval)
    this.time += tickInterval
    if (this.phase === 'end') {
      if (this.countdown === 0) {
        void this.onMatchComplete()
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
}
