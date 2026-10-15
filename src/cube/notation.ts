import { FACES, type Face, type Move } from './state'

const SUFFIX = { 1: '', 2: '2', 3: "'" } as const

export function parseMove(token: string): Move {
  const match = /^([URFDLB])(['2]?)$/.exec(token)
  if (!match) throw new Error(`invalid move: "${token}"`)
  const face = match[1] as Face
  const turns = match[2] === "'" ? 3 : match[2] === '2' ? 2 : 1
  return { face, turns }
}

export function parseAlgorithm(text: string): Move[] {
  const trimmed = text.trim()
  return trimmed === '' ? [] : trimmed.split(/\s+/).map(parseMove)
}

export function invertMove(move: Move): Move {
  return { face: move.face, turns: (4 - move.turns) as Move['turns'] }
}

export function invertAlgorithm(moves: readonly Move[]): Move[] {
  return moves.map(invertMove).reverse()
}

export function formatMove(move: Move): string {
  return move.face + SUFFIX[move.turns]
}

export function formatAlgorithm(moves: readonly Move[]): string {
  return moves.map(formatMove).join(' ')
}

/** All 18 face moves, e.g. for exhaustive tests. */
export const ALL_MOVES: Move[] = FACES.flatMap((face) =>
  ([1, 2, 3] as const).map((turns) => ({ face, turns })),
)
