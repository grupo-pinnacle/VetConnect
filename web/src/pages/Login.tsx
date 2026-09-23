import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Radio,
  Volume2,
  Tv,
} from 'lucide-react';
import HamsterMascot from '../components/ui/HamsterMascot';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      if (user.role === 'VET') {
        navigate('/vet/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error al iniciar sesión');
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:grid lg:grid-cols-12 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Columna Izquierda: Master Control Room & Pinnacle Broadcast Studio (Desktop) */}
      <section className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#021F18] via-[#032E24] to-slate-950 text-white p-8 lg:p-12 flex-col justify-between border-b lg:border-b-0 lg:border-r border-emerald-900/60 relative overflow-hidden">
        {/* Halos de iluminación de estudio broadcast */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          {/* Switcher de Canal / Retorno a Inicio de Marca */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-[0.98] border border-white/[0.12] hover:border-emerald-400/60 shadow-lg shadow-black/20 transition-all duration-200 group cursor-pointer"
              title="Volver a la portada de VetConnect"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00D084] to-[#00A86B] flex items-center justify-center text-slate-950 shadow-md">
                <Tv className="w-4 h-4 text-[#021F18]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight text-white font-display">VetConnect Live</span>
                  <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-0.5 group-hover:-translate-x-1 transition-transform">
                    ← Volver
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Canal Oficial de Telemedicina</p>
              </div>
            </Link>
          </div>

          {/* Título de Propuesta Inesperada: Calidad Broadcast */}
          <div className="space-y-3 max-w-lg mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-black tracking-wider uppercase backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>ON AIR • TRANSMISIÓN EN VIVO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight font-display">
              Telemedicina con calidad de broadcast profesional.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Guardia médica en tiempo real a 60 FPS sin latencia, impulsada por la infraestructura audiovisual y de streaming de <span className="text-white font-bold">Pinnacle Group</span>.
            </p>
          </div>

          {/* Monitor de Estudio de Transmisión (Blackmagic / Broadcast Styling) */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl relative max-w-md overflow-hidden">
            {/* Cabecera del Monitor con SMPTE Timecode y Estado */}
            <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-slate-800 text-[10px] font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold">CAM-01 • HD 1080p</span>
              </div>
              <span className="text-slate-400">SMPTE: 00:14:32:18</span>
            </div>

            {/* Pantalla Simulada de Transmisión */}
            <div className="relative rounded-2xl bg-slate-950 aspect-video flex flex-col justify-between p-3 border border-slate-800/90 overflow-hidden mb-3">
              {/* Marcas de Encuadre de Cámara [ + ] */}
              <div className="absolute inset-2 border border-dashed border-white/20 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-white/20 text-lg font-mono">+</span>
              </div>

              {/* Tag de Especialista en Cámara */}
              <div className="relative z-10 flex justify-between items-start text-[10px]">
                <div className="bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-white flex items-center gap-1.5">
                  <span>🩺</span>
                  <span className="font-bold">Dra. Silvina Romero (M.P. 4492)</span>
                </div>
                <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
                  SFU 18ms
                </div>
              </div>

              {/* VU Meter de Audio en Tiempo Real */}
              <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-[9px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono">AUDIO 48kHz</span>
                </div>
                {/* Barras de Vúmetro simuladas */}
                <div className="flex items-center gap-0.5 h-2">
                  <span className="w-1 h-2 bg-emerald-400 rounded-sm" />
                  <span className="w-1 h-2.5 bg-emerald-400 rounded-sm" />
                  <span className="w-1 h-3 bg-emerald-400 rounded-sm" />
                  <span className="w-1 h-2 bg-emerald-400 rounded-sm" />
                  <span className="w-1 h-2.5 bg-amber-400 rounded-sm" />
                  <span className="w-1 h-1 bg-slate-700 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Sello de Infraestructura Pinnacle Group */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#00D084]" />
                <span>LiveKit Cloud SFU Streaming</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">LATENCIA ULTRA BAJA</span>
            </div>
          </div>
        </div>

        {/* Respaldo Institucional Oficial Pinnacle Group */}
        <div className="relative z-10 mt-8 pt-5 border-t border-emerald-900/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            <p className="font-black text-slate-100 font-display text-sm tracking-wide">PINNACLE GROUP</p>
            <p className="text-[10px] text-slate-400">Sponsor Oficial de Tecnología Broadcast &amp; Streaming</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white font-mono font-bold text-xs">
            PG
          </div>
        </div>
      </section>

      {/* Columna Derecha: Tarjeta de Acceso con Mascota Hamster Duolingo */}
      <section className="lg:col-span-7 bg-gradient-to-br from-slate-50 via-[#F5FAF7] to-emerald-50/30 flex items-center justify-center p-6 sm:p-12 lg:p-14 relative">
        <div className="w-full max-w-md bg-white p-8 sm:p-11 rounded-[32px] shadow-[0_24px_64px_-12px_rgba(2,42,33,0.08)] border border-slate-200/80 transition-all duration-300 animate-fadeIn">
          {/* Botón de retorno al inicio accesible */}
          <div className="mb-8 flex justify-between items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 active:scale-[0.97] transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full px-3.5 py-1.5 bg-slate-100/80 hover:bg-emerald-50 border border-slate-200/80 cursor-pointer"
              title="Volver a la portada de VetConnect"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-slate-400 group-hover:text-emerald-700" aria-hidden="true" />
              <span>Volver al inicio</span>
            </Link>

            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Acceso Cifrado SSL</span>
            </span>
          </div>

          {/* LA MASCOTA OFICIAL: HÁMSTER MINIMALISTA ESTILO DUOLINGO */}
          {/* REGLA: isCoveringEyes se activa EXCLUSIVAMENTE al tocar el botón de ver contraseña */}
          <div className="flex flex-col items-center justify-center mb-2">
            <HamsterMascot
              isCoveringEyes={showPassword}
              isLookingAtInput={isEmailFocused}
              className="mb-1"
            />
          </div>

          {/* Encabezado del Formulario */}
          <div className="text-center mb-7">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Bienvenido a VetConnect
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Ingresá tus credenciales para acceder a tus consultas.
            </p>
          </div>

          {/* Banner de Aviso: Olvidaste contraseña */}
          {forgotPasswordNotice && (
            <div className="bg-sky-50/90 border border-sky-200 text-sky-800 p-4 rounded-2xl text-xs mb-5 flex items-start gap-2.5 animate-fadeIn shadow-sm">
              <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block text-sky-900">¿Olvidaste tu contraseña?</span>
                <span className="text-slate-600 leading-relaxed">
                  Comunicate con soporte técnico de Pinnacle Group escribiendo a <span className="font-semibold text-sky-900">soporte@vetconnect.com.ar</span> para restablecer tu acceso seguro.
                </span>
              </div>
            </div>
          )}

          {/* Banner de Error Accesible */}
          {error && (
            <div
              role="alert"
              className="bg-red-50/90 border border-red-200 text-red-700 p-4 rounded-2xl text-xs mb-5 flex items-start gap-2.5 animate-fadeIn shadow-sm"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Correo Electrónico
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-300/90 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white transition-all duration-200 placeholder:text-slate-400"
                placeholder="ejemplo@vetconnect.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordNotice(!forgotPasswordNotice)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-4 pr-12 py-3 bg-slate-50/80 border border-slate-300/90 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white transition-all duration-200 placeholder:text-slate-400"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50/80 active:scale-90 transition-all duration-150 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#032E24] hover:bg-[#044c3b] active:bg-[#02231b] active:scale-[0.98] text-white py-3.5 px-5 rounded-2xl font-bold text-sm shadow-md shadow-[#032E24]/20 hover:shadow-xl hover:shadow-[#032E24]/25 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group cursor-pointer mt-3"
            >
              <span>{isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
              {!isSubmitting && (
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
              )}
            </button>
          </form>

          {/* Enlace a Registro */}
          <p className="text-center text-xs sm:text-sm text-slate-600 mt-6 pt-5 border-t border-slate-100">
            ¿No tenés una cuenta?{' '}
            <Link
              to="/register"
              className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline transition-colors"
            >
              Registrate aquí
            </Link>
          </p>

          <p className="text-center text-[10px] text-slate-400 mt-4">
            Infraestructura y streaming por <span className="font-semibold text-slate-700">Pinnacle Group</span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
