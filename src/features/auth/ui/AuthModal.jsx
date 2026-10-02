import React, { useState } from 'react';
import { User, Mail, LogIn, CheckCircle } from 'lucide-react';
import Modal from '../../../components/Modal';
import WatermarkIcon from '../../../components/WatermarkIcon';

export function AuthModal({ isOpen, onClose, usuario, onLoginOrRegister, onLogout }) {
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [email, setEmail] = useState(usuario?.email || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('El correo electrónico es obligatorio');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await onLoginOrRegister({ nombre, email });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={usuario ? 'Perfil de Usuario' : 'Identificación de Viajero'}>
      <div className="relative overflow-hidden">
        {/* Marca de agua sólida */}
        <WatermarkIcon icon={User} className="w-48 h-48 -bottom-10 -right-10" opacity="opacity-[0.03]" color="text-[#00FF85]" />

        {usuario ? (
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3 p-3.5 bg-[#151B27] border border-[#1C2436] rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#080A0F] border border-[#00FF85] flex items-center justify-center text-[#00FF85]">
                <User className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#F1F5F9] m-0 truncate">{usuario.nombre}</p>
                <p className="text-xs text-[#8492A6] m-0 truncate">{usuario.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-[#00FF85] bg-[#00FF85]/10 px-2 py-0.5 rounded">
                  Sesión Activa
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-[#151B27] border border-[#FF2E55] text-[#FF2E55] text-xs font-bold rounded-lg hover:bg-[#FF2E55]/10 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <p className="text-xs text-[#8492A6] m-0">
              Ingresa tu nombre y correo para asociar tus viajes, gastos y bitácoras (autenticación rápida sin contraseñas).
            </p>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-[#FF2E55]/10 border border-[#FF2E55] text-[#FF2E55] text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#8492A6] mb-1.5 uppercase tracking-wider">
                Nombre de Usuario
              </label>
              <div className="flex items-center gap-2 bg-[#151B27] border border-[#1C2436] focus-within:border-[#00FF85] rounded-lg px-3 py-2 transition-colors">
                <User className="w-4 h-4 text-[#8492A6]" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Jaime Zapata"
                  className="bg-transparent text-sm text-[#F1F5F9] w-full focus:outline-none placeholder:text-[#8492A6]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8492A6] mb-1.5 uppercase tracking-wider">
                Correo Electrónico <span className="text-[#FF2E55]">*</span>
              </label>
              <div className="flex items-center gap-2 bg-[#151B27] border border-[#1C2436] focus-within:border-[#00FF85] rounded-lg px-3 py-2 transition-colors">
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
              className="w-full py-3 px-4 bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" strokeWidth={2.5} />
              {loading ? 'Ingresando...' : 'Entrar a la Bitácora'}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default AuthModal;
