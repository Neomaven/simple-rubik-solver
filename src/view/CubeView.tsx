import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { GEOMETRY, type CubeState, type Face, type Move } from '../cube/state'
import { LAYERS, easeInOut, moveAngle, moveDuration } from './animation'
import { FACE_COLORS } from './colors'
import { DEFAULT_VIEW, cameraPosition, orbit, zoom, type View } from './orbit'

const SIZE = 360

interface Stage {
  stickers: Mesh<PlaneGeometry, MeshBasicMaterial>[]
  render: (view: View) => void
  /** Turn one layer; returns a cancel function that stops and restores the layer. */
  animate: (move: Move, getView: () => View, onDone: () => void) => () => void
  dispose: () => void
}

function createStage(container: HTMLElement): Stage | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ antialias: true })
  } catch {
    return null
  }
  renderer.setSize(SIZE, SIZE)
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  container.appendChild(renderer.domElement)

  const scene = new Scene()
  const camera = new PerspectiveCamera(35, 1, 0.1, 100)
  const body = new BoxGeometry(0.97, 0.97, 0.97)
  const bodyMaterial = new MeshBasicMaterial({ color: 0x111111 })
  const plane = new PlaneGeometry(0.84, 0.84)

  const cubies: Mesh[] = []
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        const cubie = new Mesh(body, bodyMaterial)
        cubie.position.set(x, y, z)
        scene.add(cubie)
        cubies.push(cubie)
      }

  const forward = new Vector3(0, 0, 1)
  const stickers = GEOMETRY.map(({ pos, normal }) => {
    const sticker = new Mesh(plane, new MeshBasicMaterial({ color: 0x888888 }))
    const n = new Vector3(...normal)
    sticker.position.set(...pos).addScaledVector(n, 0.49)
    sticker.quaternion.copy(new Quaternion().setFromUnitVectors(forward, n))
    scene.add(sticker)
    return sticker
  })

  const render = (view: View) => {
    camera.position.set(...cameraPosition(view))
    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera)
  }

  return {
    stickers,
    render,
    animate(move, getView, onDone) {
      const { axis, sign } = LAYERS[move.face]
      // Stickers keep their slots; only the turning layer is parented to a pivot.
      const layer = [
        ...cubies.filter((c) => Math.round(c.position.getComponent(axis)) === sign),
        ...stickers.filter((_, i) => GEOMETRY[i].pos[axis] === sign),
      ]
      const pivot = new Group()
      scene.add(pivot)
      layer.forEach((o) => pivot.add(o))
      const axisVec = new Vector3(axis === 0 ? 1 : 0, axis === 1 ? 1 : 0, axis === 2 ? 1 : 0)
      const angle = moveAngle(move)
      const duration = moveDuration(move)
      const start = performance.now()
      let frame = 0
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        pivot.quaternion.setFromAxisAngle(axisVec, angle * easeInOut(t))
        render(getView())
        if (t < 1) frame = requestAnimationFrame(step)
        else onDone()
      }
      frame = requestAnimationFrame(step)
      return () => {
        // Stop, then put the layer back where it belongs (pivot is the identity here).
        cancelAnimationFrame(frame)
        pivot.quaternion.identity()
        layer.forEach((o) => scene.add(o))
        scene.remove(pivot)
        render(getView())
      }
    },
    dispose() {
      body.dispose()
      bodyMaterial.dispose()
      plane.dispose()
      stickers.forEach((s) => s.material.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}

/**
 * Interactive 3D cube: drag to orbit, wheel / pinch / buttons to zoom.
 * `cube` is the logical state; `queue` holds moves still to animate (the head turns
 * first) and `onMoveDone` fires when the head finished, so the owner can commit it.
 * Dropping the queue (e.g. on Reset) stops the animation and the view shows `cube`.
 */
export default function CubeView({
  cube,
  queue = [],
  onMoveDone,
}: {
  cube: CubeState
  queue?: Move[]
  onMoveDone?: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage | null>(null)
  const viewRef = useRef<View>(DEFAULT_VIEW)
  const doneRef = useRef(onMoveDone)
  doneRef.current = onMoveDone
  const current: Move | undefined = queue[0]
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const [view, setView] = useState<View>(DEFAULT_VIEW)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const container = containerRef.current!
    const stage = createStage(container)
    stageRef.current = stage
    setSupported(stage !== null)

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setView((v) => zoom(v, Math.exp(e.deltaY * 0.001)))
    }
    container.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', onWheel)
      stage?.dispose()
      stageRef.current = null
    }
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    stage.stickers.forEach((s, i) => s.material.color.setHex(FACE_COLORS[cube[i] as Face] ?? 0x888888))
    viewRef.current = view
    stage.render(view)
  }, [cube, view])

  // Effect cleanups run before the next effects, so an interrupted or finished turn is
  // restored to its slots before the stickers are recoloured from the new state.
  useEffect(() => {
    if (!current) return
    const stage = stageRef.current
    if (!stage) {
      doneRef.current?.() // no WebGL: commit the move without animating
      return
    }
    return stage.animate(current, () => viewRef.current, () => doneRef.current?.())
  }, [current, queue.length])

  const onPointerDown = (e: ReactPointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    const next = { x: e.clientX, y: e.clientY }
    const others = [...pointers.current.entries()].filter(([id]) => id !== e.pointerId)
    if (others.length > 0) {
      // Pinch: scale distance by the ratio of the finger spread before and after.
      const other = others[0][1]
      const before = Math.hypot(prev.x - other.x, prev.y - other.y)
      const after = Math.hypot(next.x - other.x, next.y - other.y)
      if (before > 0 && after > 0) setView((v) => zoom(v, before / after))
    } else {
      setView((v) => orbit(v, next.x - prev.x, next.y - prev.y))
    }
    pointers.current.set(e.pointerId, next)
  }

  const onPointerEnd = (e: ReactPointerEvent) => {
    pointers.current.delete(e.pointerId)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        role="img"
        aria-label="3D Rubik's cube"
        data-testid="cube-view"
        data-azimuth={view.azimuth}
        data-polar={view.polar}
        data-distance={view.distance}
        className="cursor-grab select-none rounded bg-slate-800"
        style={{ width: SIZE, height: SIZE, maxWidth: '100%', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        {!supported && <p className="p-4 text-sm text-slate-300">3D view unavailable (WebGL not supported).</p>}
      </div>
      <div className="flex gap-2">
        <button className="rounded bg-slate-600 px-3 py-1" aria-label="Zoom in" onClick={() => setView((v) => zoom(v, 0.8))}>
          +
        </button>
        <button className="rounded bg-slate-600 px-3 py-1" aria-label="Zoom out" onClick={() => setView((v) => zoom(v, 1.25))}>
          −
        </button>
      </div>
    </div>
  )
}
