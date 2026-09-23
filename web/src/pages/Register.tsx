import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
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
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import HamsterMascot from '../components/ui/HamsterMascot';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CLIENT' as Role,
    licenseNumber: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await register(formData);
      if (user.role === 'VET') {
        navigate('/vet/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error al registrar usuario');
      } else {
        setError('Error al registrar usuario');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:grid lg:grid-cols-12 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Columna Izquierda: Branding Pinnacle Group & Respaldo (Desktop) */}
      <section className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#022A21] via-[#03362A] to-slate-950 text-white p-8 lg:p-14 flex-col justify-between border-b lg:border-b-0 lg:border-r border-emerald-900/60 relative overflow-hidden">
        {/* Halos ambientales */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header de Marca */}
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
                  Comunidad Médica
                </span>
              </span>
              <p className="text-xs text-slate-400 font-medium group-hover:text-emerald-300 transition-colors">
                Portal Unificado de Salud Animal
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
              Creá tu cuenta clínica y conectá con veterinarios en vivo.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Accedé como tutor para tus animales o como veterinario matriculado para brindar guardias y emitir recetas digitales con código QR.
            </p>
          </div>

          {/* Beneficios Clave Minimalistas */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Historias Clínicas Inmutables</p>
                <p className="text-[11px] text-slate-400">Trazabilidad y protección de datos bajo Ley 25.326</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Validación de Matrícula Profesional</p>
                <p className="text-[11px] text-slate-400">SENASA Res. 1442/2021 para médicos colegiados</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Lock className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Streaming Seguro de Baja Latencia</p>
                <p className="text-[11px] text-slate-400">Tecnología provista y respaldada por Pinnacle Group</p>
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

      {/* Columna Derecha: Tarjeta de Registro con Mascota Hamster Interactiva */}
      <section className="lg:col-span-7 bg-[#F9FBFA] flex items-center justify-center p-6 sm:p-12 lg:p-14">
        <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/80 transition-all duration-200">
          {/* Botón de retorno al inicio */}
          <div className="mb-4 flex justify-between items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg px-2.5 py-1 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/70"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-emerald-700" aria-hidden="true" />
              <span>Volver al inicio</span>
            </Link>

            <span className="text-[10px] font-semibold text-slate-400">Alta Segura SSL</span>
          </div>

          {/* LA MASCOTA OFICIAL: HÁMSTER TIPO DUOLINGO ANIMADO */}
          <div className="flex flex-col items-center justify-center mb-1">
            <HamsterMascot
              isCoveringEyes={showPassword || isPasswordFocused}
              isLookingAtInput={isInputFocused}
              className="mb-1"
            />
          </div>

          {/* Encabezado del Formulario */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold mb-2">
              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Alta de Usuario Seguro</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Registro en VetConnect
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Completá tus datos para ingresar al sistema de salud animal.
            </p>
          </div>

          {/* Banner de Error Accesible */}
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs sm:text-sm mb-5 flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="register-firstname"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Nombre
                </label>
                <input
                  id="register-firstname"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  required
                  autoComplete="given-name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="Ej. Juan"
                />
              </div>
              <div>
                <label
                  htmlFor="register-lastname"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Apellido
                </label>
                <input
                  id="register-lastname"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  required
                  autoComplete="family-name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="Ej. Pérez"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Correo Electrónico
              </label>
              <input
                id="register-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                placeholder="ejemplo@vetconnect.com"
              />
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full pl-3.5 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="Mínimo 8 caracteres"
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

            <div>
              <label
                htmlFor="register-role"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Tipo de Usuario
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    formData.role === 'CLIENT'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>🐕</span>
                  <span>Tutor / Cliente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'VET' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    formData.role === 'VET'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>🩺</span>
                  <span>Veterinario</span>
                </button>
              </div>
              <select
                id="register-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all sr-only"
                aria-label="Seleccionar rol de usuario"
              >
                <option value="CLIENT">Tutor / Cliente</option>
                <option value="VET">Veterinario</option>
              </select>
            </div>

            {formData.role === 'VET' && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1 animate-fadeIn">
                <label
                  htmlFor="register-license"
                  className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1"
                >
                  Matrícula Profesional
                </label>
                <input
                  id="register-license"
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                  placeholder="Ej. MP-1234"
                />
                <p className="text-[11px] text-emerald-700 mt-1">
                  * Sujeto a verificación administrativa previa habilitación de consultas (SENASA Res. 1442/2021).
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#03362A] hover:bg-[#044c3b] active:bg-[#022c22] text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md shadow-[#03362A]/20 hover:shadow-lg transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group cursor-pointer mt-3"
            >
              <span>{isSubmitting ? 'Registrando...' : 'Crear Cuenta'}</span>
              {!isSubmitting && (
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              )}
            </button>
          </form>

          {/* Enlace a Login */}
          <p className="text-center text-xs sm:text-sm text-slate-600 mt-6 pt-4 border-t border-slate-100">
            ¿Ya tenés cuenta?{' '}
            <Link
              to="/login"
              className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline transition-colors"
            >
              Iniciá sesión
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

export default Register;
