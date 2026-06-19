import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PIECES = [
  {
    name: 'GRAVITY COAT',
    tag: 'Outerwear · Modular',
    filter: 'grayscale(0.15) contrast(1.1)',
    desc: 'Una segunda piel de precisión. Capas que se adaptan, se quitan y se añaden.',
  },
  {
    name: 'CHROME EXOSKELETON',
    tag: 'Accessories · 3D Printed',
    filter: 'grayscale(0.5) contrast(1.25) brightness(0.9)',
    desc: 'Accesorios modulares de metal líquido. Impresos en 3D. Diseñados para el cuerpo.',
  },
  {
    name: 'ETHEREAL HARNESS',
    tag: 'Techwear · Core',
    filter: 'grayscale(0.3) hue-rotate(200deg) brightness(0.75)',
    desc: 'El arnes que redefine la silueta. Donde la arquitectura se convierte en moda.',
  },
]

export default function Collection() {
  const sectionRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.collection__label', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' },
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      })
      gsap.to('.collection__title', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 68%' },
        opacity: 1, y: 0, duration: 1.1, ease: 'power4.out', delay: 0.1,
      })
      gsap.to('.collection__sub', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 64%' },
        opacity: 1, duration: 0.8, delay: 0.2,
      })
      gsap.to('.piece-card', {
        scrollTrigger: { trigger: '.collection__grid', start: 'top 75%' },
        opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', stagger: 0.2,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="section collection" id="collection" ref={sectionRef} style={{ minHeight: '100vh' }}>
      <div className="collection__header">
        <p className="collection__label">Primera Colección · 2026</p>
        <h2 className="collection__title">Modular<br />Techwear</h2>
        <p className="collection__sub">Prendas que se transforman. Diseñadas para el día a día y el más allá.</p>
      </div>

      <div className="collection__grid">
        {PIECES.map((piece) => (
          <div className="piece-card" key={piece.name}>
            <div className="piece-card__img-wrap">
              <img
                src="/assets/hero.png"
                alt={piece.name}
                className="piece-card__img"
                style={{ filter: piece.filter }}
              />
              <div className="piece-card__overlay">
                <span className="piece-card__view">Ver Pieza →</span>
              </div>
            </div>
            <div className="piece-card__info">
              <h3 className="piece-card__name">{piece.name}</h3>
              <p className="piece-card__tag">{piece.tag}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
