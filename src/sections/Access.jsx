import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Access() {
  const sectionRef = useRef()
  const btnRef     = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.access__eyebrow', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' },
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      })
      gsap.to('.access__title', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 67%' },
        opacity: 1, scale: 1, duration: 1.3, ease: 'back.out(1.2)', delay: 0.1,
      })
      gsap.to('.access__form', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.4,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Efecto magnético sutil en el botón
  const handleMouseMove = (e) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width  / 2) * 0.2
    const y = (e.clientY - rect.top  - rect.height / 2) * 0.2
    gsap.to(btnRef.current, { x, y, duration: 0.4, ease: 'power2.out' })
  }

  const handleMouseLeave = () => {
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' })
  }

  return (
    <>
      <section
        className="section access"
        id="access"
        ref={sectionRef}
        style={{ minHeight: '100vh' }}
      >
        <p className="access__eyebrow">Acceso Exclusivo · Piezas Limitadas</p>

        <h2 className="access__title">
          Únete a la<br />
          <span className="liquid">Vanguardia</span>
        </h2>

        <form
          className="access__form"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            className="access__input"
            placeholder="Nombre"
            required
          />
          <input
            type="email"
            className="access__input"
            placeholder="Email Exclusivo"
            required
          />
          <button
            type="submit"
            ref={btnRef}
            className="access__btn"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <span>Solicitar Acceso</span>
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__logo">AMHERA</div>
        <div className="footer__links">
          <a href="#">Instagram</a>
          <a href="#">Vogue</a>
          <a href="#">Contacto</a>
        </div>
        <p className="footer__copy">© 2026 AMHERA. Tous droits réservés. Haute Couture of the Future.</p>
      </footer>
    </>
  )
}
