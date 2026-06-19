import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Experience  from './components/Experience'
import Loader      from './components/Loader'
import Hero        from './sections/Hero'
import Vision      from './sections/Vision'
import Collection  from './sections/Collection'
import Access      from './sections/Access'
import './index.css'

gsap.registerPlugin(ScrollTrigger)

// Detección de capacidad del dispositivo — una sola vez al cargar
const isLowEnd = typeof navigator !== 'undefined' && navigator.hardwareConcurrency < 4

export default function App() {
  const [loaded, setLoaded]   = useState(false)
  const scrollProgress        = useRef(0)   // 0→1, sin re-renders
  const mousePos              = useRef({ x: 0, y: 0 })

  const cursorRef     = useRef()
  const followerRef   = useRef()
  const progressRef   = useRef()

  const handleLoaded  = useCallback(() => setLoaded(true), [])

  useEffect(() => {
    if (!loaded) return

    // ── Smooth scroll con Lenis ─────────────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    // ── Progreso de scroll (ScrollTrigger sincronizado con Lenis) ───────────
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollProgress.current = self.progress
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${self.progress})`
        }
      },
    })

    // ── Mouse normalizado [-1, 1] para el parallax 3D ──────────────────────
    const onMouseMove = (e) => {
      mousePos.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mousePos.current.y = (e.clientY / window.innerHeight - 0.5) * 2

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      }
    }

    // Cursor follower con lag
    let followerX = 0, followerY = 0, rafId
    const animateFollower = () => {
      const mx = (mousePos.current.x + 1) / 2 * window.innerWidth
      const my = (mousePos.current.y + 1) / 2 * window.innerHeight
      followerX += (mx - followerX - 18) * 0.1
      followerY += (my - followerY - 18) * 0.1
      if (followerRef.current) {
        followerRef.current.style.transform = `translate(${followerX}px, ${followerY}px)`
      }
      rafId = requestAnimationFrame(animateFollower)
    }

    window.addEventListener('mousemove', onMouseMove)
    rafId = requestAnimationFrame(animateFollower)

    // Cursor crece al pasar sobre interactivos
    const interactives = document.querySelectorAll('button, a, input')
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        gsap.to(followerRef.current, { width: 60, height: 60, borderColor: 'rgba(192,192,200,0.7)', duration: 0.3 })
        gsap.to(cursorRef.current,   { opacity: 0, duration: 0.2 })
      })
      el.addEventListener('mouseleave', () => {
        gsap.to(followerRef.current, { width: 36, height: 36, borderColor: 'rgba(192,192,200,0.4)', duration: 0.3 })
        gsap.to(cursorRef.current,   { opacity: 1, duration: 0.2 })
      })
    })

    return () => {
      lenis.destroy()
      trigger.kill()
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [loaded])

  return (
    <>
      {/* ── Loader AMHERA ──────────────────────────────────────────────── */}
      {!loaded && <Loader onComplete={handleLoaded} />}

      {/* ── Barra de progreso cromo ────────────────────────────────────── */}
      <div className="scroll-progress" ref={progressRef} />

      {/* ── Cursor personalizado cromo ─────────────────────────────────── */}
      <div className="cursor"          ref={cursorRef}   />
      <div className="cursor-follower" ref={followerRef} />

      {/* ── Navbar flotante ───────────────────────────────────────────── */}
      {loaded && (
        <nav className="navbar">
          <a href="#hero" className="navbar__logo">AMHERA</a>
          <div className="navbar__links">
            <a href="#hero"       className="navbar__link">The Brand</a>
            <a href="#vision"     className="navbar__link">Visión</a>
            <a href="#collection" className="navbar__link">Colección</a>
            <a href="#access"     className="navbar__link">Acceso</a>
          </div>
        </nav>
      )}

      {/* ── Canvas 3D fijo — el universo AMHERA ───────────────────────── */}
      <div
        className="canvas-wrapper"
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1s ease' }}
      >
        <Canvas
          shadows
          camera={{ position: [0, 1.5, 5], fov: 48 }}
          gl={{
            antialias: !isLowEnd,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          frameloop="always"
        >
          <color attach="background" args={['#030303']} />
          <fog   attach="fog"        args={['#030303', 12, 25]} />

          <Suspense fallback={null}>
            <Experience
              scrollProgress={scrollProgress}
              mousePos={mousePos}
              isLowEnd={isLowEnd}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* ── HTML scrolleable sobre el canvas ──────────────────────────── */}
      {loaded && (
        <div className="scroll-content" id="hero">
          <Hero       />
          <Vision     />
          <Collection />
          <Access     />
        </div>
      )}
    </>
  )
}
