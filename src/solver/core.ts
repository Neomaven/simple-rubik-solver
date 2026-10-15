import Cube from 'cubejs'
import { parseAlgorithm, validateCube } from '../cube'
import type { SolverRequest, SolverResponse } from './protocol'

let initialized = false

function ensureInit() {
  if (!initialized) {
    Cube.initSolver()
    initialized = true
  }
}

/** Handle one request. Never throws: failures become `error` responses. */
export function handleMessage(req: SolverRequest): SolverResponse {
  const { id } = req
  try {
    ensureInit()
    if (req.type === 'init') return { id, type: 'ready' }

    const validation = validateCube(req.state)
    if (!validation.valid) {
      return { id, type: 'error', code: 'VALIDATION', message: validation.error.message }
    }
    const solution = Cube.fromString(req.state).solve()
    if (typeof solution !== 'string') {
      return { id, type: 'error', code: 'SOLVE_FAILED', message: 'No solution was found for this cube.' }
    }
    return { id, type: 'solved', moves: parseAlgorithm(solution) }
  } catch {
    return {
      id,
      type: 'error',
      code: 'SOLVE_FAILED',
      message: 'The solver ran into a problem. Please try again.',
    }
  }
}
