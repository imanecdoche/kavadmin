import React from 'react'

/**
 * 🕸️ Pure SVG Radar / Spider Chart for Academic Competency Visualization
 * Zero external library dependencies - 100% vector based and optimized for jsPDF & html2canvas rendering.
 *
 * @param {Array} competencies Array of competency items with { label, shortLabel, score }
 * @param {number} size Width & Height in pixels (default: 320)
 * @param {string} accentColor Hex primary accent (default: '#0078D4')
 */
export default function ReportRadarChart({
  competencies = [],
  size = 320,
  accentColor = '#0078D4',
  className = ''
}) {
  const safeData = competencies && competencies.length >= 3 ? competencies : [
    { label: 'Grammar', shortLabel: 'Grammar', score: 80 },
    { label: 'Vocabulary', shortLabel: 'Vocab', score: 80 },
    { label: 'Speaking', shortLabel: 'Speaking', score: 80 },
    { label: 'Listening', shortLabel: 'Listening', score: 80 },
    { label: 'Discipline', shortLabel: 'Discipline', score: 80 }
  ]

  const numAxes = safeData.length
  const cx = 160
  const cy = 160
  const radius = 95
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0]

  // Calculate polygon points for each concentric level
  const getLevelPolygonPoints = (levelRatio) => {
    return Array.from({ length: numAxes }).map((_, i) => {
      const angle = (2 * Math.PI / numAxes) * i - Math.PI / 2
      const x = cx + radius * levelRatio * Math.cos(angle)
      const y = cy + radius * levelRatio * Math.sin(angle)
      return `${x.toFixed(2)},${y.toFixed(2)}`
    }).join(' ')
  }

  // Calculate data polygon vertices
  const dataPoints = safeData.map((item, i) => {
    const angle = (2 * Math.PI / numAxes) * i - Math.PI / 2
    const scoreRatio = Math.max(0, Math.min(100, Number(item.score) || 0)) / 100
    const x = cx + radius * scoreRatio * Math.cos(angle)
    const y = cy + radius * scoreRatio * Math.sin(angle)
    return {
      x,
      y,
      score: item.score,
      label: item.shortLabel || item.label || `Skill ${i + 1}`,
      fullLabel: item.label,
      angle
    }
  })

  const dataPolygonString = dataPoints.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 320"
        width={size}
        height={size}
        className="overflow-visible drop-shadow-2xs"
        aria-label="Academic Competency Radar Chart"
      >
        <defs>
          {/* Subtle gradient fill for data polygon */}
          <radialGradient id="radarAreaGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.18" />
          </radialGradient>
          <filter id="pointShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Concentric Guideline Polygons */}
        {levels.map((level, idx) => (
          <polygon
            key={`level-${idx}`}
            points={getLevelPolygonPoints(level)}
            fill={idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF'}
            stroke="#E2E8F0"
            strokeWidth={idx === levels.length - 1 ? '1.5' : '1'}
            strokeDasharray={idx === levels.length - 1 ? 'none' : '3 3'}
          />
        ))}

        {/* Percentage scale markers on the top vertical axis */}
        {levels.map((level, idx) => {
          const yPos = cy - radius * level
          return (
            <text
              key={`marker-${idx}`}
              x={cx + 4}
              y={yPos - 2}
              fontSize="7.5"
              fill="#94A3B8"
              fontFamily="Segoe UI, -apple-system, sans-serif"
              fontWeight="600"
            >
              {Math.round(level * 100)}
            </text>
          )
        })}

        {/* Radial Axis Spokes radiating from center */}
        {safeData.map((_, i) => {
          const angle = (2 * Math.PI / numAxes) * i - Math.PI / 2
          const outerX = cx + radius * Math.cos(angle)
          const outerY = cy + radius * Math.sin(angle)
          return (
            <line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={outerX}
              y2={outerY}
              stroke="#CBD5E1"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
          )
        })}

        {/* Center Point Pivot */}
        <circle cx={cx} cy={cy} r="2.5" fill="#94A3B8" />

        {/* Data Area Polygon */}
        <polygon
          points={dataPolygonString}
          fill="url(#radarAreaGradient)"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Vertex Data Point Circles */}
        {dataPoints.map((point, idx) => (
          <g key={`point-${idx}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4.5"
              fill={accentColor}
              stroke="#FFFFFF"
              strokeWidth="2"
              filter="url(#pointShadow)"
            />
          </g>
        ))}

        {/* Dynamic Labels & Score Badges around Perimeter */}
        {dataPoints.map((point, idx) => {
          const labelDist = radius + 24
          const lx = cx + labelDist * Math.cos(point.angle)
          const ly = cy + labelDist * Math.sin(point.angle)

          // Determine alignment based on angular position
          let textAnchor = 'middle'
          let xOffset = 0
          let yOffset = 0

          const cosVal = Math.cos(point.angle)
          const sinVal = Math.sin(point.angle)

          if (Math.abs(cosVal) < 0.2) {
            textAnchor = 'middle'
            yOffset = sinVal < 0 ? -4 : 10
          } else if (cosVal > 0) {
            textAnchor = 'start'
            xOffset = 4
          } else {
            textAnchor = 'end'
            xOffset = -4
          }

          return (
            <g key={`label-${idx}`} transform={`translate(${lx + xOffset}, ${ly + yOffset})`}>
              <text
                x="0"
                y="0"
                textAnchor={textAnchor}
                fontSize="9"
                fontWeight="700"
                fill="#1E293B"
                fontFamily="Segoe UI, -apple-system, sans-serif"
                className="select-none"
              >
                {point.label}
              </text>
              <text
                x="0"
                y="10"
                textAnchor={textAnchor}
                fontSize="8.5"
                fontWeight="800"
                fill={accentColor}
                fontFamily="JetBrains Mono, monospace"
                className="select-none"
              >
                {point.score} / 100
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
