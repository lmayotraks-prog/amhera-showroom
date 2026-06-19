import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Vision() {
  const sectionRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      const opts = (start = 'top 72%') => ({
        scrollTrigger: { trigger: sectionRef.current, start, toggleActions: 'play none none reverse' },
      })

      gsap.to('.vision__label',   { ...opts(), opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' })
      gsap.to('.vision__title',   { ...opts('top 67%'), opacity: 1, y: 0, duration: 1.1, ease: 'power4.out', delay: 0.1 })
      gsap.to('.vision__divider', { ...opts('top 64%'), opacity: 1, duration: 0.8, delay: 0.2 })
      gsap.to('.vision__body',    {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 62%', toggleActions: 'play none none reverse' },
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15, delay: 0.3,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="section vision" id="vision" ref={sectionRef} style={{ minHeight: '100vh' }}>
      <div className="vision__inner">
        <p className="vision__label">La Visión · Alta Costura y Adaptabilidad</p>

        <h2 className="vision__title">
          El Futuro<br />
          de la <span className="liquid">Forma</span>
        </h2>

        <div className="vision__divider" />

        <p className="vision__body">
          <strong>AMHERA</strong> representa la evolución de la moda. Una marca que respira
          un aire etéreo y puro, profundamente conectada con la innovación y la fluidez
          mecánica. Cada pieza es un artefacto de precisión que trasciende el tiempo.
        </p>

        <p className="vision__body">
          En nuestras prendas, el contraste es absoluto: la elegancia atemporal y el brillo del{' '}
          <strong>metal líquido</strong> convergen con la innovación táctil de los accesorios
          modulares impresos en 3D. Es un mensaje de lujo impecable e imponente.
        </p>

        <p className="vision__body">
          No diseñamos ropa. Construimos <strong>exoesqueletos del yo</strong>.
        </p>
      </div>
    </section>
  )
}
