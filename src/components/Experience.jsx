// Experience.jsx — refactorizado
//
// Punto de montaje de toda la escena 3D AMHERA.
// Cambios:
// 1. getActs(scrollProgress) centralizado — fuente única de verdad.
// 2. lerp -> dampLerp con delta — independiente del framerate.
// 3. Mantiene TODO lo visual del commit d50f898: cámara, parallax mouse,
//    Environment, partículas, suelo espejo, Bloom, ChromaticAberration, Vignette.

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { getActs, dampLerp } from './useActs'
import ChromeParticles from './ChromeParticles'
import ChromeRings from './ChromeRings'
import CoreObject from './CoreObject'

export default function Experience({ scrollProgress, mousePos, isLowEnd }) {
  const { camera } = useThree()
  const groupRef        = useRef()
  const lightMainRef    = useRef()
  const lightChaosRef   = useRef()
  const lightReformRef  = useRef()

  useFrame((state, delta) => {
    const { disperseT, reformT, ctaT } = getActs(scrollProgress)

    // ── Parallax de cursor sobre el grupo 3D ─────────────────────────────
    if (groupRef.current && mousePos) {
      const targetX = mousePos.current.y *  0.06
      const targetY = mousePos.current.x *  0.06
      groupRef.current.rotation.x = dampLerp(groupRef.current.rotation.x, targetX, 4, delta)
      groupRef.current.rotation.y = dampLerp(groupRef.current.rotation.y, targetY, 4, delta)
    }

    // ── Movimiento de cámara ──────────────────────────────────────────────
    const angle      = disperseT * Math.PI * 0.35 - reformT * Math.PI * 0.2
    const radius     = 5.0 - disperseT * 0.5 + reformT * 0.3
    const targetCamX = Math.sin(angle) * radius * 0.5
    const targetCamY = 1.5 - disperseT * 1.0 + reformT * 0.6
    const targetCamZ = Math.cos(angle) * radius - ctaT * 2.8

    camera.position.x = dampLerp(camera.position.x, targetCamX, 3.5, delta)
    camera.position.y = dampLerp(camera.position.y, targetCamY, 3.5, delta)
    camera.position.z = dampLerp(camera.position.z, targetCamZ, 3.5, delta)
    camera.lookAt(0, 0, 0)

    // ── Iluminación dinámica por acto ─────────────────────────────────────
    if (lightMainRef.current) {
      const intensity = 2.0 + ctaT * 3.0
      lightMainRef.current.intensity = dampLerp(lightMainRef.current.intensity, intensity, 5, delta)
    }
    if (lightChaosRef.current) {
      const intensity = disperseT * 12 * (1 - reformT)
      lightChaosRef.current.intensity = dampLerp(lightChaosRef.current.intensity, intensity, 5, delta)
    }
    if (lightReformRef.current) {
      const intensity = reformT * 10 - ctaT * 5
      lightReformRef.current.intensity = dampLerp(lightReformRef.current.intensity, Math.max(0, intensity), 5, delta)
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
