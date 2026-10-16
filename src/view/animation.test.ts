import { Vector3 } from 'three'
import { FACES, GEOMETRY, applyMove, type Move } from '../cube/state'
import { LAYERS, easeInOut, moveAngle, moveDuration } from './animation'

const TURNS = [1, 2, 3] as const
// Array.join turns -0 into "0", so rounded vectors compare reliably as strings.
const id = (v: Vector3) => [v.x, v.y, v.z].map((n) => Math.round(n)).join()

describe('move animation maths', () => {
  it('rotating the layer by the animation angle matches the logical move', () => {
    // 54 unique tags so the whole permutation is checked.
    const tagged = GEOMETRY.map((_, i) => String.fromCharCode(65 + i))
    const indexOf = new Map(GEOMETRY.map((g, i) => [`${g.pos.join()}|${g.normal.join()}`, i]))
    for (const face of FACES)
      for (const turns of TURNS) {
        const move: Move = { face, turns }
        const { axis, sign } = LAYERS[face]
        const axisVec = new Vector3(axis === 0 ? 1 : 0, axis === 1 ? 1 : 0, axis === 2 ? 1 : 0)
        const after = applyMove(tagged.join(''), move)
        GEOMETRY.forEach((g, i) => {
          if (g.pos[axis] !== sign) {
            expect(after[i]).toBe(tagged[i])
            return
          }
          const pos = new Vector3(...g.pos).applyAxisAngle(axisVec, moveAngle(move))
          const normal = new Vector3(...g.normal).applyAxisAngle(axisVec, moveAngle(move))
          const j = indexOf.get(`${id(pos)}|${id(normal)}`)!
          expect(after[j]).toBe(tagged[i])
        })
      }
  })

  it('eases from 0 to 1 monotonically and clamps', () => {
    expect(easeInOut(0)).toBe(0)
    expect(easeInOut(1)).toBe(1)
    expect(easeInOut(-1)).toBe(0)
    expect(easeInOut(2)).toBe(1)
    let prev = 0
    for (let t = 0.1; t <= 1; t += 0.1) {
      expect(easeInOut(t)).toBeGreaterThanOrEqual(prev)
      prev = easeInOut(t)
    }
  })

  it('takes longer for half turns', () => {
    expect(moveDuration({ face: 'U', turns: 2 })).toBeGreaterThan(moveDuration({ face: 'U', turns: 1 }))
  })
})
