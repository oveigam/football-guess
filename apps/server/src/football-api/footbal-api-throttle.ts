/**
 * La api tiene una limitacion de 10 llamadas por minuto en el free tier T_T
 * Esto se traduce a que puedo hacer una llamada cada 6s
 * Se añade un segundo extra al tiempo de espera por ser precavidos
 */
const THROTTLE = 7000;

/**
 * Controlamos cuando se hizo la ultima llamada
 * para saber si tenemos que esperar para la siguiente
 */
let lastCall: number | undefined;

/**
 * Helper para esperar X milisegundos
 * @param milliseconds tiempo de espera
 */
async function wait(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export const apiThrottle = async <T>(call: () => T) => {
  if (lastCall) {
    const elapsedSinceLast = Date.now() - lastCall;
    // Si no ha pasado el tiempo de espera desde la ultima llamada esperamos el tiempo necesario
    if (elapsedSinceLast < THROTTLE) {
      await wait(THROTTLE - elapsedSinceLast);
    }
  }

  const response = await call();
  lastCall = Date.now();
  return response;
};
