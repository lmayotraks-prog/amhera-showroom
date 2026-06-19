import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import ChromeParticles from './ChromeParticles'
import ChromeRings from './ChromeRings'
import CoreObject from './CoreObject'

// mapRange: mismo patrón en todos los componentes
function mapRange(value, start, end) {
  if (value <= start) return 0
  if (value >= end) return 1
  return (value - start) / (end - start)
}

export default function Experience({ scrollProgress, mousePos, isLowEnd }) {
  const { camera } = useThree()
  const groupRef        = useRef()
  const lightMainRef    = useRef()
  const lightChaosRef   = useRef()
  const lightReformRef  = useRef()

  useFrame((state, delta) => {
    const p = scrollProgress?.current ?? 0

    // ── Los 4 Actos de AMHERA ────────────────────────────────────────────
    // Acto I:  Hero       (0% → 25%)  → cromo frío, cámara frontal
    // Acto II: Visión     (25% → 55%) → fragmentación, caos cromado
    // Acto III:Collection (55% → 85%) → ensamblaje, claridad dorada
    // Acto IV: Access     (85% → 100%)→ zoom extremo, luz pura
    const disperseT = mapRange(p, 0.25, 0.55)
    const reformT   = mapRange(p, 0.55, 0.85)
    const ctaT      = mapRange(p, 0.85, 1.0)

    // ── Parallax de cursor sobre el grupo 3D ─────────────────────────────
    if (groupRef.current && mousePos) {
      const targetX = mousePos.current.y *  0.06
      const targetY = mousePos.current.x *  0.06
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.04)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.04)
    }

    // ── Movimiento de cámara ──────────────────────────────────────────────
    // Acto I:   frontal, distante, majestuoso
    // Acto II:  orbita lateralmente (caos / desorientación)
    // Acto III: vuelve al eje frontal (orden)
    // Acto IV:  zoom dramático extremo
    const angle      = disperseT * Math.PI * 0.35 - reformT * Math.PI * 0.2
    const radius     = 5.0 - disperseT * 0.5 + reformT * 0.3
    const targetCamX = Math.sin(angle) * radius * 0.5
    const targetCamY = 1.5 - disperseT * 1.0 + reformT * 0.6
    const targetCamZ = Math.cos(angle) * radius - ctaT * 2.8

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.035)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.035)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.035)
    camera.lookAt(0, 0, 0)

    // ── Iluminación dinámica por acto ─────────────────────────────────────
    // Luz principal (blanca/plateada): siempre activa, varía intensidad
    if (lightMainRef.current) {
      const intensity = 2.0 + ctaT * 6.0
      lightMainRef.current.intensity = THREE.MathUtils.lerp(lightMainRef.current.intensity, intensity, 0.05)
    }
    // Luz de caos (violeta): sube en Acto II
    if (lightChaosRef.current) {
      const intensity = disperseT * 12 * (1 - reformT)
      lightChaosRef.current.intensity = THREE.MathUtils.lerp(lightChaosRef.current.intensity, intensity, 0.05)
    }
    // Luz de ensamblaje (dorada): sube en Acto III
    if (lightReformRef.current) {
      const intensity = reformT * 10 - ctaT * 5
      lightReformRef.current.intensity = THREE.MathUtils.lerp(lightReformRef.current.intensity, Math.max(0, intensity), 0.05)
    }
  })

  return (
    <>
      {/* Iluminación AMHERA */}
      <ambientLight intensity={0.08} />
      <directionalLight position={[3, 6, 4]}   intensity={1.8} castShadow />
      <pointLight ref={lightMainRef}  position={[0, 4, 0]}     color="#e0e0f0" intensity={2}  distance={15} />
      <pointLight ref={lightChaosRef} position={[-5, 2, -3]}   color="#6020a0" intensity={0}  distance={14} />
      <pointLight ref={lightReformRef} position={[5, -2, 3]}   color="#c8b060" intensity={0}  distance={14} />
      <pointLight                      position={[0, -4, 0]}   color="#404060" intensity={3}  distance={10} />

      {/* Environment map de estudio — refleja en el cromo del objeto */}
      <Environment preset="studio" />

      {/* Partículas cromadas — scroll-driven, cantidad reducida para perf */}
      <ChromeParticles count={isLowEnd ? 800 : 2500} scrollProgress={scrollProgress} />

      {/* Grupo con parallax de cursor */}
      <group ref={groupRef}>
        <ChromeRings scrollProgress={scrollProgress} />
        <CoreObject   scrollProgress={scrollProgress} />
      </group>

      {/* Suelo espejo oscuro */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color="#030303"
          roughness={0.01}
          metalness={1.0}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Post-processing — bloom cromado característico de AMHERA */}
      <EffectComposer>
        <Bloom
          intensity={isLowEnd ? 0.8 : 1.6}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0004, 0.0004]}
        />
        <Vignette
          offset={0.35}
          darkness={0.75}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </>
  )
}
