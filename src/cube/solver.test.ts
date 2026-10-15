import { applyMoves, isSolved, parseAlgorithm, shuffleCube, shuffleMoves, solveCube, solvedState, validateCube } from './index'

describe('solveCube', () => {
  it('returns the error and no moves for an invalid cube', () => {
    const s = solvedState()
    // swap two facelets of one edge: single flipped edge
    const bad = s.slice(0, 5) + s[19] + s.slice(6, 19) + s[5] + s.slice(20)
    const result = solveCube(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toBeTruthy()
  })

  it('solves a scrambled cube and reports the count', () => {
    const state = applyMoves(solvedState(), parseAlgorithm("R U R' U' F2 D L' B2"))
    const result = solveCube(state)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.count).toBe(result.moves.length)
      expect(isSolved(applyMoves(state, result.moves))).toBe(true)
    }
  }, 60000)
})

describe('shuffle', () => {
  it('is deterministic with a seeded rng and has no repeated faces', () => {
    let seed = 1
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const moves = shuffleMoves(25, rng)
    expect(moves).toHaveLength(25)
    moves.slice(1).forEach((m, i) => expect(m.face).not.toBe(moves[i].face))
  })

  it('produces a valid cube that Solve can solve', () => {
    const state = shuffleCube(solvedState())
    expect(validateCube(state).valid).toBe(true)
    const result = solveCube(state)
    expect(result.ok).toBe(true)
    if (result.ok) expect(isSolved(applyMoves(state, result.moves))).toBe(true)
  }, 60000)
})
