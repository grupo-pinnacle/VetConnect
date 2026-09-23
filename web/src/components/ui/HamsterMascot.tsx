import React, { useEffect, useRef, useState } from 'react';

interface HamsterMascotProps {
  isCoveringEyes?: boolean;
  isLookingAtInput?: boolean;
  className?: string;
}

export const HamsterMascot: React.FC<HamsterMascotProps> = ({
  isCoveringEyes = false,
  isLookingAtInput = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Solo habilitar tracking de mouse en desktop con puntero fino (no en touch/móviles ni JSDOM)
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    try {
      const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)');
      setIsDesktop(mediaQuery.matches);

      const handleMediaChange = (e: MediaQueryListEvent) => {
        setIsDesktop(e.matches);
      };

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleMediaChange);
        return () => mediaQuery.removeEventListener('change', handleMediaChange);
      }
    } catch {
      // Fallback silencioso si el entorno no soporta matchMedia
    }
  }, []);

  useEffect(() => {
    if (!isDesktop || isCoveringEyes) {
      if (isLookingAtInput) {
        setPupilOffset({ x: 0, y: 4 });
      } else {
        setPupilOffset({ x: 0, y: 0 });
      }
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.hypot(deltaX, deltaY) / 25, 4.5); // Radio máximo de 4.5px

      setPupilOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDesktop, isCoveringEyes, isLookingAtInput]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 160 140"
        className="w-28 h-24 sm:w-32 sm:h-28 drop-shadow-md transition-all duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Oreja Izquierda */}
        <ellipse cx="42" cy="32" rx="14" ry="16" fill="#F59E0B" />
        <ellipse cx="42" cy="33" rx="8" ry="10" fill="#FBCFE8" />

        {/* Oreja Derecha */}
        <ellipse cx="118" cy="32" rx="14" ry="16" fill="#F59E0B" />
        <ellipse cx="118" cy="33" rx="8" ry="10" fill="#FBCFE8" />

        {/* Cabeza Principal del Hámster */}
        <ellipse cx="80" cy="74" rx="48" ry="44" fill="#FBBF24" />

        {/* Cachetes Esponjosos Claros */}
        <ellipse cx="56" cy="84" rx="22" ry="18" fill="#FFFBEB" />
        <ellipse cx="104" cy="84" rx="22" ry="18" fill="#FFFBEB" />
        <ellipse cx="80" cy="88" rx="26" ry="18" fill="#FFFBEB" />

        {/* Rubor Rosado Tierno en Mejillas */}
        <circle cx="48" cy="82" r="7" fill="#F472B6" fillOpacity="0.4" />
        <circle cx="112" cy="82" r="7" fill="#F472B6" fillOpacity="0.4" />

        {/* Naricita Tierna */}
        <polygon points="80,78 75,73 85,73" fill="#FB7185" />

        {/* Boquita Sonriente de Hámster (tipo 'w') */}
        <path
          d="M74 81C76 83 78 83 80 81C82 83 84 83 86 81"
          stroke="#78350F"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Estetoscopio de Doctor (Accesorio de la marca) */}
        <path
          d="M54 94C54 112 106 112 106 94"
          stroke="#059669"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="80" cy="113" r="5" fill="#E2E8F0" stroke="#059669" strokeWidth="2" />

        {/* OJOS: Modo Normal (Persiguen el mouse) vs. Modo Tapado (Cerrados / Paws up) */}
        {!isCoveringEyes ? (
          <>
            {/* Ojo Izquierdo (Blanco de la esclera) */}
            <circle cx="60" cy="62" r="10" fill="#FFFFFF" stroke="#D97706" strokeWidth="1" />
            {/* Pupila Izquierda Móvil */}
            <g
              style={{
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                transition: isDesktop ? 'transform 0.08s ease-out' : 'transform 0.2s ease',
              }}
            >
              <circle cx="60" cy="62" r="6" fill="#1E293B" />
              {/* Brillo destello 1 */}
              <circle cx="58" cy="59.5" r="2.2" fill="#FFFFFF" />
              {/* Brillo destello 2 */}
              <circle cx="62" cy="63.5" r="1" fill="#FFFFFF" />
            </g>

            {/* Ojo Derecho (Blanco de la esclera) */}
            <circle cx="100" cy="62" r="10" fill="#FFFFFF" stroke="#D97706" strokeWidth="1" />
            {/* Pupila Derecha Móvil */}
            <g
              style={{
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                transition: isDesktop ? 'transform 0.08s ease-out' : 'transform 0.2s ease',
              }}
            >
              <circle cx="100" cy="62" r="6" fill="#1E293B" />
              {/* Brillo destello 1 */}
              <circle cx="98" cy="59.5" r="2.2" fill="#FFFFFF" />
              {/* Brillo destello 2 */}
              <circle cx="102" cy="63.5" r="1" fill="#FFFFFF" />
            </g>
          </>
        ) : (
          <>
            {/* Ojos Cerrados de Felicidad / Verguenza (^ ^) */}
            <path
              d="M53 64C56 59 64 59 67 64"
              stroke="#78350F"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M93 64C96 59 104 59 107 64"
              stroke="#78350F"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </>
        )}

        {/* PATITAS (PAWS): Abajo cuando mira, Arriba tapándose los ojos cuando isCoveringEyes === true */}
        <g
          className="transition-transform duration-300 ease-out"
          style={{
            transform: isCoveringEyes ? 'translateY(-24px) scale(1.08)' : 'translateY(0px)',
            transformOrigin: '80px 85px',
          }}
        >
          {/* Patita Izquierda */}
          <ellipse cx="58" cy="94" rx="10" ry="8" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          <circle cx="54" cy="93" r="2" fill="#FBCFE8" />
          <circle cx="58" cy="92" r="2" fill="#FBCFE8" />
          <circle cx="62" cy="93" r="2" fill="#FBCFE8" />

          {/* Patita Derecha */}
          <ellipse cx="102" cy="94" rx="10" ry="8" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          <circle cx="98" cy="93" r="2" fill="#FBCFE8" />
          <circle cx="102" cy="92" r="2" fill="#FBCFE8" />
          <circle cx="106" cy="93" r="2" fill="#FBCFE8" />
        </g>
      </svg>
      {/* Texto de bocadillo simpático cuando se tapa los ojos */}
      {isCoveringEyes && (
        <div className="absolute -top-3 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce">
          🙈 ¡No estoy mirando!
        </div>
      )}
    </div>
  );
};

export default HamsterMascot;
