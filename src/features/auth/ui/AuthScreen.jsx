import React, { useState } from 'react';
import { Compass, User, Mail, LogIn, UserPlus, Globe2, ShieldCheck } from 'lucide-react';
import WatermarkIcon from '../../../components/WatermarkIcon';
import ThemeToggle from '../../../components/ThemeToggle';
import { toast } from 'sonner';

export function AuthScreen({ onLoginOrRegister }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('El correo electrónico es obligatorio');
      return;
    }
    if (mode === 'register' && !nombre.trim()) {
      setErrorMsg('El nombre de usuario es obligatorio para el registro');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await onLoginOrRegister({
        nombre: mode === 'register' ? nombre.trim() : (nombre.trim() || email.split('@')[0]),
        email: email.trim().toLowerCase()
      });
      toast.success(mode === 'register' ? '¡Cuenta creada con éxito!' : '¡Bienvenido de nuevo!');
    } catch (err) {
      setErrorMsg(err.message || 'Error al iniciar sesión');
      toast.error(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-[#F1F5F9] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Selector de Tema en esquina superior derecha */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle size="sm" />
      </div>

      {/* Marcas de agua sólidas de gran tamaño en el fondo (sin gradientes) */}
      <WatermarkIcon icon={Globe2} className="w-[500px] h-[500px] -top-24 -left-24" opacity="opacity-[0.03]" color="text-[#00E5FF]" />
      <WatermarkIcon icon={Compass} className="w-[600px] h-[600px] -bottom-32 -right-32" opacity="opacity-[0.03]" color="text-[#00FF85]" />

      {/* Contenedor de Autenticación Minimalista */}
      <div className="w-full max-w-md bg-[#0E121B] border border-[#1C2436] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Logo y Encabezado */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#151B27] border border-[#1C2436] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Compass className="w-8 h-8 text-[#00FF85]" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F5F9] m-0 uppercase">
            Bitácora de Viajes
          </h1>
          <p className="text-xs text-[#8492A6] mt-1 m-0">
            Control de itinerarios, finanzas multi-divisa y bóveda offline.
          </p>
        </div>

        {/* Pestañas de Cambio: Iniciar Sesión / Registrarse */}
        <div className="flex rounded-lg bg-[#151B27] p-1 border border-[#1C2436] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-[#0E121B] text-[#00FF85] border border-[#00FF85]/40 shadow-sm'
                : 'text-[#8492A6] hover:text-[#F1F5F9]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" strokeWidth={2.5} />
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-[#0E121B] text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                : 'text-[#8492A6] hover:text-[#F1F5F9]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Registrarse
          </button>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-[#FF2E55]/10 border border-[#FF2E55] text-[#FF2E55] text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#8492A6] mb-1.5 uppercase tracking-wider">
                Nombre de Usuario <span className="text-[#00E5FF]">*</span>
              </label>
              <div className="flex items-center gap-2.5 bg-[#151B27] border border-[#1C2436] focus-within:border-[#00E5FF] rounded-lg px-3 py-2.5 transition-colors">
                <User className="w-4 h-4 text-[#8492A6]" />
                <input
                  type="text"
                  required={mode === 'register'}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Jaime Zapata"
                  className="bg-transparent text-sm text-[#F1F5F9] w-full focus:outline-none placeholder:text-[#8492A6]/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8492A6] mb-1.5 uppercase tracking-wider">
              Correo Electrónico <span className="text-[#00FF85]">*</span>
            </label>
            <div className="flex items-center gap-2.5 bg-[#151B27] border border-[#1C2436] focus-within:border-[#00FF85] rounded-lg px-3 py-2.5 transition-colors">
              <Mail className="w-4 h-4 text-[#8492A6]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="bg-transparent text-sm text-[#F1F5F9] w-full focus:outline-none placeholder:text-[#8492A6]/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider rounded-lg transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2 ${
              mode === 'register'
                ? 'bg-[#00E5FF] text-[#080A0F] hover:opacity-90'
                : 'bg-[#00FF85] text-[#080A0F] hover:opacity-90'
            }`}
          >
            {mode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" strokeWidth={2.5} />
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" strokeWidth={2.5} />
                {loading ? 'Ingresando...' : 'Acceder a la Bitácora'}
              </>
            )}
          </button>
        </form>

        {/* Nota de seguridad minimalista */}
        <div className="mt-6 pt-4 border-t border-[#1C2436] text-center">
          <p className="text-[11px] text-[#8492A6] flex items-center justify-center gap-1.5 m-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FF85]" />
            Acceso simplificado • Sin contraseñas ni complicaciones
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;
