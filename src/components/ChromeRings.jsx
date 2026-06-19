// ChromeRings.jsx — refactorizado
//
// Cambios respecto a la versión anterior:
// 1. Ya NO calcula introT/ringReveal/disperseT/reformT por su cuenta — los recibe
//    de getActs(scrollProgress), la misma fuente que usan CoreObject y
//    Experience. Si mañana cambias ACT_BOUNDARIES en useActs.js, los anillos,
//    el logo y las luces se mueven juntos automáticamente.
// 2. lerp -> dampLerp con delta, para que la velocidad de aparición/expansión
//    de los anillos no dependa del framerate del dispositivo.

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getActs, dampLerp } from './useActs'

export default function ChromeRings({ scrollProgress }) {
  const ring1 = useRef()
  const ring2 = useRef()
  const ring3 = useRef()
  const groupRef = useRef()

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const { ringReveal, disperseT, reformT } = getActs(scrollProgress)

    // Los anillos se expanden en Acto II y vuelven en Acto III
    const baseScale   = 1 + disperseT * 0.7 - reformT * 0.35
    const scaleTarget = Math.max(0.1, baseScale)

    // Escala global del grupo: 0 al inicio -> 1 cuando el logo se achica y los
    // anillos deben revelarse. lambda=6 da una aparición suave.
    if (groupRef.current) {
      const groupScale = dampLerp(groupRef.current.scale.x, ringReveal, 6, delta)
      groupRef.current.scale.setScalar(groupScale)
    }

    const applyRing = (ref, rotSpeedX, rotSpeedZ, rotSpeedY, scaleMultiplier, disperseRotAxis) => {
      if (!ref.current) return

      // Rotaciones base + un empujón extra durante la fragmentación (Acto II)
      if (disperseRotAxis === 'x') ref.current.rotation.x = t * rotSpeedX + disperseT * Math.PI * 0.5
      else ref.current.rotation.x = t * rotSpeedX

      if (disperseRotAxis === 'y') ref.current.rotation.y = t * rotSpeedY - disperseT * Math.PI * 0.3
      else if (rotSpeedY) ref.current.rotation.y = t * rotSpeedY + disperseT * Math.PI * 0.2

      ref.current.rotation.z = t * rotSpeedZ

      const s = Math.max(0.1, scaleTarget * scaleMultiplier)
      const dampedScale = dampLerp(ref.current.scale.x, s, 5, delta)
      ref.current.scale.setScalar(dampedScale)

      if (ref.current.material) {
        ref.current.material.opacity = dampLerp(ref.current.material.opacity, ringReveal, 6, delta)
      }
    }

    applyRing(ring1, 0.35, 0.12, 0, 1, 'x')
    applyRing(ring2, 0, -0.15, 0.28, 1.25, 'y')
    applyRing(ring3, -0.22, 0, 0.18, 0.8, 'x')
  })

  // Material cromo reutilizable — antes se repetía idéntico 3 veces inline
  const chromeMat = (emissiveIntensity) => (
    <meshStandardMaterial
      color="#d1d5db"
      metalness={1}
      roughness={0.0}
      emissive="#a0a0b0"
      emissiveIntensity={emissiveIntensity}
      transparent
      opacity={0}
    />
  )

  return (
    <group ref={groupRef} scale={[0, 0, 0]}>
      {/* Anillo principal — cromo vivo */}
      <mesh ref={ring1}>
        <torusGeometry args={[2.2, 0.01, 16, 200]} />
        {chromeMat(0.4)}
      </mesh>

      {/* Anillo exterior — más sutil */}
      <mesh ref={ring2}>
        <torusGeometry args={[2.8, 0.006, 16, 240]} />
        {chromeMat(0.15)}
      </mesh>

      {/* Anillo interior — de precisión */}
      <mesh ref={ring3}>
        <torusGeometry args={[1.6, 0.014, 16, 160]} />
        {chromeMat(0.3)}
      </mesh>
    </group>
  )
}
