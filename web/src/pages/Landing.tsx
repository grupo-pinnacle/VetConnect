import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" data-testid="landing-page">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-black text-lg">
            V
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight" data-testid="brand-logo">
            VetConnect
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            data-testid="landing-login-button"
            onClick={() => navigate('/login')}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold transition"
          >
            Iniciar Sesión
          </button>
          <button
            data-testid="landing-register-button"
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            Registrarse
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-bold uppercase tracking-wider mb-4" data-testid="trust-badge-senasa">
          Plataforma Homologada SENASA Ley 25.326
        </span>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6" data-testid="hero-title">
          Telemedicina Veterinaria Inmediata para la Salud de tu Mascota
        </h1>

        <p className="text-slate-600 text-base md:text-lg max-w-2xl mb-8 leading-relaxed" data-testid="hero-description">
          Conecta en minutos con médicos veterinarios acreditados vía videoconsulta de alta definición, emite recetas digitales con QR oficial y gestiona la salud clínica de tus mascotas 24/7.
        </p>

        {/* Portal CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-12" data-testid="cta-buttons-container">
          <button
            data-testid="cta-client-portal"
            onClick={() => navigate('/login')}
            className="p-5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md font-bold text-base transition flex flex-col items-center justify-center gap-1"
          >
            <span>Solicitar Teleconsulta</span>
            <span className="text-xs font-normal text-sky-100">Portal para Tutores</span>
          </button>

          <button
            data-testid="cta-vet-portal"
            onClick={() => navigate('/login')}
            className="p-5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md font-bold text-base transition flex flex-col items-center justify-center gap-1"
          >
            <span>Portal Veterinarios</span>
            <span className="text-xs font-normal text-slate-300">Guardia Telemática y Recetas</span>
          </button>

          <button
            data-testid="cta-admin-portal"
            onClick={() => navigate('/login')}
            className="p-5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md font-bold text-base transition flex flex-col items-center justify-center gap-1"
          >
            <span>Panel Administrador</span>
            <span className="text-xs font-normal text-emerald-100">Auditoría de Matrículas</span>
          </button>
        </div>

        {/* Mobile APK Download Direct Banner */}
        <section className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-12 text-left flex flex-col md:flex-row items-center justify-between gap-6" data-testid="apk-download-banner">
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">
              Descarga la App Móvil VetConnect para Android
            </h3>
            <p className="text-xs text-slate-600">
              Disfruta de la experiencia nativa de videoconsultas, notificaciones push de guardia en tiempo real y carnet clínico digital.
            </p>
          </div>

          <a
            href="/downloads/vetconnect-preview.apk"
            download="vetconnect-preview.apk"
            data-testid="download-apk-link"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow transition whitespace-nowrap"
          >
            Descargar APK Android (.apk)
          </a>
        </section>

        {/* Compliance & Security Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left" data-testid="features-section">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 text-sm mb-2">Receta Digital QR</h4>
            <p className="text-xs text-slate-600 leading-normal">
              Emitida bajo estándares oficiales de SENASA, firmada digitalmente y validable mediante código QR en farmacias autorizadas.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 text-sm mb-2">Videollamadas Seguras</h4>
            <p className="text-xs text-slate-600 leading-normal">
              Infraestructura WebRTC cifrada de punto a punto en LiveKit Cloud con protocolo de aislamiento Zero PII.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 text-sm mb-2">Protección de Datos</h4>
            <p className="text-xs text-slate-600 leading-normal">
              Cumplimiento estricto de la Ley 25.326 de Protección de Datos Personales con redacción automática de PII clínica.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500" data-testid="landing-footer">
        <p>© {new Date().getFullYear()} VetConnect Monorepo v2.0. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Landing;
