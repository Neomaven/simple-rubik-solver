// Solve a facelet cube: validate first, then run the cubejs two-phase solver.

import Cube from 'cubejs'
import { parseAlgorithm } from './notation'
import type { Move, CubeState } from './state'
import { validateCube, type ValidationError } from './validate'

export type SolveResult =
  | { ok: true; moves: Move[]; count: number }
  | { ok: false; error: ValidationError }

let solverReady = false

export function solveCube(state: CubeState): SolveResult {
  const validation = validateCube(state)
  if (!validation.valid) return { ok: false, error: validation.error }

  if (!solverReady) {
    Cube.initSolver()
    solverReady = true
  }
  const moves = parseAlgorithm(Cube.fromString(state).solve())
  return { ok: true, moves, count: moves.length }
}
