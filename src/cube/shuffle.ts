// Shuffle by applying random legal face moves, so the result is always solvable.

import { FACES, applyMoves, type CubeState, type Move } from './state'

export function shuffleMoves(length = 25, rng: () => number = Math.random): Move[] {
  const moves: Move[] = []
  while (moves.length < length) {
    const face = FACES[Math.floor(rng() * FACES.length)]
    if (moves.length > 0 && moves[moves.length - 1].face === face) continue
    const turns = (Math.floor(rng() * 3) + 1) as Move['turns']
    moves.push({ face, turns })
  }
  return moves
}

export function shuffleCube(state: CubeState, rng: () => number = Math.random): CubeState {
  return applyMoves(state, shuffleMoves(25, rng))
}
