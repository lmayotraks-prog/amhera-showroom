import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function mapRange(value, start, end) {
  if (value <= start) return 0
  if (value >= end) return 1
  return (value - start) / (end - start)
}

export default function ChromeRings({ scrollProgress }) {
  const ring1 = useRef()
  const ring2 = useRef()
  const ring3 = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const p = scrollProgress?.current ?? 0

    const disperseT = mapRange(p, 0.25, 0.55)
    const reformT   = mapRange(p, 0.55, 0.85)
    const ctaT      = mapRange(p, 0.85, 1.0)

    // Los anillos se expanden dramáticamente en Acto II (Fragmentación)
    // y vuelven a su posición en Acto III, luego se contraen en Acto IV
    const baseScale   = 1 + disperseT * 0.7 - reformT * 0.35 - ctaT * 0.3
    const scaleTarget = Math.max(0.1, baseScale)

    if (ring1.current) {
      ring1.current.rotation.x = t * 0.35 + disperseT * Math.PI * 0.5
      ring1.current.rotation.z = t * 0.12
      ring1.current.scale.lerp(
        new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget),
        0.05
      )
    }
    if (ring2.current) {
      ring2.current.rotation.y = t * 0.28 - disperseT * Math.PI * 0.3
      ring2.current.rotation.z = -t * 0.15
      const s2 = Math.max(0.1, scaleTarget * 1.25)
      ring2.current.scale.lerp(new THREE.Vector3(s2, s2, s2), 0.05)
    }
    if (ring3.current) {
      ring3.current.rotation.x = -t * 0.22
      ring3.current.rotation.y = t * 0.18 + disperseT * Math.PI * 0.2
      const s3 = Math.max(0.1, scaleTarget * 0.8)
      ring3.current.scale.lerp(new THREE.Vector3(s3, s3, s3), 0.05)
    }
  })

  // Material cromo espejo — chrome perfecto
  const chromeMat = (emissiveIntensity = 0.2) => (
    <meshStandardMaterial
      color="#d1d5db"
      metalness={1}
      roughness={0.0}
      emissive="#a0a0b0"
      emissiveIntensity={emissiveIntensity}
    />
  )

  return (
    <>
      {/* Anillo principal — cromo vivo */}
      <mesh ref={ring1}>
        <torusGeometry args={[2.2, 0.010, 16, 200]} />
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
    </>
  )
}
