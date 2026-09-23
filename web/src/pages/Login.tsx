import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  HeartHandshake,
  AlertCircle,
  ArrowRight,
  Stethoscope,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
} from 'lucide-react';
import HamsterMascot from '../components/ui/HamsterMascot';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
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
      {/* Columna Izquierda: Branding Pinnacle Group & Respaldo Tecnológico (Desktop) */}
      <section className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#022A21] via-[#03362A] to-slate-950 text-white p-8 lg:p-14 flex-col justify-between border-b lg:border-b-0 lg:border-r border-emerald-900/60 relative overflow-hidden">
        {/* Halos ambientales */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header de Marca (Enlace al inicio) */}
          <Link
            to="/"
            className="inline-flex items-center gap-3 mb-10 group focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-xl p-1"
            title="Volver a la página principal"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#00D084] to-[#00A86B] flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6 text-[#022A21]" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                VetConnect
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Hospitalaria
                </span>
              </span>
              <p className="text-xs text-slate-400 font-medium group-hover:text-emerald-300 transition-colors">
                Telemedicina Veterinaria Oficial
              </p>
            </div>
          </Link>

          {/* Título de Propuesta de Valor */}
          <div className="space-y-4 max-w-lg mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-emerald-300 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Infraestructura Pinnacle Group</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Cuidado veterinario en vivo, rápido y sin complicaciones.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Accedé a tus consultas clínicas de guardia, recetas digitales homologadas con código QR y el historial unificado de tus compañeros.
            </p>
          </div>

          {/* 3 Beneficios Clave Minimalistas */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Guardia Activa 24 Horas</p>
                <p className="text-[11px] text-slate-400">Atención médica en menos de 3 minutos</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">SENASA Res. 1442/2021</p>
                <p className="text-[11px] text-slate-400">Prescripciones oficiales con firma digital</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Lock className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Transmisión Segura de Baja Latencia</p>
                <p className="text-[11px] text-slate-400">Tecnología de streaming provista por Pinnacle Group</p>
              </div>
            </div>
          </div>
        </div>

        {/* Respaldo Institucional Pinnacle Group */}
        <div className="relative z-10 mt-10 pt-6 border-t border-emerald-900/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            <p className="font-bold text-slate-200">Pinnacle Group</p>
            <p className="text-[10px] text-slate-500">Soluciones Audiovisuales, Broadcast & Streaming</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            Sponsor Oficial
          </span>
        </div>
      </section>

      {/* Columna Derecha: Tarjeta de Acceso con Mascota Hamster Interactiva */}
      <section className="lg:col-span-7 bg-[#F9FBFA] flex items-center justify-center p-6 sm:p-12 lg:p-14">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/80 transition-all duration-200">
          {/* Botón de retorno al inicio */}
          <div className="mb-4 flex justify-between items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg px-2.5 py-1 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/70"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-emerald-700" aria-hidden="true" />
              <span>Volver al inicio</span>
            </Link>

            <span className="text-[10px] font-semibold text-slate-400">Acceso Seguro SSL</span>
          </div>

          {/* LA MASCOTA OFICIAL: HÁMSTER TIPO DUOLINGO ANIMADO */}
          <div className="flex flex-col items-center justify-center mb-1">
            <HamsterMascot
              isCoveringEyes={showPassword || isPasswordFocused}
              isLookingAtInput={isEmailFocused}
              className="mb-1"
            />
          </div>

          {/* Encabezado del Formulario */}
          <div className="text-center mb-7">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bienvenido a VetConnect
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ingresá tus credenciales para acceder a tus consultas.
            </p>
          </div>

          {/* Banner de Aviso: Olvidaste contraseña */}
          {forgotPasswordNotice && (
            <div className="bg-sky-50 border border-sky-200 text-sky-800 p-3.5 rounded-2xl text-xs mb-5 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">¿Olvidaste tu contraseña?</span>
                <span>Contactá al soporte de Pinnacle Group a soporte@vetconnect.com.ar para restablecer tu clave segura.</span>
              </div>
            </div>
          )}

          {/* Banner de Error Accesible */}
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs mb-5 flex items-start gap-2.5 animate-fadeIn"
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
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
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
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
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
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 focus:outline-none"
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
              className="w-full bg-[#03362A] hover:bg-[#044c3b] active:bg-[#022c22] text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md shadow-[#03362A]/20 hover:shadow-lg transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group cursor-pointer mt-3"
            >
              <span>{isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
              {!isSubmitting && (
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              )}
            </button>
          </form>

          {/* Enlace a Registro */}
          <p className="text-center text-xs sm:text-sm text-slate-600 mt-6 pt-4 border-t border-slate-100">
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
