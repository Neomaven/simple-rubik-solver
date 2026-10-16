// Camera orbit/zoom maths, kept free of three.js so it is easy to test.

export interface View {
  /** Angle around the vertical axis, in radians. */
  azimuth: number
  /** Angle from the +y axis, in radians. */
  polar: number
  /** Distance from the cube centre. */
  distance: number
}

export const MIN_DISTANCE = 4
export const MAX_DISTANCE = 16
const MIN_POLAR = 0.1
const MAX_POLAR = Math.PI - 0.1
const ROTATE_SPEED = 0.01

export const DEFAULT_VIEW: View = { azimuth: Math.PI / 4, polar: 1.1, distance: 8 }

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Orbit by a pointer drag of (dx, dy) pixels. */
export function orbit(view: View, dx: number, dy: number): View {
  return {
    ...view,
    azimuth: view.azimuth - dx * ROTATE_SPEED,
    polar: clamp(view.polar - dy * ROTATE_SPEED, MIN_POLAR, MAX_POLAR),
  }
}

/** Zoom by a factor: below 1 moves closer, above 1 moves away. */
export function zoom(view: View, factor: number): View {
  return { ...view, distance: clamp(view.distance * factor, MIN_DISTANCE, MAX_DISTANCE) }
}

export function cameraPosition({ azimuth, polar, distance }: View): [number, number, number] {
  const r = distance * Math.sin(polar)
  return [r * Math.sin(azimuth), distance * Math.cos(polar), r * Math.cos(azimuth)]
}
