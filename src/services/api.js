const defaultBase = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
  ? 'https://back-app-viajes.onrender.com'
  : 'http://localhost:4000';

const rawBase = import.meta.env.VITE_API_URL || defaultBase;
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api`;

/**
 * Cliente HTTP ligero con detección de conectividad
 */
export async function apiRequest(endpoint, options = {}) {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline) {
    const error = new Error('Sin conexión a internet. Guardado localmente.');
    error.isOffline = true;
    throw error;
  }

  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (netErr) {
    const error = new Error('No se pudo conectar al servidor. Operando en modo local.');
    error.isOffline = true;
    error.originalError = netErr;
    throw error;
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = json.error || (json.detalles ? json.detalles.map(d => `${d.campo}: ${d.mensaje}`).join(', ') : 'Error en la petición');
    const err = new Error(errorMsg);
    err.status = response.status;
    err.details = json.detalles;
    throw err;
  }

  return json.data !== undefined ? json.data : json;
}
