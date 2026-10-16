// Facelet cube state: 54 stickers in Kociemba order (U, R, F, D, L, B), each
// face read row by row as in the standard unfolded net. This is the same
// layout cubejs uses for `asString()`.

export const FACES = ['U', 'R', 'F', 'D', 'L', 'B'] as const
export type Face = (typeof FACES)[number]

export interface Move {
  face: Face
  /** 1 = clockwise quarter turn, 2 = half turn, 3 = counter-clockwise quarter turn */
  turns: 1 | 2 | 3
}

/** A 54-character string; character i is the colour (face letter) of facelet i. */
export type CubeState = string

type Vec = [number, number, number]

// Axis of each face and the sign of its outward normal. x -> R, y -> U, z -> F.
const FACE_AXIS: Record<Face, { axis: 0 | 1 | 2; sign: 1 | -1 }> = {
  U: { axis: 1, sign: 1 },
  R: { axis: 0, sign: 1 },
  F: { axis: 2, sign: 1 },
  D: { axis: 1, sign: -1 },
  L: { axis: 0, sign: -1 },
  B: { axis: 2, sign: -1 },
}

/** Cubie position and outward normal of facelet `col`/`row` on `face`. */
function faceletGeometry(face: Face, row: number, col: number): { pos: Vec; normal: Vec } {
  switch (face) {
    case 'U':
      return { pos: [col - 1, 1, row - 1], normal: [0, 1, 0] }
    case 'R':
      return { pos: [1, 1 - row, 1 - col], normal: [1, 0, 0] }
    case 'F':
      return { pos: [col - 1, 1 - row, 1], normal: [0, 0, 1] }
    case 'D':
      return { pos: [col - 1, -1, 1 - row], normal: [0, -1, 0] }
    case 'L':
      return { pos: [-1, 1 - row, col - 1], normal: [-1, 0, 0] }
    case 'B':
      return { pos: [1 - col, 1 - row, -1], normal: [0, 0, -1] }
  }
}

const key = (pos: Vec, normal: Vec) => `${pos.join(',')}|${normal.join(',')}`

/** Cubie position and outward normal of every facelet, indexed like a CubeState. */
export const GEOMETRY = FACES.flatMap((face) =>
  Array.from({ length: 9 }, (_, i) => faceletGeometry(face, Math.floor(i / 3), i % 3)),
)
const INDEX_BY_KEY = new Map(GEOMETRY.map((g, i) => [key(g.pos, g.normal), i]))

/** Rotate a vector by a clockwise quarter turn seen from the outward side of `face`. */
function rotateClockwise(v: Vec, face: Face): Vec {
  const [x, y, z] = v
  const { axis, sign } = FACE_AXIS[face]
  // Clockwise seen from +axis is -90deg about +axis; seen from -axis it is +90deg.
  const negative = sign === 1
  if (axis === 0) return negative ? [x, z, -y] : [x, -z, y]
  if (axis === 1) return negative ? [-z, y, x] : [z, y, -x]
  return negative ? [y, -x, z] : [-y, x, z]
}

/** QUARTER[face][i] = index the sticker at facelet i moves to on a clockwise quarter turn. */
const QUARTER: Record<Face, number[]> = Object.fromEntries(
  FACES.map((face) => {
    const { axis, sign } = FACE_AXIS[face]
    const perm = GEOMETRY.map((g, i) => {
      if (g.pos[axis] !== sign) return i
      const j = INDEX_BY_KEY.get(key(rotateClockwise(g.pos, face), rotateClockwise(g.normal, face)))
      if (j === undefined) throw new Error('invalid facelet geometry')
      return j
    })
    return [face, perm]
  }),
) as Record<Face, number[]>

export function solvedState(): CubeState {
  return FACES.map((f) => f.repeat(9)).join('')
}

export function isSolved(state: CubeState): boolean {
  return state === solvedState()
}

export function applyMove(state: CubeState, move: Move): CubeState {
  if (state.length !== 54) throw new Error(`cube state must have 54 facelets, got ${state.length}`)
  const perm = QUARTER[move.face]
  let current = state.split('')
  for (let t = 0; t < move.turns; t++) {
    const next = current.slice()
    for (let i = 0; i < 54; i++) next[perm[i]] = current[i]
    current = next
  }
  return current.join('')
}

export function applyMoves(state: CubeState, moves: readonly Move[]): CubeState {
  return moves.reduce(applyMove, state)
}
