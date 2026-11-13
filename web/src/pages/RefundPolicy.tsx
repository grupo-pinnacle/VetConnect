import React from 'react';
import { RotateCcw } from 'lucide-react';
import { LegalLayout } from '../components/legal/LegalLayout';

export const RefundPolicy: React.FC = () => {
  return (
    <LegalLayout
      icon={<RotateCcw className="w-6 h-6" aria-hidden="true" />}
      title="Política de Reembolsos y Cancelaciones"
      subtitle="Garantía de Servicio y Protección al Consumidor (Ley 24.240) • Última actualización: Septiembre 2026"
    >
      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          1. Compromiso de Transparencia
        </h2>
        <p className="text-[#454e4e]">
          En <strong>Huellicam</strong> (operado por <strong>Pinnacle Group S.A.</strong>, CUIT: 30-71234567-8) creemos en la transparencia total. Nuestra política de cancelaciones y reembolsos se basa en el cumplimiento estricto del Art. 34 de la Ley Nacional N° 24.240 de Defensa del Consumidor y en los Acuerdos de Nivel de Servicio (SLA) clínicos de nuestra plataforma.
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          2. Supuestos de Reembolso Total Inmediato (100%)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div className="p-4 rounded-2xl border border-[#e4dfd2] bg-[#f3faf8]">
            <div className="w-8 h-8 rounded-full bg-[#d9e8e4] text-[#183c3a] flex items-center justify-center font-extrabold mb-2">
              1
            </div>
            <h3 className="font-bold text-[#183c3a] text-sm mb-1">Cancelación Voluntaria</h3>
            <p className="text-xs text-[#454e4e]">
              Si el tutor cancela su solicitud mientras se encuentra en la sala de espera antes del inicio de la consulta, se reintegra el 100% de inmediato sin penalización.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-[#e4dfd2] bg-[#f3faf8]">
            <div className="w-8 h-8 rounded-full bg-[#d9e8e4] text-[#183c3a] flex items-center justify-center font-extrabold mb-2">
              2
            </div>
            <h3 className="font-bold text-[#183c3a] text-sm mb-1">Timeout de Triage (15 min)</h3>
            <p className="text-xs text-[#454e4e]">
              Si transcurren 15 minutos en guardia sin que un veterinario colegiado tome el caso, el sistema cancela la solicitud y devuelve el 100% del pago automáticamente.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-[#e4dfd2] bg-[#f3faf8]">
            <div className="w-8 h-8 rounded-full bg-[#d9e8e4] text-[#183c3a] flex items-center justify-center font-extrabold mb-2">
              3
            </div>
            <h3 className="font-bold text-[#183c3a] text-sm mb-1">Fallo Técnico Profesional</h3>
            <p className="text-xs text-[#454e4e]">
              Si el veterinario sufre una desconexión y no reingresa dentro de la ventana de gracia de 3 minutos, se ofrece reintegro del 100% o reasignación prioritaria.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          3. Supuestos No Reembolsables
        </h2>
        <p className="text-[#454e4e]">
          Una vez que la teleconsulta ha sido iniciada y completada efectivamente por el médico veterinario actuante, o si se ha emitido formalmente la historia clínica y/o receta médica digital, el servicio se considera consumado en su totalidad y no admitirá reembolso basado en discrepancias de criterio clínico diagnóstico, conforme a las pautas de los Colegios Médicos Veterinarios y la Ley 14.072.
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          4. Plazos de Acreditación Bancaria
        </h2>
        <p className="text-[#454e4e]">
          Los reembolsos aprobados se procesan en forma automática por nuestra pasarela de pagos en un plazo máximo de 24 a 72 horas hábiles. La acreditación final en su resumen bancario o saldo de cuenta dependerá de los tiempos de la entidad emisora de su tarjeta de crédito o débito.
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          5. Canales de Reclamación y Soporte
        </h2>
        <p className="text-[#454e4e]">
          Si experimentó algún inconveniente durante su atención y desea solicitar la revisión de su caso por el equipo de auditoría médica, escriba a{' '}
          <a href="mailto:soporte@huellicam.com.ar" className="text-[#315f5d] font-bold underline">
            soporte@huellicam.com.ar
          </a>{' '}
          indicando el ID de su consulta y el correo registrado.
        </p>
      </section>
    </LegalLayout>
  );
};

export default RefundPolicy;
