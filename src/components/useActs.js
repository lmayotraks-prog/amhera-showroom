// useActs.js
//
// FUENTE ÚNICA DE VERDAD de la narrativa de AMHERA.
// Antes: introT/disperseT/reformT/ctaT se recalculaban por separado en
// ChromeRings.jsx, CoreObject.jsx (dos veces) y Experience.jsx. Si cambiabas
// un punto de corte (ej. dónde empieza el Acto II), tenías que tocar 4+ sitios
// y era fácil que un componente quedara desincronizado de otro — un anillo que
// aparece en 0.25 pero el logo en 0.27, etc.
//
// Ahora: un solo lugar define el guion. Todo lo demás solo LEE estos valores.

// mapRange: traduce el progreso global [0,1] al progreso LOCAL de un tramo.
// Antes de "start" devuelve 0, después de "end" devuelve 1, en medio interpola.
function mapRange(value, start, end) {
  if (value <= start) return 0;
  if (value >= end) return 1;
  return (value - start) / (end - start);
}

// ─────────────────────────────────────────────────────────────────────────
// EL GUION. Cambiar el ritmo de la historia completa = cambiar estos 4 números.
// ─────────────────────────────────────────────────────────────────────────
export const ACT_BOUNDARIES = {
  introEnd: 0.25, // Acto I -> II: el logo termina su intro, empiezan a revelarse los anillos
  disperseEnd: 0.55, // Acto II -> III: fin de la fragmentación, empieza el ensamblaje
  reformEnd: 0.85, // Acto III -> IV: fin del ensamblaje, empieza el CTA final
  // (1.0 = fin del documento, fin del Acto IV implícito)
};

/**
 * getActs(scrollProgress) -> { introT, ringReveal, disperseT, reformT, ctaT, raw }
 *
 * Función pura, SIN "use" en el nombre a propósito: se llama dentro de
 * useFrame (60 veces por segundo), y las reglas de React Hooks prohíben
 * llamar hooks dentro de callbacks que no sean el cuerpo de un componente.
 * Como esto no usa useState/useMemo/etc, no es un hook real — es solo una
 * función de cálculo, y por eso es seguro llamarla desde dentro de useFrame.
 *
 * scrollProgress: el ref con .current entre 0 y 1 (viene de useScrollProgress).
 */
export function getActs(scrollProgress) {
  const p = scrollProgress?.current ?? 0;
  const { introEnd, disperseEnd, reformEnd } = ACT_BOUNDARIES;

  const introT = 1.0 - mapRange(p, 0.0, introEnd); // 1 al inicio -> 0 al final del Acto I
  const ringReveal = 1.0 - introT; // inverso de introT, más legible en el código de los anillos
  const disperseT = mapRange(p, introEnd, disperseEnd); // 0 -> 1 durante el Acto II
  const reformT = mapRange(p, disperseEnd, reformEnd); // 0 -> 1 durante el Acto III
  const ctaT = mapRange(p, reformEnd, 1.0); // 0 -> 1 durante el Acto IV

  return { introT, ringReveal, disperseT, reformT, ctaT, raw: p };
}

/**
 * dampLerp: lerp independiente del framerate.
 *
 * Antes: THREE.MathUtils.lerp(current, target, 0.05) en cada componente.
 * Problema: 0.05 "por frame" significa que en 144Hz la animación converge casi
 * 2.4x más rápido que en 60Hz, y en un móvil a 30fps va más lenta y se nota más
 * "a saltos". El resultado visual cambia según el dispositivo del cliente.
 *
 * Con delta, el factor de suavizado se ajusta para que la velocidad PERCIBIDA
 * sea la misma sin importar el framerate. lambda alto = sigue al target más rápido.
 */
export function dampLerp(current, target, lambda, delta) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}
