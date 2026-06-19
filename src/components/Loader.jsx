import { useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'

export default function Loader({ onComplete }) {
  const { progress, active } = useProgress()
  const overlayRef  = useRef()
  const barRef      = useRef()
  const percentRef  = useRef()
  const brandRef    = useRef()
  const hasExited   = useRef(false)

  useEffect(() => {
    if (barRef.current)    barRef.current.style.width    = `${progress}%`
    if (percentRef.current) percentRef.current.textContent = `${Math.round(progress)}%`
  }, [progress])

  useEffect(() => {
    if (!brandRef.current) return
    gsap.from(brandRef.current, { opacity: 0, y: 40, duration: 1, ease: 'power3.out', delay: 0.3 })
  }, [])

  const exitLoader = () => {
    if (hasExited.current) return
    hasExited.current = true
    gsap.to(overlayRef.current, {
      scaleY: 0,
      transformOrigin: 'top center',
      duration: 1.2,
      ease: 'power4.inOut',
      delay: 0.4,
      onComplete,
    })
  }

  useEffect(() => {
    if (!active && progress >= 99) exitLoader()
  }, [active, progress])

  // Fallback — 4s máximo de espera
  useEffect(() => {
    const t = setTimeout(exitLoader, 4000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div ref={overlayRef} className="loader-overlay">
      <div className="loader-inner">
        <div ref={brandRef}>
          <div className="loader-brand">AMHERA</div>
          <div className="loader-sub">Haute Couture of the Future</div>
        </div>

        <div className="loader-track">
          <div ref={barRef} className="loader-fill" />
        </div>

        <span ref={percentRef} className="loader-percent">0%</span>
      </div>

      {/* Esquinas decorativas */}
      <div className="loader-corner loader-corner--tl" />
      <div className="loader-corner loader-corner--tr" />
      <div className="loader-corner loader-corner--bl" />
      <div className="loader-corner loader-corner--br" />
    </div>
  )
}
