import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function mapRange(value, start, end) {
  if (value <= start) return 0
  if (value >= end) return 1
  return (value - start) / (end - start)
}

export default function CoreObject({ scrollProgress }) {
  const meshRef = useRef()
  const matRef  = useRef()

  // Uniforms para el shader de distorsión
  const distortSpeed  = useRef(0.3)
  const distortAmount = useRef(0.08)

  useFrame((state) => {
    const p = scrollProgress?.current ?? 0
    const t = state.clock.elapsedTime

    const disperseT = mapRange(p, 0.25, 0.55)
    const reformT   = mapRange(p, 0.55, 0.85)
    const ctaT      = mapRange(p, 0.85, 1.0)

    if (meshRef.current) {
      // Rotación base — el exoesqueleto siempre rota, más rápido en el caos
      const speed = 0.08 + disperseT * 0.25 - reformT * 0.15
      meshRef.current.rotation.y = t * speed
      meshRef.current.rotation.x = Math.sin(t * 0.06) * 0.15 * (1 - ctaT * 0.8)

      // Escala: se contrae levemente en Fragmentación, crece en Ensamblaje
      const targetScale = 1 - disperseT * 0.18 + reformT * 0.12 + ctaT * 0.25
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.05)
      )
    }

    // Material: cambia de cromo frío → magenta caótico → dorado ensamblado → blanco luz
    if (matRef.current) {
      const heroColor   = new THREE.Color('#c0c0c8')   // cromo frío
      const chaosColor  = new THREE.Color('#8040a0')   // violeta oscuro (caos)
      const reformColor = new THREE.Color('#c8b890')   // dorado cromo (ensamblaje)
      const ctaColor    = new THREE.Color('#ffffff')   // luz pura

      let targetColor = heroColor.clone()
      targetColor.lerp(chaosColor,  disperseT * (1 - reformT))
      targetColor.lerp(reformColor, reformT)
      targetColor.lerp(ctaColor,    ctaT * 0.8)

      matRef.current.color.lerp(targetColor, 0.04)

      // Metalness: siempre máximo, pero emissive sube en Acto III y IV
      matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        matRef.current.emissiveIntensity,
        0.05 + reformT * 0.25 + ctaT * 0.6,
        0.05
      )
    }
  })

  return (
    // Float da el efecto de levitación sutil que define la "antigravedad" de AMHERA
    <Float speed={0.7} rotationIntensity={0.05} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        {/* TorusKnot — evoca un exoesqueleto, una pieza de joyería de precisión */}
        <torusKnotGeometry args={[1.0, 0.32, 200, 32, 2, 3]} />
        <meshPhysicalMaterial
          ref={matRef}
          color="#c0c0c8"
          metalness={1}
          roughness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.0}
          reflectivity={1}
          emissive="#404050"
          emissiveIntensity={0.05}
          envMapIntensity={2.5}
        />
      </mesh>
    </Float>
  )
}
