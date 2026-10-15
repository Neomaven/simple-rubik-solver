import Cube from 'cubejs'
import {
  ALL_MOVES,
  FACES,
  applyMove,
  applyMoves,
  formatAlgorithm,
  invertAlgorithm,
  invertMove,
  isSolved,
  parseAlgorithm,
  parseMove,
  solvedState,
} from '.'

const SCRAMBLE = "R U R' U' F2 D L' B2 U2 R D' F"

describe('state', () => {
  it('starts solved', () => {
    expect(solvedState()).toHaveLength(54)
    expect(isSolved(solvedState())).toBe(true)
  })

  it('any move followed by its inverse restores the solved cube', () => {
    for (const move of ALL_MOVES) {
      const state = applyMove(applyMove(solvedState(), move), invertMove(move))
      expect(isSolved(state)).toBe(true)
    }
  })

  it('any face move applied four times restores the state', () => {
    const scrambled = applyMoves(solvedState(), parseAlgorithm(SCRAMBLE))
    for (const face of FACES) {
      const quarter = { face, turns: 1 } as const
      for (const start of [solvedState(), scrambled]) {
        expect(applyMoves(start, [quarter, quarter, quarter, quarter])).toBe(start)
      }
    }
  })

  it('X2 equals two X, and X3 equals the inverse', () => {
    const scrambled = applyMoves(solvedState(), parseAlgorithm(SCRAMBLE))
    for (const face of FACES) {
      const q = { face, turns: 1 } as const
      expect(applyMove(scrambled, { face, turns: 2 })).toBe(applyMoves(scrambled, [q, q]))
      expect(applyMove(scrambled, { face, turns: 3 })).toBe(applyMoves(scrambled, [q, q, q]))
    }
  })

  it('an algorithm followed by its inverse restores the cube', () => {
    const alg = parseAlgorithm(SCRAMBLE)
    expect(isSolved(applyMoves(applyMoves(solvedState(), alg), invertAlgorithm(alg)))).toBe(true)
  })

  it('turns U clockwise: F, L, B, R top rows cycle', () => {
    expect(applyMove(solvedState(), parseMove('U'))).toBe(
      'UUUUUUUUU' + 'BBBRRRRRR' + 'RRRFFFFFF' + 'DDDDDDDDD' + 'FFFLLLLLL' + 'LLLBBBBBB',
    )
  })

  it('matches cubejs facelets', () => {
    for (const move of ALL_MOVES) {
      const text = formatAlgorithm([move])
      expect(applyMove(solvedState(), move)).toBe(new Cube().move(text).asString())
    }
    expect(applyMoves(solvedState(), parseAlgorithm(SCRAMBLE))).toBe(new Cube().move(SCRAMBLE).asString())
  })
})

describe('notation', () => {
  it('parses U, U\' and U2 with the right inverses', () => {
    expect(parseMove('U')).toEqual({ face: 'U', turns: 1 })
    expect(parseMove("U'")).toEqual({ face: 'U', turns: 3 })
    expect(parseMove('U2')).toEqual({ face: 'U', turns: 2 })
    expect(invertMove(parseMove('U'))).toEqual(parseMove("U'"))
    expect(invertMove(parseMove("U'"))).toEqual(parseMove('U'))
    expect(invertMove(parseMove('U2'))).toEqual(parseMove('U2'))
  })

  it('parses and formats algorithms', () => {
    expect(formatAlgorithm(parseAlgorithm("  R  U2 F' "))).toBe("R U2 F'")
    expect(parseAlgorithm('')).toEqual([])
    expect(formatAlgorithm(invertAlgorithm(parseAlgorithm("R U2 F'")))).toBe("F U2 R'")
  })

  it('rejects invalid tokens', () => {
    for (const bad of ['', 'X', 'U3', "U2'", 'u', 'Rw']) {
      expect(() => parseMove(bad)).toThrow()
    }
  })
})
