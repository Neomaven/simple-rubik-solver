import type { Move } from '../cube'

export type SolverRequest =
  | { id: number; type: 'init' }
  | { id: number; type: 'solve'; state: string }

export type SolverErrorCode = 'VALIDATION' | 'SOLVE_FAILED' | 'WORKER_FAILURE'

export type SolverResponse =
  | { id: number; type: 'ready' }
  | { id: number; type: 'solved'; moves: Move[] }
  | { id: number; type: 'error'; code: SolverErrorCode; message: string }

/** Error surfaced to the UI; `message` is safe to show to the user. */
export class SolverError extends Error {
  code: SolverErrorCode
  constructor(code: SolverErrorCode, message: string) {
    super(message)
    this.name = 'SolverError'
    this.code = code
  }
}
