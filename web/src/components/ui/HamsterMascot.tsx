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
    // Solo habilitar tracking de cursor en desktop con mouse (desactivado en touch/móvil y JSDOM)
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
      // Fallback silencioso en entornos sin matchMedia
    }
  }, []);

  useEffect(() => {
    if (!isDesktop || isCoveringEyes) {
      if (isLookingAtInput) {
        setPupilOffset({ x: 0, y: 3.5 });
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
      const distance = Math.min(Math.hypot(deltaX, deltaY) / 30, 4); // Radio ágil de 4px

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
      className={`relative flex flex-col items-center justify-center select-none transition-transform duration-300 ${className}`}
      aria-hidden="true"
    >
      {/* Cartel flotante tipo cómic: SOLO cuando se tapa los ojos con "Ver contraseña" */}
      <div
        className={`absolute -top-7 transition-all duration-300 ease-out z-20 pointer-events-none ${
          isCoveringEyes
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-2 scale-75'
        }`}
      >
        <div className="relative bg-[#FFFBEB] text-[#78350F] border-2 border-[#F59E0B] text-[11px] font-black tracking-wide px-3 py-1 rounded-2xl shadow-md flex items-center gap-1.5 whitespace-nowrap animate-bounce">
          <span className="text-sm">🙈</span>
          <span>¡No miro!</span>
          {/* Triángulo tipo bocadillo */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FFFBEB] border-b-2 border-r-2 border-[#F59E0B] rotate-45" />
        </div>
      </div>

      {/* Ilustración Vectorial Bold & Minimalista Estilo Duolingo */}
      <svg
        viewBox="0 0 140 130"
        className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_8px_20px_rgba(245,158,11,0.22)] transition-all duration-300 hover:scale-105 cursor-pointer"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* OREJITAS REDONDAS BOLD */}
        {/* Oreja Izquierda */}
        <ellipse cx="36" cy="28" rx="14" ry="16" fill="#F59E0B" transform="rotate(-12 36 28)" />
        <ellipse cx="36" cy="29" rx="8" ry="10" fill="#FDA4AF" transform="rotate(-12 36 29)" />

        {/* Oreja Derecha */}
        <ellipse cx="104" cy="28" rx="14" ry="16" fill="#F59E0B" transform="rotate(12 104 28)" />
        <ellipse cx="104" cy="29" rx="8" ry="10" fill="#FDA4AF" transform="rotate(12 104 29)" />

        {/* CUERPO ORGÁNICO MALVAVISCO / BEAN (Forma limpia y continua) */}
        <path
          d="M 28,68 C 18,94 32,116 70,116 C 108,116 122,94 112,68 C 106,38 94,28 70,28 C 46,28 34,38 28,68 Z"
          fill="#FBBF24"
        />

        {/* BARRIGA & HOCICO CREMOSO (Silueta pura) */}
        <path
          d="M 42,76 C 42,66 54,62 70,62 C 86,62 98,66 98,76 C 98,96 86,112 70,112 C 54,112 42,96 42,76 Z"
          fill="#FFFBEB"
        />

        {/* RUBOR DE MEJILLAS REDONDO TIERNO */}
        <circle cx="38" cy="74" r="8" fill="#FB7185" fillOpacity="0.45" />
        <circle cx="102" cy="74" r="8" fill="#FB7185" fillOpacity="0.45" />

        {/* NARICITA Y BOCA TIPO DUOLINGO */}
        <ellipse cx="70" cy="70" rx="4" ry="3.2" fill="#F43F5E" />
        <path
          d="M 64,74 Q 67,78 70,75 Q 73,78 76,74"
          stroke="#78350F"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* COLLAR MÉDICO VETCONNECT EN MENTA BOLD */}
        <path
          d="M 44,92 Q 70,102 96,92"
          stroke="#00C48C"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        {/* Medalla de doctor con cruz clínica */}
        <circle cx="70" cy="101" r="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
        <path d="M 70,98 V 104 M 67,101 H 73" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />

        {/* OJOS GIGANTES EXPRESIVOS TIPO DUOLINGO (Legibles a distancia) */}
        {!isCoveringEyes ? (
          <>
            {/* OJO IZQUIERDO */}
            <g>
              {/* Esclera Blanca Gigante */}
              <ellipse cx="48" cy="54" rx="14" ry="15" fill="#FFFFFF" />
              {/* Pupila Negra Bold con Seguimiento */}
              <g
                style={{
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                  transition: isDesktop ? 'transform 0.08s ease-out' : 'transform 0.2s ease',
                }}
              >
                <ellipse cx="48" cy="54" rx="9.5" ry="10.5" fill="#18181B" />
                {/* Gran Reflejo Blanco Especular Nítido */}
                <circle cx="45.5" cy="50.5" r="4" fill="#FFFFFF" />
                {/* Micro destello tierno */}
                <circle cx="51" cy="56" r="1.6" fill="#FFFFFF" />
              </g>
            </g>

            {/* OJO DERECHO */}
            <g>
              {/* Esclera Blanca Gigante */}
              <ellipse cx="92" cy="54" rx="14" ry="15" fill="#FFFFFF" />
              {/* Pupila Negra Bold con Seguimiento */}
              <g
                style={{
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                  transition: isDesktop ? 'transform 0.08s ease-out' : 'transform 0.2s ease',
                }}
              >
                <ellipse cx="92" cy="54" rx="9.5" ry="10.5" fill="#18181B" />
                {/* Gran Reflejo Blanco Especular Nítido */}
                <circle cx="89.5" cy="50.5" r="4" fill="#FFFFFF" />
                {/* Micro destello tierno */}
                <circle cx="95" cy="56" r="1.6" fill="#FFFFFF" />
              </g>
            </g>
          </>
        ) : (
          <>
            {/* OJOS CERRADOS FELICES (^ ^) CON TRAZO GRUESO BOLD */}
            <path
              d="M 37,56 Q 48,44 59,56"
              stroke="#78350F"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 81,56 Q 92,44 103,56"
              stroke="#78350F"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        )}

        {/* MANITAS REGORDETAS CARICATURESCAS */}
        <g
          className="transition-transform duration-300 ease-out"
          style={{
            transform: isCoveringEyes ? 'translateY(-34px) scale(1.12)' : 'translateY(0px)',
            transformOrigin: '70px 95px',
          }}
        >
          {/* Patita Izquierda */}
          <ellipse cx="44" cy="94" rx="12" ry="10" fill="#F59E0B" />
          <circle cx="44" cy="93" r="3.5" fill="#FDA4AF" />

          {/* Patita Derecha */}
          <ellipse cx="96" cy="94" rx="12" ry="10" fill="#F59E0B" />
          <circle cx="96" cy="93" r="3.5" fill="#FDA4AF" />
        </g>
      </svg>
    </div>
  );
};

export default HamsterMascot;
