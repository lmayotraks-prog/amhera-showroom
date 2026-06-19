import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─────────────────────────────────────────────────────────────────────────────
// Hero — Luxury minimal.
// Solo el nombre masivo "AMHERA" como backdrop tipográfico.
// El logo 3D flota en primer plano (canvas fijo).
// Al scrollear: el texto se ALEJA (scale down + opacity 0) = efecto zoom-out luxury.
// ─────────────────────────────────────────────────────────────────────────────
export default function Hero() {
  const sectionRef  = useRef()
  const titleRef    = useRef()
  const taglineRef  = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Entrada inmediata (más rápida, más luxury) ──────────────────────
      const tl = gsap.timeline({ delay: 0.15 })
      tl.from(titleRef.current, {
          opacity: 0,
          scale: 1.08,
          duration: 0.9,
          ease: 'power3.out',
        })
        .from(taglineRef.current, {
          opacity: 0,
          y: 12,
          duration: 0.6,
          ease: 'power2.out',
        }, '-=0.5')

      // ── Scroll: el texto se aleja → efecto "zoom back" luxury ──────────
      // (inverso al clásico: en vez de subir, se achica y desvanece)
      gsap.to(titleRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '50% top',
          scrub: 1.0,
        },
        scale: 0.88,
        opacity: 0,
        ease: 'none',
      })
      gsap.to(taglineRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '35% top',
          scrub: 0.8,
        },
        opacity: 0,
        ease: 'none',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      className="section hero"
      ref={sectionRef}
      style={{ minHeight: '100vh', pointerEvents: 'none' }}
    >
      {/* Nombre masivo — referencia imagen 2: texto enorme de fondo */}
      <h1 ref={titleRef} className="hero__name-bg">AMHERA</h1>

      {/* Tagline mínimo — solo letras pequeñas debajo */}
      <p ref={taglineRef} className="hero__tagline-only">
        Haute Couture of the Future
      </p>
    </section>
  )
}
