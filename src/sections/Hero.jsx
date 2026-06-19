import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const sectionRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrada cinematográfica escalonada
      const tl = gsap.timeline({ delay: 0.5 })
      tl.to('.hero__eyebrow', { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' })
        .to('.hero__title',   { opacity: 1, y: 0, duration: 1.4, ease: 'power4.out' }, '-=0.6')
        .to('.hero__tagline', { opacity: 1, duration: 1.0, ease: 'power2.out' }, '-=0.8')
        .to('.hero__ctas',    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.7')
        .to('.hero__scroll',  { opacity: 1, duration: 0.8 }, '-=0.4')

      // Al hacer scroll, el hero desaparece elegantemente hacia arriba
      gsap.to('.hero__eyebrow, .hero__title, .hero__tagline, .hero__ctas', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '60% top',
          scrub: 1.5,
        },
        y: -100,
        opacity: 0,
        stagger: 0.05,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="section hero" ref={sectionRef} style={{ minHeight: '100vh' }}>
      <p className="hero__eyebrow">Metal Líquido · Moda del Futuro</p>
      <h1 className="hero__title">AMHERA</h1>
      <p className="hero__tagline">Haute Couture of the Future</p>

      <div className="hero__ctas">
        <a href="#collection" className="cta-primary">
          <span>Descubrir Colección</span>
        </a>
        <a href="#vision" className="cta-ghost">
          <span>Ver Manifiesto</span>
        </a>
      </div>

      <div className="hero__scroll">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}
