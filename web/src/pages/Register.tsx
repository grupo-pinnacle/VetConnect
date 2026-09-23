import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Radio,
  Tv,
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
      {/* Columna Izquierda: Master Control Room & Pinnacle Broadcast Studio (Desktop) */}
      <section className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#021F18] via-[#032E24] to-slate-950 text-white p-8 lg:p-12 flex-col justify-between border-b lg:border-b-0 lg:border-r border-emerald-900/60 relative overflow-hidden">
        {/* Halos de ambientación de estudio broadcast */}
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

          {/* Título de Propuesta de Valor */}
          <div className="space-y-3 max-w-lg mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black tracking-wider uppercase backdrop-blur-sm">
              <Radio className="w-3.5 h-3.5 text-[#00D084]" />
              <span>ALTA DE NODO CLÍNICO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight font-display">
              Unite a la mayor red de telemedicina animal.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Creá tu usuario seguro como tutor o como médico colegiado para participar en guardias interactivas y emitir prescripciones oficiales QR.
            </p>
          </div>

          {/* Tarjeta de Garantías Clínicas Broadcast */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl space-y-3 max-w-md">
            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/[0.03]">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Historias Clínicas Inmutables</p>
                <p className="text-[11px] text-slate-400 leading-snug">Preservación estricta y soft-deletes auditados bajo Ley 25.326</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/[0.03]">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Validación de Matrícula Profesional</p>
                <p className="text-[11px] text-slate-400 leading-snug">Homologación ante SENASA Res. 1442/2021 para médicos veterinarios</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/[0.03]">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Transmisión Cifrada en Tiempo Real</p>
                <p className="text-[11px] text-slate-400 leading-snug">WebRTC SFU de grado broadcast provisto por Pinnacle Group</p>
              </div>
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

      {/* Columna Derecha: Tarjeta de Registro con Mascota Hamster Duolingo */}
      <section className="lg:col-span-7 bg-gradient-to-br from-slate-50 via-[#F5FAF7] to-emerald-50/30 flex items-center justify-center p-6 sm:p-12 lg:p-14 relative">
        <div className="w-full max-w-lg bg-white p-8 sm:p-11 rounded-[32px] shadow-[0_24px_64px_-12px_rgba(2,42,33,0.08)] border border-slate-200/80 transition-all duration-300 animate-fadeIn">
          {/* Botón de retorno accesible */}
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
              <span>Alta Segura SSL</span>
            </span>
          </div>

          {/* LA MASCOTA OFICIAL: HÁMSTER MINIMALISTA ESTILO DUOLINGO */}
          {/* REGLA: isCoveringEyes se activa EXCLUSIVAMENTE al tocar el botón de ver contraseña */}
          <div className="flex flex-col items-center justify-center mb-2">
            <HamsterMascot
              isCoveringEyes={showPassword}
              isLookingAtInput={isInputFocused}
              className="mb-1"
            />
          </div>

          {/* Encabezado del Formulario */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-semibold mb-2">
              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Alta de Usuario Seguro</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Registro en VetConnect
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Completá tus datos para ingresar al sistema de salud animal.
            </p>
          </div>

          {/* Banner de Error Accesible */}
          {error && (
            <div
              role="alert"
              className="bg-red-50/90 border border-red-200 text-red-700 p-4 rounded-2xl text-xs sm:text-sm mb-5 flex items-start gap-2.5 animate-fadeIn shadow-sm"
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
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-300/90 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white transition-all duration-200 placeholder:text-slate-400"
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
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-300/90 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white transition-all duration-200 placeholder:text-slate-400"
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
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-300/90 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white transition-all duration-200 placeholder:text-slate-400"
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
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full pl-4 pr-12 py-3 bg-slate-50/80 border border-slate-300/90 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 focus:bg-white transition-all duration-200 placeholder:text-slate-400"
                  placeholder="Mínimo 8 caracteres"
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

            <div>
              <label
                htmlFor="register-role"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Tipo de Usuario
              </label>
              <div className="grid grid-cols-2 gap-2.5 mb-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
                  className={`py-2.5 px-3.5 rounded-2xl border text-xs font-bold transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                    formData.role === 'CLIENT'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-600/30'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">🐕</span>
                  <span>Tutor / Cliente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'VET' })}
                  className={`py-2.5 px-3.5 rounded-2xl border text-xs font-bold transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                    formData.role === 'VET'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-600/30'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">🩺</span>
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
              <div className="p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl space-y-1.5 animate-fadeIn">
                <label
                  htmlFor="register-license"
                  className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1"
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
                  className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 placeholder:text-slate-400 transition-all duration-200"
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
              className="w-full bg-[#032E24] hover:bg-[#044c3b] active:bg-[#02231b] active:scale-[0.98] text-white py-3.5 px-5 rounded-2xl font-bold text-sm shadow-md shadow-[#032E24]/20 hover:shadow-xl hover:shadow-[#032E24]/25 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group cursor-pointer mt-3"
            >
              <span>{isSubmitting ? 'Registrando...' : 'Crear Cuenta'}</span>
              {!isSubmitting && (
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
              )}
            </button>
          </form>

          {/* Enlace a Login */}
          <p className="text-center text-xs sm:text-sm text-slate-600 mt-6 pt-5 border-t border-slate-100">
            ¿Ya tenés cuenta?{' '}
            <Link
              to="/login"
              className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline transition-colors"
            >
              Iniciá sesión
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

export default Register;
