import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Award, HeartHandshake, AlertCircle, ArrowRight, Stethoscope, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      {/* Columna Izquierda: Branding, Trust & Respaldo Clínico Institucional */}
      <section className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
        {/* Halo de luz decorativo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header de Marca (Enlace navegable a inicio) */}
          <Link
            to="/"
            className="inline-flex items-center gap-3 mb-10 group focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-xl p-1"
            title="Volver a la página principal"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                VetConnect
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v2.0 Hospitalaria
                </span>
              </span>
              <p className="text-xs text-slate-400 font-medium group-hover:text-emerald-300 transition-colors">
                Telemedicina Veterinaria & Gestión Clínica
              </p>
            </div>
          </Link>

          {/* Título de Propuesta de Valor */}
          <div className="space-y-4 max-w-lg mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Cuidado médico experto y regulado para quienes más amas.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Conectamos tutores de animales de compañía con profesionales veterinarios matriculados en tiempo real, bajo los más estrictos estándares sanitarios y legales de la República Argentina.
            </p>
          </div>

          {/* Badges de Confianza y Cumplimiento Normativo */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-white">SENASA Resolución 1442/2021</p>
                <p className="text-[11px] text-slate-400">Plataforma homologada con verificación de matrícula oficial</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <Lock className="w-5 h-5 text-sky-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-white">Cifrado WebRTC de Grado Médico</p>
                <p className="text-[11px] text-slate-400">Salas de videoconsulta punto a punto y protección 256-bit SSL</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <Award className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-white">Respaldo Técnico Institucional</p>
                <p className="text-[11px] text-slate-400">Escuela Técnica N° 20 D.E. 20 "Carolina Muzilli"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cita Testimonial Clínica */}
        <div className="relative z-10 mt-12 pt-8 border-t border-slate-800/80">
          <blockquote className="text-xs text-slate-300 italic leading-relaxed mb-3">
            &ldquo;En situaciones de guardia y urgencia clínica, la inmediatez de la videoconsulta y la prescripción con validación QR inviolable transformaron la seguridad asistencial de nuestros pacientes.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
              SR
            </div>
            <div>
              <p className="text-xs font-bold text-white">Dra. Silvina Romero</p>
              <p className="text-[10px] text-slate-400">Médica Veterinaria (M.P. 4492 - Colegiada)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Columna Derecha: Tarjeta de Acceso y Formulario Clínico */}
      <section className="lg:col-span-7 bg-slate-50 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/70 transition-all duration-200">
          {/* Botón de retorno accesible a la Landing Page */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg px-2 py-1 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/60"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-emerald-700" aria-hidden="true" />
              <span>Volver al inicio</span>
            </Link>
          </div>

          {/* Encabezado del Formulario */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold mb-3">
              <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
              Acceso a Portal Seguro
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Bienvenido a VetConnect
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Ingresá tus credenciales para acceder a tus consultas y registros médicos.
            </p>
          </div>

          {/* Banner de Error Accesible */}
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs sm:text-sm mb-6 flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
              {!isSubmitting && (
                <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              )}
            </button>
          </form>

          {/* Badges de Seguridad de Formulario */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" aria-hidden="true" /> 256-bit SSL
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" aria-hidden="true" /> Plataforma Homologada
            </span>
          </div>

          {/* Enlace a Registro */}
          <p className="text-center text-xs sm:text-sm text-slate-600 mt-6">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="text-emerald-700 font-bold hover:text-emerald-600 hover:underline transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
