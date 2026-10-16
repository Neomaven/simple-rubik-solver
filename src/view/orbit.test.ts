import { DEFAULT_VIEW, MAX_DISTANCE, MIN_DISTANCE, cameraPosition, orbit, zoom } from './orbit'

describe('orbit', () => {
  it('changes the azimuth on horizontal drag', () => {
    expect(orbit(DEFAULT_VIEW, 50, 0).azimuth).not.toBe(DEFAULT_VIEW.azimuth)
  })

  it('clamps the polar angle', () => {
    expect(orbit(DEFAULT_VIEW, 0, 100000).polar).toBeGreaterThan(0)
    expect(orbit(DEFAULT_VIEW, 0, -100000).polar).toBeLessThan(Math.PI)
  })

  it('keeps the camera at the view distance', () => {
    const [x, y, z] = cameraPosition(orbit(DEFAULT_VIEW, 37, -12))
    expect(Math.hypot(x, y, z)).toBeCloseTo(DEFAULT_VIEW.distance)
  })
})

describe('zoom', () => {
  it('zooms in and out', () => {
    expect(zoom(DEFAULT_VIEW, 0.8).distance).toBeLessThan(DEFAULT_VIEW.distance)
    expect(zoom(DEFAULT_VIEW, 1.25).distance).toBeGreaterThan(DEFAULT_VIEW.distance)
  })

  it('clamps the distance', () => {
    expect(zoom(DEFAULT_VIEW, 0.0001).distance).toBe(MIN_DISTANCE)
    expect(zoom(DEFAULT_VIEW, 1000).distance).toBe(MAX_DISTANCE)
  })
})
