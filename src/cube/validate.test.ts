import { applyMoves, parseAlgorithm, solvedState, validateCube } from '.'

const SCRAMBLE = "R U R' U' F2 D L' B2 U2 R D' F"

const scrambled = () => applyMoves(solvedState(), parseAlgorithm(SCRAMBLE))

function swap(state: string, a: number, b: number): string {
  const s = state.split('')
  ;[s[a], s[b]] = [s[b], s[a]]
  return s.join('')
}

function cycle(state: string, a: number, b: number, c: number): string {
  const s = state.split('')
  ;[s[a], s[b], s[c]] = [s[c], s[a], s[b]]
  return s.join('')
}

const codeOf = (state: string) => {
  const r = validateCube(state)
  return r.valid ? 'valid' : r.error.code
}

describe('validateCube', () => {
  it('accepts solved and legally shuffled cubes', () => {
    expect(validateCube(solvedState())).toEqual({ valid: true })
    expect(validateCube(scrambled())).toEqual({ valid: true })
    expect(validateCube(applyMoves(solvedState(), parseAlgorithm("F2 L' R D2 B U' R2 F L2 U")))).toEqual({
      valid: true,
    })
  })

  it('reports a clear colour count error', () => {
    const bad = scrambled().replace('U', 'R') // an unrelated sticker recoloured
    const result = validateCube(bad)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error.code).toBe('COLOR_COUNT')
      expect(result.error.message).toMatch(/expected 9/)
    }
  })

  it('reports length and invalid characters', () => {
    expect(codeOf('UUU')).toBe('LENGTH')
    expect(codeOf('X' + solvedState().slice(1))).toBe('INVALID_COLOR')
  })

  it('reports swapped centres', () => {
    expect(codeOf(swap(solvedState(), 4, 13))).toBe('CENTERS')
  })

  it('reports a single flipped edge', () => {
    expect(codeOf(swap(solvedState(), 5, 10))).toBe('EDGE_FLIP')
    expect(codeOf(swap(scrambled(), 5, 10))).not.toBe('valid')
  })

  it('reports a single twisted corner', () => {
    expect(codeOf(cycle(solvedState(), 8, 9, 20))).toBe('CORNER_TWIST')
  })

  it('reports a swapped pair of edges', () => {
    // swap the UR and UF edges completely (both stickers each)
    expect(codeOf(swap(swap(solvedState(), 5, 7), 10, 19))).toBe('PARITY')
  })

  it('reports a swapped pair of corners', () => {
    // swap URF and UFL: (8,9,20) <-> (6,18,38) keeping orientation
    let s = swap(solvedState(), 8, 6)
    s = swap(s, 9, 18)
    s = swap(s, 20, 38)
    expect(codeOf(s)).not.toBe('valid')
  })

  it('reports duplicated or impossible pieces', () => {
    // UR sticker recoloured to F and UF sticker to R keeps counts but makes FR-like duplicates
    const s = swap(solvedState(), 5, 19)
    expect(['INVALID_PIECE', 'DUPLICATE_PIECE']).toContain(codeOf(s))
  })
})
