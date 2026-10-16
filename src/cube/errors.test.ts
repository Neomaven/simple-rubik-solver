import { friendlyError, type ErrorCode } from './errors'

const CODES: ErrorCode[] = [
  'LENGTH',
  'INVALID_COLOR',
  'COLOR_COUNT',
  'CENTERS',
  'INVALID_PIECE',
  'DUPLICATE_PIECE',
  'EDGE_FLIP',
  'CORNER_TWIST',
  'PARITY',
  'SOLVER',
]

describe('friendlyError', () => {
  it('has a distinct plain-language message for every code', () => {
    const messages = CODES.map((code) => friendlyError({ code }))
    for (const m of messages) expect(m.length).toBeGreaterThan(20)
    expect(new Set(messages).size).toBe(CODES.length)
  })

  it('falls back to the generic solver message', () => {
    expect(friendlyError(null)).toBe(friendlyError({ code: 'SOLVER' }))
    expect(friendlyError({ code: 'NOPE' as ErrorCode })).toBe(friendlyError({ code: 'SOLVER' }))
  })
})
