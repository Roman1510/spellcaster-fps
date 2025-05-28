import { BufferGeometry, Float32BufferAttribute, Color } from 'three'

export const createSmokeGeometry = (): BufferGeometry => {
  const geometry = new BufferGeometry()
  const positions = []

  for (let i = 0; i < 15; i++) {
    const angle1 = ((Math.PI * 2) / 15) * i + (Math.random() - 0.5) * 0.5
    const angle2 = Math.random() * Math.PI - Math.PI / 2

    const startRadius = Math.random() * 0.8
    const startAngle = Math.random() * Math.PI * 2
    positions.push(
      Math.cos(startAngle) * startRadius,
      (Math.random() - 0.5) * 0.6,
      Math.sin(startAngle) * startRadius
    )

    const length = 3 + Math.random() * 4
    positions.push(
      Math.cos(angle1) * Math.cos(angle2) * length,
      Math.sin(angle2) * length + Math.random() * 2,
      Math.sin(angle1) * Math.cos(angle2) * length
    )
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

export const createFireParticleGeometry = (): BufferGeometry => {
  const geometry = new BufferGeometry()
  const positions = []
  const colors = []

  for (let i = 0; i < 100; i++) {
    const radius = Math.random() * 6
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    )

    const fireIntensity = Math.random()
    const color = new Color()
    if (fireIntensity > 0.8) {
      color.setHSL(0.18, 1, 0.9)
    } else if (fireIntensity > 0.6) {
      color.setHSL(0.12, 1, 0.8)
    } else if (fireIntensity > 0.3) {
      color.setHSL(0.06, 1, 0.7)
    } else {
      color.setHSL(0.01, 1, 0.6)
    }
    colors.push(color.r, color.g, color.b)
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  return geometry
}
