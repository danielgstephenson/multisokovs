import { readFileSync } from 'fs'

function getDataView(filePath: string): DataView {
  const buffer = readFileSync(filePath)
  const arrayBuffer = buffer.buffer
  return new DataView(arrayBuffer, buffer.byteOffset, buffer.byteLength)
}

const startingStates0 = getDataView('startingStates0.bin')
const startingStates1 = getDataView('startingStates1.bin')

export function getStartingState(level: number, advantage: number): number {
  const sampleSize = 10000
  const startIndex = (level - 1) * sampleSize
  const index0 = startIndex + Math.floor(Math.random() * sampleSize)
  const index1 = startIndex + Math.floor(Math.random() * sampleSize)
  const state0 = startingStates0.getInt32(index0 * 4, true)
  const state1 = startingStates1.getInt32(index1 * 4, true)
  return advantage === 0 ? state0 : state1
}
