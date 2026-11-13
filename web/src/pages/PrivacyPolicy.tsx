import React from 'react';
import { Lock } from 'lucide-react';
import { LegalLayout } from '../components/legal/LegalLayout';

export const PrivacyPolicy: React.FC = () => {
  return (
    <LegalLayout
      icon={<Lock className="w-6 h-6" aria-hidden="true" />}
      title="Política de Privacidad y Protección de Datos"
      subtitle="Conforme a la Ley Nacional N° 25.326 de la República Argentina • Última actualización: Septiembre 2026"
    >
      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          1. Identidad y Domicilio del Responsable del Tratamiento
        </h2>
        <p className="text-[#454e4e]">
          La plataforma <strong>Huellicam</strong> es desarrollada y operada por <strong>Pinnacle Group S.A.</strong> (CUIT: 30-71234567-8), con domicilio legal en Av. Santa Fe 1234, Ciudad Autónoma de Buenos Aires, República Argentina. Correo electrónico de privacidad:{' '}
          <a href="mailto:privacidad@huellicam.com.ar" className="text-[#315f5d] font-bold underline">
            privacidad@huellicam.com.ar
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          2. Principio de Minimización de Datos
        </h2>
        <p className="text-[#454e4e]">
          En cumplimiento estricto del principio de minimización de datos (Art. 4, Ley 25.326), únicamente recolectamos la información indispensable para prestar el servicio de teleorientación veterinaria y emisión de recetas digitales:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#454e4e] mt-2">
          <li><strong>Datos del Tutor:</strong> Nombre, apellido, correo electrónico y número telefónico de contacto.</li>
          <li><strong>Datos Clínicos del Paciente:</strong> Nombre de la mascota, especie, raza, peso estimado, número de microchip (opcional) e historial de consultas.</li>
          <li><strong>Datos Profesionales del Veterinario:</strong> Matrícula profesional habilitante, provincia de matriculación y estado de validación SENASA.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          3. Transmisión Segura y Cero PII en Streaming WebRTC
        </h2>
        <p className="text-[#454e4e]">
          Las videollamadas se transmiten a través de túneles cifrados WebRTC / SFU (LiveKit). Los tokens de acceso no contienen datos de identificación personal (PII) como teléfonos o correos; únicamente viajan identificadores técnicos opacos y el nombre de pila. Las fotografías de lesiones y recetas se almacenan de forma protegida y su acceso requiere autenticación criptográfica.
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          4. Conservación Sanitaria y Anonimización (Derecho al Olvido)
        </h2>
        <p className="text-[#454e4e]">
          Por imperativo de la normativa sanitaria y el Código de Ética Veterinaria, las historias clínicas y recetas emitidas deben preservarse para trazabilidad médica. Si un usuario solicita la baja de su cuenta, el sistema ejecuta una <strong>eliminación lógica con anonimización irreversible</strong> de sus datos de contacto (nombre, email y teléfono), preservando los registros clínicos desvinculados de su identidad.
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          5. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
        </h2>
        <p className="text-[#454e4e]">
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses. Para ejercer estos derechos, envíe una comunicación a{' '}
          <a href="mailto:privacidad@huellicam.com.ar" className="text-[#315f5d] font-bold underline">
            privacidad@huellicam.com.ar
          </a>{' '}
          acompañando copia de su documento de identidad.
        </p>
        <div className="bg-[#f3faf8] border border-[#609f9c]/35 rounded-2xl p-4 mt-3 text-xs text-[#183c3a]">
          <p className="font-bold">Información de la Autoridad de Control:</p>
          <p className="mt-1 text-[#454e4e]">
            La Agencia de Acceso a la Información Pública (AAIP), en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas sobre protección de datos personales.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
