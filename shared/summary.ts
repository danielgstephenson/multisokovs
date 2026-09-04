export interface GameSummary {
  phase: string
  state: number
  round: number
  winner: number
  angle: number
  takenTeams: number[]
}

export interface PlayerSummary extends GameSummary {
  team: number
}
