import { useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'

export default function Loader({ onComplete }) {
  const { progress, active } = useProgress()
  const overlayRef  = useRef()
  const barRef      = useRef()
  const percentRef  = useRef()
  const hasExited   = useRef(false)

  useEffect(() => {
    if (barRef.current)    barRef.current.style.width     = `${progress}%`
    if (percentRef.current) percentRef.current.textContent = `${Math.round(progress)}%`
  }, [progress])

  const exitLoader = () => {
    if (hasExited.current || !overlayRef.current) return
    hasExited.current = true
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      delay: 0.1,
      onComplete,
    })
  }

  useEffect(() => {
    if (!active && progress >= 99) exitLoader()
  }, [active, progress])

  // Fallback — máximo 2s (antes 4s)
  useEffect(() => {
    const t = setTimeout(exitLoader, 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div ref={overlayRef} className="loader-overlay">
      <div className="loader-inner">
        <div className="loader-brand">AMHERA</div>
        <div className="loader-sub">Haute Couture of the Future</div>

        <div className="loader-track">
          <div ref={barRef} className="loader-fill" />
        </div>

        <span ref={percentRef} className="loader-percent">0%</span>
      </div>

      <div className="loader-corner loader-corner--tl" />
      <div className="loader-corner loader-corner--tr" />
      <div className="loader-corner loader-corner--bl" />
      <div className="loader-corner loader-corner--br" />
    </div>
  )
}
