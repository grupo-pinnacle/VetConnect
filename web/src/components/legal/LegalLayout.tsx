import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LegalLayoutProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ icon, title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-[#fffbef] text-[#183c3a] flex flex-col font-['Manrope',sans-serif]">
      <header className="bg-[#fffbef]/95 backdrop-blur-md border-b border-[#e4dfd2] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#183c3a] bg-white hover:bg-[#f2eddd] border border-[#e4dfd2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#609f9c] rounded-full px-4 py-2 transition-colors"
            aria-label="Volver a la portada de Huellicam"
          >
            <ArrowLeft className="w-4 h-4 text-[#609f9c]" aria-hidden="true" />
            <span>Volver al Inicio</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src="/assets/huellicam-mark.png"
              alt="HuelliCam"
              className="w-9 h-8 object-contain"
            />
            <span className="font-extrabold text-[#183c3a] text-base tracking-tight">
              Huelli<span className="text-[#609f9c]">Cam</span> Legal
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full" id="main-content">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#e4dfd2]">
          <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-[#e4dfd2]">
            <div className="w-12 h-12 rounded-2xl bg-[#d9e8e4] text-[#315f5d] flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183c3a] tracking-tight leading-tight">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-[#607674] mt-1 font-medium">{subtitle}</p>
            </div>
          </div>

          <div className="max-w-none text-sm sm:text-base leading-relaxed space-y-6 text-[#454e4e]">
            {children}
          </div>
        </div>
      </main>

      <footer className="bg-[#183c3a] text-[#d9e8e4] py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/huellicam-mark-light.png"
              alt="HuelliCam"
              className="w-8 h-7 object-contain"
            />
            <span className="font-semibold text-[#fffbef]">
              © {new Date().getFullYear()} Pinnacle Group S.A. • CUIT 30-71234567-8 • Todos los derechos reservados.
            </span>
          </div>
          <nav aria-label="Documentos legales" className="flex flex-wrap items-center gap-4 text-[#d9e8e4]">
            <Link to="/terms" className="hover:text-[#fffbef] underline-offset-4 hover:underline">
              Términos y condiciones
            </Link>
            <Link to="/privacy" className="hover:text-[#fffbef] underline-offset-4 hover:underline">
              Privacidad
            </Link>
            <Link to="/cookies" className="hover:text-[#fffbef] underline-offset-4 hover:underline">
              Cookies
            </Link>
            <Link to="/refunds" className="hover:text-[#fffbef] underline-offset-4 hover:underline">
              Reembolsos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};
