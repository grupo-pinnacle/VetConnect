import type { Meta, StoryObj } from '@storybook/react';
import { PrescriptionDoc } from './PrescriptionDoc';

const sampleQrSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="22" height="22" fill="black"/><rect x="14" y="14" width="14" height="14" fill="white"/><rect x="18" y="18" width="6" height="6" fill="black"/><rect x="68" y="10" width="22" height="22" fill="black"/><rect x="72" y="14" width="14" height="14" fill="white"/><rect x="76" y="18" width="6" height="6" fill="black"/><rect x="10" y="68" width="22" height="22" fill="black"/><rect x="14" y="72" width="14" height="14" fill="white"/><rect x="18" y="76" width="6" height="6" fill="black"/><rect x="42" y="16" width="8" height="8" fill="black"/><rect x="54" y="28" width="8" height="8" fill="black"/><rect x="36" y="44" width="16" height="12" fill="black"/><rect x="62" y="58" width="12" height="12" fill="black"/><rect x="44" y="72" width="10" height="16" fill="black"/><rect x="72" y="72" width="16" height="16" fill="black"/></svg>`;

const meta: Meta<typeof PrescriptionDoc> = {
  title: 'UI/PrescriptionDoc',
  component: PrescriptionDoc,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Documento oficial de Receta Médica Veterinaria Digital imprimible conforme a la normativa SENASA y Ley 25.506 de Firma Digital.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PrescriptionDoc>;

export const GastroenteritisAguda: Story = {
  args: {
    prescription: {
      id: 'rx-senasa-89421',
      consultationId: 'cons-cl-7701',
      vetId: 'vet-valenzuela-01',
      medication: 'Metronidazol 250mg comprimidos',
      dosage: '1 comprimido y medio (375mg)',
      frequency: 'Cada 12 horas',
      durationDays: 7,
      indications:
        'Administrar junto con alimento bajo en grasas (dieta blanda recomendada: pechuga de pollo hervida sin sal con arroz blanco cocido). Mantener hidratación oral continua con sales de rehidratación veterinarias. Reevaluación inmediata en caso de persistir el cuadro emético transcurridas las primeras 24 horas.',
      createdAt: '2026-09-22T14:30:00.000Z',
      qrCodeDataUrl: sampleQrSvg,
      vet: {
        firstName: 'Sofía',
        lastName: 'Valenzuela',
        licenseNumber: 'MP-10492 (Colegio de Veterinarios de Bs. As.)',
      },
    },
    qrUrl: sampleQrSvg,
    pet: {
      id: 'pet-milo-01',
      ownerId: 'client-lucas-01',
      name: 'Milo',
      species: 'Canino',
      breed: 'Golden Retriever',
      weightKg: 32,
      microchip: '032-984-721-001-AR',
      createdAt: '2025-01-15T00:00:00.000Z',
      updatedAt: '2026-09-22T00:00:00.000Z',
    },
  },
};

export const VacunacionAntirrabica: Story = {
  args: {
    prescription: {
      id: 'rx-senasa-65103',
      consultationId: 'cons-cl-5520',
      vetId: 'vet-mendoza-02',
      medication: 'Vacuna Antirrábica Inactivada Cepa Pasteur 1ml',
      dosage: '1 dosis subcutánea (1 ml)',
      frequency: 'Dosis única anual obligatoria',
      durationDays: 1,
      indications:
        'Aplicación subcutánea en región interescapular / miembro posterior derecho. Monitorear posibles reacciones locales de hipersensibilidad o letargo en las siguientes 4 horas post-inoculación. No someter al animal a baños ni esfuerzo físico intenso durante las 48 horas posteriores.',
      createdAt: '2026-09-20T10:15:00.000Z',
      qrCodeDataUrl: sampleQrSvg,
      vet: {
        firstName: 'Carlos',
        lastName: 'Mendoza',
        licenseNumber: 'MP-8921 (C.V.P.B.A.)',
      },
    },
    qrUrl: sampleQrSvg,
    pet: {
      id: 'pet-luna-02',
      ownerId: 'client-maria-02',
      name: 'Luna',
      species: 'Felino',
      breed: 'Siamés',
      weightKg: 4.2,
      microchip: '032-555-889-102-AR',
      createdAt: '2024-06-10T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  },
};

export const TratamientoProlongado: Story = {
  args: {
    prescription: {
      id: 'rx-senasa-91044',
      consultationId: 'cons-cl-9930',
      vetId: 'vet-costa-03',
      medication: 'Meloxicam 2.5mg + Condroitín Sulfato / Glucosamina',
      dosage: '1 tableta diaria junto con el desayuno',
      frequency: 'Cada 24 horas',
      durationDays: 30,
      indications:
        'Terapia antiinflamatoria y condroprotectora prolongada para displasia coxofemoral grado II. Administrar estrictamente con la comida principal para proteger la mucosa gástrica. Se suspenderá de inmediato ante cualquier signo de vómitos, letargo o melena.',
      createdAt: '2026-09-18T18:00:00.000Z',
      qrCodeDataUrl: sampleQrSvg,
      vet: {
        firstName: 'Mariana',
        lastName: 'Costa',
        licenseNumber: 'MP-12340 (SENASA Reg. Nac. 4412)',
      },
    },
    qrUrl: sampleQrSvg,
    pet: {
      id: 'pet-thor-03',
      ownerId: 'client-esteban-03',
      name: 'Thor',
      species: 'Canino',
      breed: 'Ovejero Alemán',
      weightKg: 38.5,
      microchip: '032-114-998-333-AR',
      createdAt: '2023-11-20T00:00:00.000Z',
      updatedAt: '2026-09-18T00:00:00.000Z',
    },
  },
};
