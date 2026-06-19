// CoreObject.jsx — refactorizado
//
// Cambios respecto a la versión anterior:
// 1. introT/disperseT/reformT ya no se recalculan dos veces en este mismo
//    archivo — ambos leen getActs(scrollProgress), fuente única de verdad.
// 2. lerp fijo -> dampLerp con delta (independiente del framerate).
// 3. NUEVO: <LogoMesh3D> opcional, un logo extruido en geometría 3D real
//    (no un plano con textura) que aparece via crossfade SOLO en el Acto IV.
//    Está detrás de un flag para activarlo cuando se tenga el SVG del logo.

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Float } from '@react-three/drei'
import * as THREE from 'three'
import { getActs, dampLerp } from './useActs'

// ─────────────────────────────────────────────────────────────────────────
// Shader: chroma-key blanco + opacidad + emissive controlados
// ─────────────────────────────────────────────────────────────────────────
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uEmissive;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uTexture, vUv);

    float brightness = (tex.r + tex.g + tex.b) / 3.0;
    float saturation = max(tex.r, max(tex.g, tex.b)) - min(tex.r, min(tex.g, tex.b));
    float isBackground = smoothstep(0.82, 0.96, brightness) * (1.0 - saturation * 4.0);

    float alpha = (1.0 - isBackground) * uOpacity;
    alpha = clamp(alpha, 0.0, 1.0);

    // Emissive sutil — no quema, solo realza levemente los brillos del cromo
    vec3 color = mix(tex.rgb, vec3(1.0), uEmissive * 0.3);

    gl_FragColor = vec4(color, alpha);
  }
`

// ─────────────────────────────────────────────────────────────────────────
// LogoMesh — el logo cromo AMHERA flotando (plano + shader, Actos I-III).
// ─────────────────────────────────────────────────────────────────────────
function LogoMesh({ texture, scrollProgress }) {
  const meshRef = useRef()
  const matRef  = useRef()

  const width  = 3.0
  const height = width / (512 / 389)

  const uniforms = {
    uTexture:  { value: texture },
    uOpacity:  { value: 1.0 },
    uEmissive: { value: 0.0 },
  }

  useFrame((state, delta) => {
    const { introT, disperseT, reformT, ctaT } = getActs(scrollProgress)

    if (meshRef.current) {
      // Inicio: logo grande (scale 1.25) y cercano (Z +0.6)
      // Al scrollear baja a tamaño normal y se aleja
      const targetZ     = introT * 0.6 - disperseT * 1.0 + reformT * 1.0
      const targetScale = 1.0 + introT * 0.25 - disperseT * 0.2 + reformT * 0.2

      meshRef.current.position.z = dampLerp(meshRef.current.position.z, targetZ, 4, delta)
      meshRef.current.scale.setScalar(dampLerp(meshRef.current.scale.x, targetScale, 5, delta))
    }

    if (matRef.current?.uniforms) {
      // Opacidad: alta en I y III, baja en II.
      // En Acto IV (ctaT) el plano se desvanece — el logo 3D real toma el relevo.
      const targetOpacity = (1.0 - disperseT * 0.8 + reformT * 0.8) * (1.0 - ctaT)
      matRef.current.uniforms.uOpacity.value = dampLerp(
        matRef.current.uniforms.uOpacity.value,
        Math.min(1, Math.max(0, targetOpacity)),
        5,
        delta
      )

      // Emissive muy bajo — solo un toque sutil, no quema el logo
      matRef.current.uniforms.uEmissive.value = dampLerp(
        matRef.current.uniforms.uEmissive.value,
        introT * 0.15,
        5,
        delta
      )
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// LogoMesh3D — logo extruido en geometría 3D real, SOLO para el Acto IV.
//
// CÓMO ACTIVARLO:
// 1. Exporta el logo AMHERA como SVG de un solo trazo (contorno limpio).
// 2. Conviértelo a un THREE.Shape / THREE.ExtrudeGeometry, o usa
//    SVGLoader de three/examples/jsm/loaders/SVGLoader.js para generar las
//    shapes automáticamente desde el SVG.
// 3. Sustituye el placeholder de abajo (un icosaedro) por esa geometría.
//
// Mientras no tengas el SVG listo, este componente no se monta (ver flag
// SHOW_3D_LOGO) y todo sigue funcionando exactamente igual que antes.
// ─────────────────────────────────────────────────────────────────────────
function LogoMesh3D({ scrollProgress }) {
  const meshRef = useRef()
  const matRef  = useRef()

  useFrame((state, delta) => {
    const { ctaT } = getActs(scrollProgress)

    if (meshRef.current) {
      const targetScale = ctaT * 1.2
      meshRef.current.scale.setScalar(dampLerp(meshRef.current.scale.x, targetScale, 4, delta))
      meshRef.current.rotation.y += delta * 0.2
    }

    if (matRef.current) {
      matRef.current.opacity = dampLerp(matRef.current.opacity, ctaT, 5, delta)
    }
  })

  return (
    <mesh ref={meshRef} scale={[0, 0, 0]}>
      {/* PLACEHOLDER — sustituir por ExtrudeGeometry del logo real */}
      <icosahedronGeometry args={[0.8, 2]} />
      <meshStandardMaterial
        ref={matRef}
        color="#d1d5db"
        metalness={1}
        roughness={0.05}
        emissive="#ffffff"
        emissiveIntensity={0.2}
        transparent
        opacity={0}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// CoreObject — punto de entrada
// ─────────────────────────────────────────────────────────────────────────
const SHOW_3D_LOGO = false // activar a true cuando tengas la geometría real del logo

export default function CoreObject({ scrollProgress }) {
  // Carga la textura del logo internamente
  const texture  = useTexture('/assets/logo-dark-frame.png')
  const lightRef = useRef()

  useFrame((state, delta) => {
    const { introT } = getActs(scrollProgress)

    if (lightRef.current) {
      // Luz suave — realza el cromo sin quemarlo
      const targetIntensity = 1.5 + introT * 1.0
      lightRef.current.intensity = dampLerp(lightRef.current.intensity, targetIntensity, 5, delta)
    }
  })

  return (
    <>
      <pointLight ref={lightRef} position={[0, 0, 2.5]} color="#f0f0ff" intensity={1.5} distance={7} />
      <Float speed={0.8} rotationIntensity={0.03} floatIntensity={0.55}>
        <LogoMesh texture={texture} scrollProgress={scrollProgress} />
        {SHOW_3D_LOGO && <LogoMesh3D scrollProgress={scrollProgress} />}
      </Float>
    </>
  )
}
