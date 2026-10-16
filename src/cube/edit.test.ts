import { colorCounts, isCenter, setSticker } from './edit'
import { solvedState } from './state'

describe('edit', () => {
  it('recolors a non-center sticker', () => {
    const next = setSticker(solvedState(), 0, 'R')
    expect(next[0]).toBe('R')
    expect(next.slice(1)).toBe(solvedState().slice(1))
  })

  it('ignores centers', () => {
    for (let k = 0; k < 6; k++) {
      expect(isCenter(9 * k + 4)).toBe(true)
      expect(setSticker(solvedState(), 9 * k + 4, 'B')).toBe(solvedState())
    }
  })

  it('ignores bad index and color', () => {
    const s = solvedState()
    expect(setSticker(s, -1, 'R')).toBe(s)
    expect(setSticker(s, 54, 'R')).toBe(s)
    expect(setSticker(s, 0, 'X' as never)).toBe(s)
  })

  it('counts colors', () => {
    expect(colorCounts(solvedState())).toEqual({ U: 9, R: 9, F: 9, D: 9, L: 9, B: 9 })
    const c = colorCounts(setSticker(solvedState(), 0, 'R'))
    expect(c.U).toBe(8)
    expect(c.R).toBe(10)
  })
})
