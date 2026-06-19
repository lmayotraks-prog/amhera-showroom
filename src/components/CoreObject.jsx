import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Float } from '@react-three/drei'
import * as THREE from 'three'

function mapRange(value, start, end) {
  if (value <= start) return 0
  if (value >= end) return 1
  return (value - start) / (end - start)
}

// ─────────────────────────────────────────────────────────────────────────────
// Shader personalizado para el logo AMHERA:
// – Elimina el fondo blanco convirtiéndolo en transparente (chroma-key blanco)
// – Añade el brillo emissive en Acto IV
// – Controla la opacidad global para la fragmentación/ensamblaje
// ─────────────────────────────────────────────────────────────────────────────
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

    // Chroma-key blanco: cuanto más cercano al blanco puro, más transparente
    // Umbral ajustado para el logo cromo sobre fondo blanco
    float whiteness = min(tex.r, min(tex.g, tex.b));
    float brightness = (tex.r + tex.g + tex.b) / 3.0;

    // Detectar píxeles de fondo (muy claros y poco saturados)
    float saturation = max(tex.r, max(tex.g, tex.b)) - min(tex.r, min(tex.g, tex.b));
    float isBackground = smoothstep(0.82, 0.96, brightness) * (1.0 - saturation * 4.0);

    // Alpha: 0 en fondo blanco, 1 en el logo cromado
    float alpha = (1.0 - isBackground) * uOpacity;
    alpha = clamp(alpha, 0.0, 1.0);

    // En Acto IV, el logo se ilumina (toda la textura brilla hacia blanco)
    vec3 color = mix(tex.rgb, vec3(1.0), uEmissive * 0.6);

    gl_FragColor = vec4(color, alpha);
  }
`

// ─────────────────────────────────────────────────────────────────────────────
// LogoMesh: el logo AMHERA flotando en la escena 3D.
// Aspect ratio real del frame extraído: 512×389 → ~1.315
// ─────────────────────────────────────────────────────────────────────────────
function LogoMesh({ texture, scrollProgress }) {
  const meshRef    = useRef()
  const matRef     = useRef()

  const width  = 3.0
  const height = width / (512 / 389)  // mantener proporción exacta

  const uniforms = {
    uTexture:  { value: texture },
    uOpacity:  { value: 1.0 },
    uEmissive: { value: 0.0 },
  }

  useFrame(() => {
    const p = scrollProgress?.current ?? 0

    const disperseT = mapRange(p, 0.25, 0.55)
    const reformT   = mapRange(p, 0.55, 0.85)
    const ctaT      = mapRange(p, 0.85, 1.0)

    if (meshRef.current) {
      // Acto II: el logo se retira (Z) y encoge — las partículas explotan a su alrededor
      // Acto III: vuelve con elegancia
      // Acto IV: avanza dramáticamente hacia el espectador
      const targetZ = -disperseT * 1.0 + reformT * 0.7 + ctaT * 0.6
      const targetScale = 1.0 - disperseT * 0.2 + reformT * 0.15 + ctaT * 0.18

      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.04)
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.05))
    }

    if (matRef.current?.uniforms) {
      // Opacidad: alto en Actos I y III, bajo en Acto II (fragmentación)
      const targetOpacity = 1.0 - disperseT * 0.8 + reformT * 0.8
      matRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        matRef.current.uniforms.uOpacity.value,
        Math.min(1, Math.max(0, targetOpacity)),
        0.05
      )
      // Emissive: sube fuerte en Acto IV (el logo se convierte en luz pura)
      matRef.current.uniforms.uEmissive.value = THREE.MathUtils.lerp(
        matRef.current.uniforms.uEmissive.value,
        ctaT,
        0.05
      )
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
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

export default function CoreObject({ scrollProgress }) {
  const texture  = useTexture('/assets/logo-dark-frame.png')
  const lightRef = useRef()

  useFrame(() => {
    const p    = scrollProgress?.current ?? 0
    const ctaT = mapRange(p, 0.85, 1.0)
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        1.2 + ctaT * 5.0,
        0.05
      )
    }
  })

  return (
    <>
      <pointLight ref={lightRef} position={[0, 0, 2.5]} color="#f0f0ff" intensity={1.2} distance={7} />
      <Float speed={0.8} rotationIntensity={0.03} floatIntensity={0.55}>
        <LogoMesh texture={texture} scrollProgress={scrollProgress} />
      </Float>
    </>
  )
}
