import { useState } from 'react'
import { colorCounts, isCenter } from '../cube/edit'
import { FACES, type CubeState, type Face } from '../cube/state'
import { FACE_COLORS } from '../view/colors'

interface Props {
  cube: CubeState
  onSetSticker: (index: number, color: Face) => void
}

const NAMES: Record<Face, string> = {
  U: 'White',
  R: 'Red',
  F: 'Green',
  D: 'Yellow',
  L: 'Orange',
  B: 'Blue',
}

// Net layout: [row, column] of each face in the unfolded cross.
const NET: Record<Face, [number, number]> = {
  U: [0, 1],
  L: [1, 0],
  F: [1, 1],
  R: [1, 2],
  B: [1, 3],
  D: [2, 1],
}

const css = (face: Face) => `#${FACE_COLORS[face].toString(16).padStart(6, '0')}`

export default function CubeEditor({ cube, onSetSticker }: Props) {
  const [selected, setSelected] = useState<Face>('U')
  const counts = colorCounts(cube)

  return (
    <section aria-label="Cube editor" className="flex flex-col items-center gap-3">
      <div role="radiogroup" aria-label="Palette" className="flex flex-wrap justify-center gap-2">
        {FACES.map((face) => (
          <button
            key={face}
            type="button"
            role="radio"
            aria-checked={selected === face}
            aria-label={NAMES[face]}
            onClick={() => setSelected(face)}
            className={`flex flex-col items-center rounded border-2 px-2 py-1 text-xs ${
              selected === face ? 'border-white' : 'border-transparent'
            }`}
          >
            <span className="block h-6 w-6 rounded" style={{ background: css(face) }} />
            <span data-testid={`count-${face}`} className={counts[face] === 9 ? '' : 'text-red-400'}>
              {counts[face]}/9
            </span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1" data-testid="net">
        {FACES.map((face) => {
          const k = FACES.indexOf(face)
          const [row, col] = NET[face]
          return (
            <div
              key={face}
              className="grid grid-cols-3 gap-px"
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
            >
              {Array.from({ length: 9 }, (_, j) => {
                const i = 9 * k + j
                const center = isCenter(i)
                return (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${face} sticker ${j}`}
                    data-center={center}
                    data-color={cube[i]}
                    disabled={center}
                    onClick={() => onSetSticker(i, selected)}
                    className="h-6 w-6 border border-slate-900"
                    style={{ background: css(cube[i] as Face) }}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </section>
  )
}
