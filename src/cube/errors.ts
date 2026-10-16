// Plain-language messages for validation and solver errors.

import type { ValidationCode, ValidationError } from './validate'

export type ErrorCode = ValidationCode | 'SOLVER'

const FRIENDLY: Record<ErrorCode, string> = {
  LENGTH: "This cube doesn't have the right number of stickers. Reset it and try again.",
  INVALID_COLOR: 'Some stickers have a colour that is not part of the cube. Recolour them using the palette.',
  COLOR_COUNT: 'Each colour must appear exactly 9 times. Check the colour counts in the editor.',
  CENTERS: "The centre stickers can't be changed. Reset the cube and try again.",
  INVALID_PIECE: "One of the corners or edges has a colour combination that doesn't exist on a real cube. Check your stickers.",
  DUPLICATE_PIECE: 'The same corner or edge appears twice. Check that each piece is coloured only once.',
  EDGE_FLIP: 'One edge looks flipped in place, which a real cube cannot do. Check the edge colours.',
  CORNER_TWIST: 'One corner looks twisted in place, which a real cube cannot do. Check the corner colours.',
  PARITY: 'Two pieces look swapped, which a real cube cannot do. Check your stickers.',
  SOLVER: "Sorry, the solver couldn't find a solution. Try again or reset the cube.",
}

/** A short, friendly explanation for an error; unknown errors get the generic solver message. */
export function friendlyError(error: Pick<ValidationError, 'code'> | null | undefined): string {
  return FRIENDLY[(error?.code ?? 'SOLVER') as ErrorCode] ?? FRIENDLY.SOLVER
}
