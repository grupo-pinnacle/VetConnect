import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { ShieldCheck, Lock, Award, HeartHandshake, AlertCircle, ArrowRight, Stethoscope, UserCheck, CheckCircle2 } from 'lucide-react';

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
      {/* Columna Izquierda: Branding, Trust & Beneficios Clínicos */}
      <section className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
        {/* Halos luminosos de ambientación médica */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header de Marca */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Stethoscope className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                VetConnect
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Comunidad Médica
                </span>
              </span>
              <p className="text-xs text-slate-400 font-medium">Portal Unificado de Salud Animal</p>
            </div>
          </div>

          {/* Título de Propuesta de Valor */}
          <div className="space-y-3 max-w-lg mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Únete al estándar argentino de telemedicina veterinaria.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Crea tu cuenta institucional como tutor responsable o como médico veterinario para brindar atención clínica homologada por SENASA.
            </p>
          </div>

          {/* Lista de Beneficios Clínicos Clave */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-white">Historias Clínicas Inmutables</p>
                <p className="text-[11px] text-slate-400">Trazabilidad diagnóstica y soft-delete regulado bajo Ley 25.326</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-white">Validación de Matrícula Profesional</p>
                <p className="text-[11px] text-slate-400">Auditoría manual de matrículas provinciales ante SENASA Res. 1442/2021</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <Lock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-white">Recetas Digitales con QR Inviolable</p>
                <p className="text-[11px] text-slate-400">Firma electrónica bajo Ley 25.506 con validación pública en farmacias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Respaldo Institucional */}
        <div className="relative z-10 mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-3">
          <Award className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
          <p className="text-xs text-slate-400 leading-tight">
            Proyecto desarrollado con estándares FAANG — Escuela Técnica N° 20 D.E. 20 &ldquo;Carolina Muzilli&rdquo;
          </p>
        </div>
      </section>

      {/* Columna Derecha: Tarjeta de Registro y Formulario Clínico */}
      <section className="lg:col-span-7 bg-slate-50 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/70">
          {/* Encabezado del Formulario */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold mb-2">
              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Alta de Usuario Seguro
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Registro en VetConnect
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Completa tus datos personales para habilitar tu acceso al sistema.
            </p>
          </div>

          {/* Banner de Error Accesible */}
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs sm:text-sm mb-5 flex items-start gap-2.5 animate-fadeIn"
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
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Nombre
                </label>
                <input
                  id="register-firstname"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  autoComplete="given-name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="Ej. Juan"
                />
              </div>
              <div>
                <label
                  htmlFor="register-lastname"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Apellido
                </label>
                <input
                  id="register-lastname"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Correo Electrónico
              </label>
              <input
                id="register-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                placeholder="ejemplo@vetconnect.com"
              />
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="register-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label
                htmlFor="register-role"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Tipo de Usuario
              </label>
              <select
                id="register-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
              >
                <option value="CLIENT">Tutor / Cliente</option>
                <option value="VET">Veterinario</option>
              </select>
            </div>

            {formData.role === 'VET' && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
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
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                  placeholder="Ej. MP-1234"
                />
                <p className="text-[11px] text-emerald-700 mt-1">
                  * Sujeto a verificación manual administrativa previa habilitación de consultas (SENASA Res. 1442/2021).
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group cursor-pointer mt-2"
            >
              <span>{isSubmitting ? 'Registrando...' : 'Crear Cuenta'}</span>
              {!isSubmitting && (
                <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              )}
            </button>
          </form>

          {/* Enlace a Login */}
          <p className="text-center text-xs sm:text-sm text-slate-600 mt-6 pt-4 border-t border-slate-100">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-emerald-700 font-bold hover:text-emerald-600 hover:underline transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;
