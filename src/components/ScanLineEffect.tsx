import React from 'react'

interface ScanlineEffectProps {
  color?: string
  lineSpacing?: number
  opacity?: number
  vignetteIntensity?: number
  vignetteSize?: number
  style?: React.CSSProperties
}

export function ScanlineEffect({
  color = 'rgba(102, 248, 4, 0.8)',
  lineSpacing = 3,
  opacity = 0.2,
  vignetteIntensity = 0.8,
  vignetteSize = 50,
  style = {},
}: ScanlineEffectProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent ${lineSpacing}px,
              ${color} ${lineSpacing}px,
              ${color} ${lineSpacing + 1}px
            )
          `,
          opacity: opacity,
          mixBlendMode: 'screen',
        }}
      />

      {/* Vignette layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(
              ellipse at center,
              transparent ${vignetteSize}%,
              rgba(0, 0, 0, ${vignetteIntensity}) 100%
            )
          `,
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  )
}
