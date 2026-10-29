// Lógica centralizada de color de cita para el scheduler.
// "Servicio pagado": venta con noVenta > 0 (ticket cobrado). Morado claro (#D7BDE2).
// "Sin atención": cita Requerida (2) o Asignada (3) cuya hora1 ya pasó hace >= 1 minuto
// sin haber entrado a servicio (estadoCita != 4). Se pinta en rojo automáticamente.
// Nota: Domicilio (esDomicilio / estadoCita == 5) NO entra en "Sin atención".

export const COLORES_CITA = {
  noDisponible: "#F8C471",     // Sandy Orange
  requerido: "#AFEEEE",        // Pale Turquoise
  asignado: "#FFF26C",         // Lemon Chiffon
  enServicio: "#90EE90",       // Light Green
  servicioPagado: "#D7BDE2",   // Morado claro - ticket pagado (no_venta > 0)
  domicilio: "#F8BBD0",        // Rosa
  conflicto: "#bababa",        // Light Gray
  sinAtencion: "#FF4D4F",      // Rojo - cita que ya pasó su hora sin entrar a servicio
};

/**
 * Determina si una venta ya fue pagada (no_venta > 0).
 *
 * @param {object} item  Evento del scheduler
 * @returns {boolean}
 */
export const esServicioPagado = (item) => {
  if (!item) return false;
  const noVentaNum = Number(item.noVenta ?? item.no_venta ?? 0);
  return Number.isFinite(noVentaNum) && noVentaNum > 0;
};

/**
 * Determina si una cita ya está "Sin atención".
 * Aplica solo a citas reales (idCita > 0, sin venta) cuyo estado es
 * Requerido (2) o Asignado (3) (NO Domicilio, NO No Disponible, NO En Servicio, NO Conflicto),
 * y que ya pasaron su hora de inicio por >= 1 minuto sin entrar a servicio.
 *
 * Ej: cita a las 17:30:00 -> a las 17:31:00 ya retorna true.
 *
 * @param {object} item    Evento del scheduler (con idCita, idVenta, estadoCita, esDomicilio)
 * @param {Date}   hora1Date  Fecha/hora de inicio de la cita
 * @param {Date}   [ahora]    Fecha/hora actual (por defecto new Date())
 * @returns {boolean}
 */
export const esCitaSinAtencion = (item, hora1Date, ahora = new Date()) => {
  if (!item || !(item.idCita > 0) || item.idVenta > 0) return false;
  // No disponible (1), En servicio (4), Domicilio (5 / esDomicilio) y Conflicto (6) NO entran en Sin Atención
  if (
    item.estadoCita == 1 ||
    item.estadoCita == 4 ||
    item.estadoCita == 5 ||
    item.estadoCita == 6 ||
    item.esDomicilio == true ||
    item.esDomicilio == 1
  ) {
    return false;
  }

  const inicio = hora1Date instanceof Date ? hora1Date : new Date(item.inicioReal || item.start || item.hora1);
  if (isNaN(inicio.getTime())) return false;

  // Umbral = hora1 + 1 minuto (truncado a segundos para comparar a nivel minuto)
  const umbral = new Date(
    inicio.getFullYear(),
    inicio.getMonth(),
    inicio.getDate(),
    inicio.getHours(),
    inicio.getMinutes() + 1,
    0,
    0,
  );
  return ahora.getTime() >= umbral.getTime();
};

/**
 * Devuelve el color de fondo del evento según su estado y si ya está "Sin atención".
 * Orden de prioridad:
 *   1. Conflicto       -> Gris         (#bababa) — siempre visible encima
 *   2. No disponible   -> Naranja      (#F8C471) — nunca cambia
 *   3. Servicio pagado -> Morado claro (#D7BDE2) — venta con no_venta > 0
 *   4. En servicio     -> Verde        (#90EE90) — en proceso
 *   5. Domicilio       -> Rosa         (#F8BBD0) — nunca pasa a Sin atención
 *   6. Sin atención    -> Rojo         (#FF4D4F) — si Requerido/Asignado ya pasó su hora +1 min
 *   7. Requerido       -> Turquesa     (#AFEEEE)
 *   8. Asignado        -> Amarillo     (#FFF26C)
 *
 * @param {object} item   Evento del scheduler
 * @param {Date}   hora1Date  Fecha/hora de inicio de la cita
 * @param {Date}   [ahora]    Fecha/hora actual (por defecto new Date())
 * @returns {string} Color hex
 */
export const obtenerColorCita = (item, hora1Date, ahora = new Date()) => {
  if (item.estadoCita == 6) return COLORES_CITA.conflicto;
  if (item.estadoCita == 1) return COLORES_CITA.noDisponible;
  if (esServicioPagado(item)) return COLORES_CITA.servicioPagado;
  if (item.estadoCita == 4 || item.estadoCita2 == 4) return COLORES_CITA.enServicio;
  if (item.esDomicilio == true || item.esDomicilio == 1 || item.estadoCita == 5) return COLORES_CITA.domicilio;
  if (esCitaSinAtencion(item, hora1Date, ahora)) return COLORES_CITA.sinAtencion;
  if (item.estadoCita == 2) return COLORES_CITA.requerido;
  if (item.estadoCita == 3) return COLORES_CITA.asignado;
  return COLORES_CITA.conflicto;
};

export const NOMBRES_ESTADO_CITA = {
  noDisponible: "NO DISPONIBLE",
  requerido: "REQUERIDO",
  asignado: "ASIGNADO",
  enServicio: "EN SERVICIO",
  servicioPagado: "SERVICIO PAGADO",
  domicilio: "DOMICILIO",
  conflicto: "CONFLICTO",
  sinAtencion: "SIN ATENCIÓN",
};

/**
 * Nombre del estado visible de la cita (misma prioridad que obtenerColorCita).
 * La etiqueta siempre corresponde al color pintado, incluyendo los estados
 * visuales que no existen en BD (Sin atención, Servicio pagado).
 */
export const obtenerNombreEstadoCita = (item, hora1Date, ahora = new Date()) => {
  if (item.estadoCita == 6) return NOMBRES_ESTADO_CITA.conflicto;
  if (item.estadoCita == 1) return NOMBRES_ESTADO_CITA.noDisponible;
  if (esServicioPagado(item)) return NOMBRES_ESTADO_CITA.servicioPagado;
  if (item.estadoCita == 4 || item.estadoCita2 == 4) return NOMBRES_ESTADO_CITA.enServicio;
  if (item.esDomicilio == true || item.esDomicilio == 1 || item.estadoCita == 5) return NOMBRES_ESTADO_CITA.domicilio;
  if (esCitaSinAtencion(item, hora1Date, ahora)) return NOMBRES_ESTADO_CITA.sinAtencion;
  if (item.estadoCita == 2) return NOMBRES_ESTADO_CITA.requerido;
  if (item.estadoCita == 3) return NOMBRES_ESTADO_CITA.asignado;
  return NOMBRES_ESTADO_CITA.conflicto;
};

/**
 * Nombre de un estatus base (valor numerico de BD). Para citas en conflicto
 * (estadoCita = 6), estadoCita2 conserva el estatus original de la cita.
 */
export const obtenerNombreEstatusBase = (estado) => {
  switch (Number(estado)) {
    case 1: return NOMBRES_ESTADO_CITA.noDisponible;
    case 2: return NOMBRES_ESTADO_CITA.requerido;
    case 3: return NOMBRES_ESTADO_CITA.asignado;
    case 4: return NOMBRES_ESTADO_CITA.enServicio;
    case 5: return NOMBRES_ESTADO_CITA.domicilio;
    case 6: return NOMBRES_ESTADO_CITA.conflicto;
    default: return null;
  }
};
