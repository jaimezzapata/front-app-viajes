import React from 'react';

/**
 * WatermarkIcon: Renderiza un ícono vectorial sólido de gran tamaño
 * en segundo plano con baja opacidad, creando un efecto de marca de agua minimalista
 * sin ningún tipo de gradiente.
 */
export function WatermarkIcon({
  icon: Icon,
  className = 'w-36 h-36 -bottom-6 -right-6',
  color = 'text-white',
  opacity = 'opacity-[0.04]'
}) {
  if (!Icon) return null;

  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none select-none z-0 overflow-hidden ${opacity} ${color} ${className}`}
    >
      <Icon className="w-full h-full" strokeWidth={1.5} />
    </div>
  );
}

export default WatermarkIcon;
