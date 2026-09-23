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
  Heart,
  Stethoscope,
  PawPrint,
  CheckCircle2,
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
      {/* Columna Izquierda: Acompañamiento Emocional & Respaldo Pinnacle Broadcast (Desktop) */}
      <section className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#06241D] via-[#0A332A] to-[#041B15] text-white p-8 lg:p-12 flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#0D3E33] relative overflow-hidden">
        {/* Halos cálidos sutiles de fondo (esmeralda y miel suave, sin saturación artificial) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          {/* Switcher de Canal / Retorno a Inicio de Marca */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-[0.98] border border-white/[0.12] hover:border-emerald-400/50 shadow-md transition-all duration-200 group cursor-pointer"
              title="Volver a la portada de VetConnect"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00D084] to-[#00A86B] flex items-center justify-center text-slate-950 shadow-sm">
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

          {/* Título y Conexión Emocional */}
          <div className="space-y-3.5 max-w-lg mb-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black tracking-wider uppercase backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
              <span>CUIDADO CLÍNICO CONSCIENTE &bull; 24HS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight font-display">
              Cuidamos a los que más amás, con empatía y precisión médica.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Conectá en menos de 3 minutos con veterinarios matriculados. Desde una consulta preventiva hasta una urgencia nocturna, acompañamos a tu mascota con calidez humana y la infraestructura de transmisión de <span className="text-white font-bold">Pinnacle Group</span>.
            </p>
          </div>

          {/* Ficha Cálida de Atención Médica en Tiempo Real */}
          <div className="p-4 rounded-3xl bg-[#031D17]/90 border border-emerald-800/40 shadow-xl backdrop-blur-xl relative max-w-md overflow-hidden space-y-3">
            {/* Cabecera del Doctor y Estado */}
            <div className="flex justify-between items-center pb-2.5 border-b border-emerald-900/60 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold font-mono">EN GUARDIA ACTIVA</span>
              </div>
              <span className="text-slate-400 font-mono">LiveKit SFU 18ms</span>
            </div>

            {/* Tarjeta de Paciente con Calidez */}
            <div className="rounded-2xl bg-black/40 p-3.5 border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">Dra. Silvina Romero</p>
                    <p className="text-[10px] text-emerald-400 font-mono mt-1">M.P. 4492 &bull; Guardia Médica</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  <PawPrint className="w-3 h-3 text-amber-300" />
                  <span>Milo (Golden)</span>
                </div>
              </div>

              {/* Mensaje de Empatía Humana */}
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 text-[11px] text-slate-300 italic leading-snug">
                &ldquo;La tranquilidad de ver a tu compañero aliviado y en paz desde casa, sin el estrés de una sala de espera ruidosa.&rdquo;
              </div>

              {/* Indicador de Audio HD */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono">AUDIO HD 48kHz</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Conexión segura SSL</span>
                </div>
              </div>
            </div>

            {/* Sello de Respaldo Tecnológico */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#00D084]" />
                <span>Infraestructura Audiovisual</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">PINNACLE BROADCAST</span>
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

      {/* Columna Derecha: Tarjeta de Acceso con Mascota Hamster Duolingo en Paleta Cálida */}
      <section className="lg:col-span-7 bg-[#F8F5EE] border-t lg:border-t-0 lg:border-l border-[#E6E0D3] flex items-center justify-center p-6 sm:p-12 lg:p-14 relative">
        <div className="w-full max-w-md bg-white p-8 sm:p-11 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(7,36,30,0.07)] border border-[#E8E2D6] transition-all duration-300 animate-fadeIn">
          {/* Botón de retorno al inicio accesible */}
          <div className="mb-7 flex justify-between items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#5C564C] hover:text-[#0A342B] active:scale-[0.97] transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-[#0A342B] rounded-full px-3.5 py-1.5 bg-[#F2EDE2] hover:bg-[#E9E3D6] border border-[#DDD7CB] cursor-pointer"
              title="Volver a la portada de VetConnect"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-[#8C8578] group-hover:text-[#0A342B]" aria-hidden="true" />
              <span>Volver al inicio</span>
            </Link>

            <span className="text-[11px] font-semibold text-[#8C8578] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#0A342B]" />
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
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E1C18] tracking-tight font-display">
              Bienvenido a VetConnect
            </h2>
            <p className="text-xs sm:text-sm text-[#6E675C] mt-1 font-normal">
              Ingresá tus credenciales para acceder a tus consultas.
            </p>
          </div>

          {/* Banner de Aviso: Olvidaste contraseña */}
          {forgotPasswordNotice && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] p-4 rounded-2xl text-xs mb-5 flex items-start gap-2.5 animate-fadeIn shadow-sm">
              <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block text-[#78350F]">¿Olvidaste tu contraseña?</span>
                <span className="text-[#92400E] leading-relaxed">
                  Comunicate con soporte técnico de Pinnacle Group escribiendo a <span className="font-semibold text-[#78350F]">soporte@vetconnect.com.ar</span> para restablecer tu acceso seguro.
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
                className="block text-xs font-bold uppercase tracking-wider text-[#3D3A34] mb-1.5"
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
                className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#DCD5C8] rounded-2xl text-[#1E1C18] text-sm focus:outline-none focus:ring-4 focus:ring-[#0A342B]/10 focus:border-[#0A342B] focus:bg-white transition-all duration-200 placeholder:text-[#A39E93]"
                placeholder="ejemplo@vetconnect.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#3D3A34]"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordNotice(!forgotPasswordNotice)}
                  className="text-xs font-semibold text-[#0A342B] hover:text-[#0E463A] hover:underline cursor-pointer transition-colors"
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
                  className="w-full pl-4 pr-12 py-3 bg-[#FAF8F4] border border-[#DCD5C8] rounded-2xl text-[#1E1C18] text-sm focus:outline-none focus:ring-4 focus:ring-[#0A342B]/10 focus:border-[#0A342B] focus:bg-white transition-all duration-200 placeholder:text-[#A39E93]"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-[#8C8578] hover:text-[#0A342B] hover:bg-[#EFE9DC] active:scale-90 transition-all duration-150 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#0A342B]" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0A342B] hover:bg-[#0E463A] active:bg-[#07241E] active:scale-[0.98] text-white py-3.5 px-5 rounded-2xl font-bold text-sm shadow-md shadow-[#0A342B]/20 hover:shadow-xl hover:shadow-[#0A342B]/25 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group cursor-pointer mt-3"
            >
              <span>{isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
              {!isSubmitting && (
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
              )}
            </button>
          </form>

          {/* Enlace a Registro */}
          <p className="text-center text-xs sm:text-sm text-[#5C564C] mt-6 pt-5 border-t border-[#EAE4D8]">
            ¿No tenés una cuenta?{' '}
            <Link
              to="/register"
              className="text-[#0A342B] font-bold hover:text-[#0E463A] hover:underline transition-colors"
            >
              Registrate aquí
            </Link>
          </p>

          <p className="text-center text-[10px] text-[#8C8578] mt-4">
            Infraestructura y streaming por <span className="font-semibold text-[#3D3A34]">Pinnacle Group</span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
