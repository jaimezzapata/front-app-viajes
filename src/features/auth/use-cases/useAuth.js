import { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api';

const USER_STORAGE_KEY = 'app_viajes_usuario';

export function useAuth() {
  const [usuario, setUsuario] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reconciliación en segundo plano: si el usuario inició sesión de modo local/offline,
  // sincronizarlo automáticamente con la base de datos de Supabase en cuanto haya conexión.
  useEffect(() => {
    if (usuario && (usuario.isLocal || (typeof usuario.id === 'string' && usuario.id.startsWith('offline-'))) && usuario.email) {
      apiRequest('/auth/login-or-register', {
        method: 'POST',
        body: JSON.stringify({ nombre: usuario.nombre, email: usuario.email })
      }).then(res => {
        if (res && res.id && !res.id.startsWith('offline-')) {
          setUsuario(res);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res));
        }
      }).catch(() => {
        // Continuar en modo local si el servidor sigue inaccesible
      });
    }
  }, [usuario]);

  const loginOrRegister = async ({ nombre, email }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/auth/login-or-register', {
        method: 'POST',
        body: JSON.stringify({ nombre, email })
      });
      setUsuario(res);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res));
      return res;
    } catch (err) {
      console.warn('Conexión con servidor no disponible, continuando en modo Offline-First:', err.message);
      // Principio Offline-First: si el servidor o la BD fallan, iniciar sesión localmente sin bloquear al usuario
      const offlineUser = {
        id: 'offline-' + Date.now(),
        nombre: (nombre && nombre.trim()) ? nombre.trim() : email.split('@')[0],
        email: email.trim().toLowerCase(),
        isLocal: true
      };
      setUsuario(offlineUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(offlineUser));
      return offlineUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return {
    usuario,
    loading,
    error,
    loginOrRegister,
    logout
  };
}
