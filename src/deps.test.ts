import Cube from 'cubejs'
import { Scene } from 'three'

describe('dependencies', () => {
  it('loads cubejs and creates a solved cube', () => {
    expect(new Cube().isSolved()).toBe(true)
  })

  it('loads three', () => {
    expect(new Scene()).toBeDefined()
  })
})
