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
      const distance = Math.min(Math.hypot(deltaX, deltaY) / 28, 4); // Radio máximo suave de 4px

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
      {/* Bocadillo adorable cuando se tapa los ojos al ver contraseña */}
      <div
        className={`absolute -top-7 transition-all duration-300 ease-out z-20 pointer-events-none ${
          isCoveringEyes
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-2 scale-90'
        }`}
      >
        <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-300/80 text-[11px] font-bold px-3 py-1 rounded-2xl shadow-md shadow-amber-900/10 flex items-center gap-1.5 whitespace-nowrap animate-bounce">
          <span className="text-sm">🙈</span>
          <span>¡No estoy mirando!</span>
          {/* Colita del bocadillo */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-50 border-b border-r border-amber-300/80 rotate-45" />
        </div>
      </div>

      <svg
        viewBox="0 0 160 140"
        className="w-28 h-24 sm:w-32 sm:h-28 drop-shadow-[0_8px_16px_rgba(217,119,6,0.18)] transition-all duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradiente suave del pelaje cálido */}
          <linearGradient id="furGrad" x1="80" y1="20" x2="80" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="65%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Gradiente de las orejas internas */}
          <linearGradient id="earInnerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FECDD3" />
            <stop offset="100%" stopColor="#FB7185" />
          </linearGradient>

          {/* Gradiente del hocico esponjoso blanco */}
          <linearGradient id="muzzleGrad" x1="80" y1="65" x2="80" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFFBEB" />
          </linearGradient>

          {/* Rubor radial suave difuminado */}
          <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FB7185" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
          </radialGradient>

          {/* Gradiente del estetoscopio médico */}
          <linearGradient id="stethoGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Shimmer metálico del estetoscopio */}
          <radialGradient id="metalShine" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </radialGradient>
        </defs>

        {/* OREJAS ORGÁNICAS (Suaves con volumen) */}
        {/* Oreja Izquierda */}
        <g>
          <ellipse cx="40" cy="34" rx="15" ry="17" fill="url(#furGrad)" transform="rotate(-10 40 34)" />
          <ellipse cx="40" cy="35" rx="9" ry="11" fill="url(#earInnerGrad)" transform="rotate(-10 40 35)" />
        </g>
        {/* Oreja Derecha */}
        <g>
          <ellipse cx="120" cy="34" rx="15" ry="17" fill="url(#furGrad)" transform="rotate(10 120 34)" />
          <ellipse cx="120" cy="35" rx="9" ry="11" fill="url(#earInnerGrad)" transform="rotate(10 120 35)" />
        </g>

        {/* CABEZA ORGÁNICA CON CACHETES REDONDITOS */}
        <path
          d="M 38,76 C 30,92 42,112 80,112 C 118,112 130,92 122,76 C 118,48 106,34 80,34 C 54,34 42,48 38,76 Z"
          fill="url(#furGrad)"
        />

        {/* CACHETES Y HOCICO BLANCO ESPONJOSO (Contornos fluidos) */}
        <path
          d="M 46,82 C 46,72 58,68 80,68 C 102,68 114,72 114,82 C 114,98 100,108 80,108 C 60,108 46,98 46,82 Z"
          fill="url(#muzzleGrad)"
        />

        {/* MEJILLAS ROSADAS CON RUBOR RADIAL DIFUMINADO */}
        <circle cx="48" cy="84" r="10" fill="url(#blushGrad)" />
        <circle cx="112" cy="84" r="10" fill="url(#blushGrad)" />

        {/* NARICITA DE FRESA REDONDEADA */}
        <path
          d="M 76,76 C 76,73 84,73 84,76 C 84,79 81,81 80,81 C 79,81 76,79 76,76 Z"
          fill="#E11D48"
        />

        {/* BOQUITA SONRIENTE SUAVE */}
        <path
          d="M 74,83 Q 77,87 80,84 Q 83,87 86,83"
          stroke="#78350F"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ESTETOSCOPIO MÉDICO OFICIAL DE VETCONNECT */}
        <path
          d="M 52,96 C 52,115 108,115 108,96"
          stroke="url(#stethoGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Campana del estetoscopio con brillo metálico */}
        <circle cx="80" cy="116" r="6" fill="url(#metalShine)" stroke="#047857" strokeWidth="1.5" />
        <circle cx="78.5" cy="114.5" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />

        {/* OJOS: ABIERTOS (Gaze dinámico con doble brillo) vs CERRADOS (^ ^) */}
        {!isCoveringEyes ? (
          <>
            {/* OJO IZQUIERDO */}
            <g>
              <ellipse cx="58" cy="62" rx="10" ry="11" fill="#FFFFFF" />
              {/* Pupila móvil con seguimiento suave */}
              <g
                style={{
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                  transition: isDesktop ? 'transform 0.08s ease-out' : 'transform 0.25s ease',
                }}
              >
                {/* Iris profundo */}
                <ellipse cx="58" cy="62" rx="6.5" ry="7" fill="#0F172A" />
                {/* Media luna cálida de luz en iris */}
                <path
                  d="M 54,64 A 4.5 4.5 0 0 0 62,64 A 4 4 0 0 1 54,64"
                  fill="#D97706"
                  opacity="0.85"
                />
                {/* Brillo especular principal */}
                <circle cx="56" cy="59.5" r="2.4" fill="#FFFFFF" />
                {/* Brillo secundario de ternura */}
                <circle cx="60.5" cy="63.5" r="1.2" fill="#FFFFFF" />
              </g>
            </g>

            {/* OJO DERECHO */}
            <g>
              <ellipse cx="102" cy="62" rx="10" ry="11" fill="#FFFFFF" />
              {/* Pupila móvil con seguimiento suave */}
              <g
                style={{
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                  transition: isDesktop ? 'transform 0.08s ease-out' : 'transform 0.25s ease',
                }}
              >
                {/* Iris profundo */}
                <ellipse cx="102" cy="62" rx="6.5" ry="7" fill="#0F172A" />
                {/* Media luna cálida de luz en iris */}
                <path
                  d="M 98,64 A 4.5 4.5 0 0 0 106,64 A 4 4 0 0 1 98,64"
                  fill="#D97706"
                  opacity="0.85"
                />
                {/* Brillo especular principal */}
                <circle cx="100" cy="59.5" r="2.4" fill="#FFFFFF" />
                {/* Brillo secundario de ternura */}
                <circle cx="104.5" cy="63.5" r="1.2" fill="#FFFFFF" />
              </g>
            </g>
          </>
        ) : (
          <>
            {/* OJITOS CERRADOS DE TERNURA Y VERGÜENZA (^ ^) */}
            <path
              d="M 50,65 Q 58,57 66,65"
              stroke="#78350F"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 94,65 Q 102,57 110,65"
              stroke="#78350F"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </>
        )}

        {/* PATITAS REDONDITAS (PAWS):
            - Abajo en reposo o sosteniendo el estetoscopio
            - Arriba tapándose los ojos con suavidad cuando isCoveringEyes === true */}
        <g
          className="transition-transform duration-300 ease-out"
          style={{
            transform: isCoveringEyes ? 'translateY(-27px) scale(1.08)' : 'translateY(0px)',
            transformOrigin: '80px 92px',
          }}
        >
          {/* Patita Izquierda */}
          <g>
            <ellipse cx="56" cy="94" rx="10" ry="8" fill="url(#furGrad)" stroke="#B45309" strokeWidth="1" />
            {/* Almohadilla rosa de patita */}
            <circle cx="56" cy="93" r="3.5" fill="#FDA4AF" />
            <circle cx="52" cy="91" r="1.5" fill="#FDA4AF" />
            <circle cx="56" cy="89" r="1.5" fill="#FDA4AF" />
            <circle cx="60" cy="91" r="1.5" fill="#FDA4AF" />
          </g>

          {/* Patita Derecha */}
          <g>
            <ellipse cx="104" cy="94" rx="10" ry="8" fill="url(#furGrad)" stroke="#B45309" strokeWidth="1" />
            {/* Almohadilla rosa de patita */}
            <circle cx="104" cy="93" r="3.5" fill="#FDA4AF" />
            <circle cx="100" cy="91" r="1.5" fill="#FDA4AF" />
            <circle cx="104" cy="89" r="1.5" fill="#FDA4AF" />
            <circle cx="108" cy="91" r="1.5" fill="#FDA4AF" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default HamsterMascot;
