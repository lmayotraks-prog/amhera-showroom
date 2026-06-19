// ChromeParticles.jsx — refactorizado
//
// Cambios: usa getActs para timing centralizado.
// Nota: dampLerp NO se aplica aquí porque las partículas actualizan posición
// directamente (sin interpolación), lo cual es correcto para este caso —
// la interpolación es el propio cálculo de spread/collapse.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getActs } from './useActs'

export default function ChromeParticles({ count = 4000, scrollProgress }) {
  const mesh = useRef()

  const { positions, originalPositions, colors } = useMemo(() => {
    const positions         = new Float32Array(count * 3)
    const originalPositions = new Float32Array(count * 3)
    const colors            = new Float32Array(count * 3)

    // Paleta cromo AMHERA
    const chromeColors = [
      new THREE.Color('#d1d5db'),
      new THREE.Color('#f0f0f0'),
      new THREE.Color('#c0c0c0'),
      new THREE.Color('#888898'),
      new THREE.Color('#ffffff'),
    ]

    for (let i = 0; i < count; i++) {
      // Distribución esférica con radio variable
      const r     = 3.5 + Math.random() * 9
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      positions[i * 3]     = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      originalPositions[i * 3]     = x
      originalPositions[i * 3 + 1] = y
      originalPositions[i * 3 + 2] = z

      const c = chromeColors[Math.floor(Math.random() * chromeColors.length)]
      colors[i * 3]     = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    return { positions, originalPositions, colors }
  }, [count])

  useFrame((state) => {
    if (!mesh.current || !scrollProgress) return

    const { disperseT, reformT, ctaT } = getActs(scrollProgress)

    const dispersionAmount = disperseT * (1 - reformT * 0.95)
    const collapseAmount   = ctaT * 0.8

    const posAttr = mesh.current.geometry.attributes.position

    for (let i = 0; i < count; i++) {
      const ox = originalPositions[i * 3]
      const oy = originalPositions[i * 3 + 1]
      const oz = originalPositions[i * 3 + 2]

      const len  = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1
      const dirX = ox / len
      const dirY = oy / len
      const dirZ = oz / len

      const spread   = dispersionAmount * 6.0
      const collapse = collapseAmount * len * 0.85

      posAttr.array[i * 3]     = ox + dirX * spread - dirX * collapse
      posAttr.array[i * 3 + 1] = oy + dirY * spread - dirY * collapse
      posAttr.array[i * 3 + 2] = oz + dirZ * spread - dirZ * collapse
    }

    posAttr.needsUpdate = true

    // Rotación base — se frena durante la dispersión
    const rotSpeed = 0.03 * (1 - dispersionAmount * 0.8)
    mesh.current.rotation.y = state.clock.elapsedTime * rotSpeed
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.08
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]}    />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
