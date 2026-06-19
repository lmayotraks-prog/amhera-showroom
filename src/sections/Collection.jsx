import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Productos reales de la marca — sin imágenes por ahora (placeholder con cromado)
const PIECES = [
  {
    name: 'GRAVITY COAT',
    tag: 'Outerwear · Modular',
    num: '01',
  },
  {
    name: 'CHROME EXOSKELETON',
    tag: 'Accessories · 3D Printed',
    num: '02',
  },
  {
    name: 'ETHEREAL HARNESS',
    tag: 'Techwear · Core',
    num: '03',
  },
]

export default function Collection() {
  const sectionRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.collection__label', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        opacity: 0, y: 15, duration: 0.7, ease: 'power3.out',
      })
      gsap.from('.collection__title', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        opacity: 0, y: 30, duration: 0.9, ease: 'power4.out', delay: 0.1,
      })
      gsap.from('.piece-card', {
        scrollTrigger: { trigger: '.collection__grid', start: 'top 78%' },
        opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', stagger: 0.15,
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
            {/* Placeholder — próximamente foto del producto real */}
            <div className="piece-card__placeholder">
              <span className="piece-card__num">{piece.num}</span>
              <p className="piece-card__coming">Próximamente</p>
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
