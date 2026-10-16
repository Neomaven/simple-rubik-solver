// Pure helpers for animating a layer turn in the 3D view.

import type { Face, Move } from '../cube/state'

/** Axis index (x, y, z) and the side of the cube ({1, -1}) of the layer each face turns. */
export const LAYERS: Record<Face, { axis: 0 | 1 | 2; sign: 1 | -1 }> = {
  U: { axis: 1, sign: 1 },
  R: { axis: 0, sign: 1 },
  F: { axis: 2, sign: 1 },
  D: { axis: 1, sign: -1 },
  L: { axis: 0, sign: -1 },
  B: { axis: 2, sign: -1 },
}

/**
 * Signed rotation (radians) about the positive axis of the layer. A clockwise
 * turn seen from the outside is -90deg about +axis, or +90deg about -axis.
 */
export function moveAngle(move: Move): number {
  return -LAYERS[move.face].sign * (Math.PI / 2) * move.turns
}

/** Milliseconds a move takes to animate. */
export function moveDuration(move: Move): number {
  return move.turns === 2 ? 450 : 300
}

export function easeInOut(t: number): number {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}
