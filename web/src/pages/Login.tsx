import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  ArrowRight,
  Stethoscope,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Activity,
  HeartPulse,
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
      {/* Columna Izquierda: Branding Pinnacle Group & Hub Clínico en Vivo (Desktop) */}
      <section className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#022A21] via-[#03362A] to-slate-950 text-white p-8 lg:p-14 flex-col justify-between border-b lg:border-b-0 lg:border-r border-emerald-900/60 relative overflow-hidden">
        {/* Halos ambientales suaves y orgánicos */}
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-teal-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#00D084]/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10">
          {/* Header de Marca Claramente Distinguible como Botón de Retorno al Inicio */}
          <div className="mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-[0.98] border border-white/[0.12] hover:border-emerald-400/50 shadow-lg shadow-black/20 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              title="Volver a la página de inicio"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D084] to-[#00A86B] flex items-center justify-center shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-5 h-5 text-[#022A21]" aria-hidden="true" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-white font-display">
                    VetConnect
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1 group-hover:-translate-x-0.5 transition-transform">
                    <span>←</span>
                    <span>Inicio</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Portal Oficial de Telemedicina</p>
              </div>
            </Link>
          </div>

          {/* Título de Propuesta de Valor */}
          <div className="space-y-4 max-w-lg mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tecnología Pinnacle Group</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-display">
              Cuidado veterinario en vivo, cuando cada segundo cuenta.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Accedé a tus videoconsultas de guardia, recetas digitales homologadas con código QR y seguimiento clínico seguro de tus compañeros.
            </p>
          </div>

          {/* Hub Clínico en Vivo (Monitor de Guardia con Glassmorphism) */}
          <div className="p-5 rounded-3xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-xl space-y-4 shadow-xl shadow-black/10 max-w-md">
            {/* Cabecera de estado activo con pulso */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  Guardia Médica 24hs Activa
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-300 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                8 Médicos Online
              </span>
            </div>

            {/* Ficha de Especialistas de Guardia */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🩺</span>
                  <span className="font-semibold text-white">Dra. Silvina Romero</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">M.P. 4492 • Disponible</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🐱</span>
                  <span className="font-semibold text-white">Dr. Nicolás Chen</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">M.P. 3821 • Disponible</span>
              </div>
            </div>

            {/* Indicadores Clínicos Clave */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <p className="text-[10px] text-slate-400 font-medium">Tiempo de espera</p>
                <p className="font-extrabold text-white text-xs mt-0.5 font-mono">&lt; 2 min 40 s</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <p className="text-[10px] text-slate-400 font-medium">Receta Digital</p>
                <p className="font-extrabold text-emerald-300 text-xs mt-0.5">SENASA Res. 1442</p>
              </div>
            </div>
          </div>
        </div>

        {/* Respaldo Institucional Oficial Pinnacle Group */}
        <div className="relative z-10 mt-8 pt-6 border-t border-emerald-900/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            <p className="font-bold text-slate-200">Pinnacle Group</p>
            <p className="text-[10px] text-slate-400">Infraestructura Audiovisual, Broadcast &amp; Streaming SFU</p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            Sponsor Oficial
          </span>
        </div>
      </section>

      {/* Columna Derecha: Tarjeta de Acceso con Mascota Hamster Orgánica */}
      <section className="lg:col-span-7 bg-gradient-to-br from-slate-50 via-[#F4F9F6] to-emerald-50/40 flex items-center justify-center p-6 sm:p-12 lg:p-14 relative">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-8 sm:p-11 rounded-[32px] shadow-[0_24px_64px_-12px_rgba(2,42,33,0.08)] border border-emerald-950/[0.06] transition-all duration-300 animate-fadeIn">
          {/* Botón de retorno al inicio accesible */}
          <div className="mb-8 flex justify-between items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 active:scale-[0.97] transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full px-3 py-1.5 bg-slate-100/80 hover:bg-emerald-50 border border-slate-200/80"
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

          {/* LA MASCOTA OFICIAL: HÁMSTER ORGÁNICO CON EXPRESIONES */}
          {/* REGLA: isCoveringEyes se activa EXCLUSIVAMENTE cuando el usuario toca el botón de ver contraseña */}
          <div className="flex flex-col items-center justify-center mb-1">
            <HamsterMascot
              isCoveringEyes={showPassword}
              isLookingAtInput={isEmailFocused}
              className="mb-1.5"
            />
          </div>

          {/* Encabezado del Formulario */}
          <div className="text-center mb-7">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
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
                  Comunicate con el equipo de soporte técnico de Pinnacle Group escribiendo a <span className="font-semibold text-sky-900">soporte@vetconnect.com.ar</span> para restablecer tu clave segura.
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50/80 active:scale-90 transition-all duration-150 focus:outline-none"
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
              className="w-full bg-[#03362A] hover:bg-[#044c3b] active:bg-[#022c22] active:scale-[0.98] text-white py-3.5 px-5 rounded-2xl font-bold text-sm shadow-md shadow-[#03362A]/20 hover:shadow-xl hover:shadow-[#03362A]/25 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group cursor-pointer mt-3"
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
            Tecnología y soporte por <span className="font-semibold text-slate-600">Pinnacle Group</span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
