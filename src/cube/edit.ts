// Sticker-level editing helpers for the 2D cube editor.

import { FACES, type CubeState, type Face } from './state'

/** Centers (index 9k+4) are fixed and cannot be recolored. */
export function isCenter(index: number): boolean {
  return index % 9 === 4
}

/** Return the state with sticker `index` set to `color`; centers and invalid input leave it unchanged. */
export function setSticker(state: CubeState, index: number, color: Face): CubeState {
  if (!Number.isInteger(index) || index < 0 || index >= state.length) return state
  if (isCenter(index) || !FACES.includes(color)) return state
  return state.slice(0, index) + color + state.slice(index + 1)
}

/** Number of stickers of each color (9 each on a valid cube). */
export function colorCounts(state: CubeState): Record<Face, number> {
  const counts = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 }
  for (const c of state) if (c in counts) counts[c as Face]++
  return counts
}
