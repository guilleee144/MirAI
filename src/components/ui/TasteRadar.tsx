// src/components/ui/TasteRadar.tsx
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg'

export interface RadarDatum {
  label: string
  /** 0-100 */
  value: number
}

interface TasteRadarProps {
  data: RadarDatum[]
  size: number
  color: string
}

const LEVELS = [25, 50, 75, 100]
const MAX_LABEL_LENGTH = 9

function shortLabel(label: string): string {
  const text = label.charAt(0).toUpperCase() + label.slice(1)
  return text.length > MAX_LABEL_LENGTH ? `${text.slice(0, MAX_LABEL_LENGTH - 1)}…` : text
}

export function TasteRadar({ data, size, color }: TasteRadarProps) {
  if (data.length < 3) return null

  const center = size / 2
  const radius = size * 0.26
  const labelRadius = radius * 1.5
  const step = 360 / data.length

  const point = (index: number, percent: number, r: number) => {
    const angle = (index * step - 90) * (Math.PI / 180)
    const distance = (percent / 100) * r
    return { x: center + distance * Math.cos(angle), y: center + distance * Math.sin(angle) }
  }

  const shape = data.map((datum, i) => point(i, datum.value, radius))

  return (
    <Svg width={size} height={size}>
      {LEVELS.map((level) => (
        <Polygon
          key={level}
          points={data.map((_, i) => point(i, level, radius)).map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      {data.map((_, i) => {
        const outer = point(i, 100, radius)
        return <Line key={i} x1={center} y1={center} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      })}
      <Polygon points={shape.map((p) => `${p.x},${p.y}`).join(' ')} fill={`${color}40`} stroke={color} strokeWidth="2" />
      {shape.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
      ))}
      {data.map((datum, i) => {
        const pos = point(i, 100, labelRadius)
        return (
          <SvgText key={datum.label} x={pos.x} y={pos.y} fill="#B8C1D1" fontSize="8.5" textAnchor="middle" alignmentBaseline="middle">
            {shortLabel(datum.label)}
          </SvgText>
        )
      })}
    </Svg>
  )
}
