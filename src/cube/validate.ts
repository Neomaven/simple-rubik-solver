// Validation of a facelet cube state before solving. Checks run in order and the
// first failure is reported: length, characters, colour counts, centres, piece
// existence/uniqueness, edge flip, corner twist, permutation parity.

import { FACES, solvedState, type CubeState } from './state'

export type ValidationCode =
  | 'LENGTH'
  | 'INVALID_COLOR'
  | 'COLOR_COUNT'
  | 'CENTERS'
  | 'INVALID_PIECE'
  | 'DUPLICATE_PIECE'
  | 'EDGE_FLIP'
  | 'CORNER_TWIST'
  | 'PARITY'
  | 'SOLVER'

export interface ValidationError {
  code: ValidationCode
  message: string
}

export type ValidationResult = { valid: true } | { valid: false; error: ValidationError }

// Facelet indices of each slot, in Kociemba order, listed so that a corner's
// first facelet is its U/D sticker. Slots: URF UFL ULB UBR DFR DLF DBL DRB.
const CORNER_SLOTS = [
  [8, 9, 20],
  [6, 18, 38],
  [0, 36, 47],
  [2, 45, 11],
  [29, 26, 15],
  [27, 44, 24],
  [33, 53, 42],
  [35, 17, 51],
]
// Slots: UR UF UL UB DR DF DL DB FR FL BL BR.
const EDGE_SLOTS = [
  [5, 10],
  [7, 19],
  [3, 37],
  [1, 46],
  [32, 16],
  [28, 25],
  [30, 43],
  [34, 52],
  [23, 12],
  [21, 41],
  [50, 39],
  [48, 14],
]

const SOLVED = solvedState()
const colorsAt = (state: string, slot: number[]) => slot.map((i) => state[i])
const SOLVED_CORNERS = CORNER_SLOTS.map((s) => colorsAt(SOLVED, s))
const SOLVED_EDGES = EDGE_SLOTS.map((s) => colorsAt(SOLVED, s))

const fail = (code: ValidationCode, message: string): ValidationResult => ({
  valid: false,
  error: { code, message },
})

/** Find which solved piece `colors` is and its orientation (cyclic shift), or null. */
function identify(colors: string[], pieces: string[][]): { piece: number; ori: number } | null {
  const n = colors.length
  for (let piece = 0; piece < pieces.length; piece++) {
    for (let ori = 0; ori < n; ori++) {
      if (colors.every((c, k) => c === pieces[piece][(k + ori) % n])) return { piece, ori }
    }
  }
  return null
}

/** Parity of a permutation (0 even, 1 odd) via cycle decomposition. */
function parity(perm: number[]): number {
  const seen = new Array(perm.length).fill(false)
  let swaps = 0
  for (let i = 0; i < perm.length; i++) {
    if (seen[i]) continue
    let len = 0
    for (let j = i; !seen[j]; j = perm[j]) {
      seen[j] = true
      len++
    }
    swaps += len - 1
  }
  return swaps % 2
}

function readPieces(
  state: string,
  slots: number[][],
  pieces: string[][],
  kind: string,
): { error: ValidationResult } | { perm: number[]; oriSum: number } {
  const perm: number[] = []
  const used = new Set<number>()
  let oriSum = 0
  for (const slot of slots) {
    const colors = colorsAt(state, slot)
    const found = identify(colors, pieces)
    if (!found) {
      return { error: fail('INVALID_PIECE', `Invalid ${kind} with colours ${colors.join('')}: no such piece exists`) }
    }
    if (used.has(found.piece)) {
      return { error: fail('DUPLICATE_PIECE', `Duplicate ${kind} ${pieces[found.piece].join('')}: each piece must appear once`) }
    }
    used.add(found.piece)
    perm.push(found.piece)
    oriSum += found.ori
  }
  return { perm, oriSum }
}

export function validateCube(state: CubeState): ValidationResult {
  if (state.length !== 54) {
    return fail('LENGTH', `Cube must have 54 facelets, got ${state.length}`)
  }
  for (const ch of state) {
    if (!(FACES as readonly string[]).includes(ch)) {
      return fail('INVALID_COLOR', `Invalid colour "${ch}": use only ${FACES.join(', ')}`)
    }
  }
  for (const face of FACES) {
    const count = state.split(face).length - 1
    if (count !== 9) {
      return fail('COLOR_COUNT', `Colour ${face} appears ${count} times, expected 9`)
    }
  }
  for (let k = 0; k < 6; k++) {
    if (state[9 * k + 4] !== FACES[k]) {
      return fail('CENTERS', `Centre of face ${FACES[k]} is ${state[9 * k + 4]}, expected ${FACES[k]}`)
    }
  }

  const edges = readPieces(state, EDGE_SLOTS, SOLVED_EDGES, 'edge')
  if ('error' in edges) return edges.error
  const corners = readPieces(state, CORNER_SLOTS, SOLVED_CORNERS, 'corner')
  if ('error' in corners) return corners.error

  if (edges.oriSum % 2 !== 0) {
    return fail('EDGE_FLIP', 'Edge orientation is invalid: a single edge is flipped')
  }
  if (corners.oriSum % 3 !== 0) {
    return fail('CORNER_TWIST', 'Corner orientation is invalid: a single corner is twisted')
  }
  if (parity(edges.perm) !== parity(corners.perm)) {
    return fail('PARITY', 'Permutation parity is invalid: two pieces are swapped')
  }
  return { valid: true }
}
