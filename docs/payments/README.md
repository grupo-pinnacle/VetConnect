# 💳 Sistema de Monetización y Pagos — Huellicam / VetConnect

> **Estado Arquitectónico:**  
> VetConnect / Huellicam está concebido y estructurado como un **Software Marca Blanca (White-Label)** de telemedicina veterinaria, diseñado para ser licenciado, exportado y desplegado de forma independiente por diferentes clínicas, organizaciones o empresas de salud animal.

---

## 1. Visión General de la Estrategia de Pagos

Para preservar la naturaleza de **software exportable y marca blanca neutral**, la arquitectura de pagos está completamente desacoplada de la lógica clínica mediante el **Patrón Adaptador (Adapter Pattern)**:

1. **Plan Principal (Core Marca Blanca):**  
   Arquitectura agnóstica de pasarelas de pago (`PaymentGateway`). El software no impone un procesador ni una entidad financiera cautiva. Cada licenciatario u operador puede configurar su proveedor de cobro (Stripe, Mercado Pago, dLocal, etc.) y su modelo arancelario (por consulta, suscripción o guardia institucional).  
   👉 Ver detalle completo en: [`01_WHITE_LABEL_PAYMENTS_ARCHITECTURE.md`](./01_WHITE_LABEL_PAYMENTS_ARCHITECTURE.md).

2. **Plan B (Alternativa de Integración Local con PagoFlex):**  
   Especificación de contingencia en caso de que el stakeholder/CEO decida operar el servicio en Argentina canalizando la liquidación veterinaria a través de la fintech **PagoFlex** (donde los veterinarios cobran en su billetera PagoFlex y los tutores pagan vía Mercado Pago o cualquier billetera interoperable).  
   👉 Ver especificación técnica y evaluación de riesgos en: [`02_PAGOFLEX_INTEGRATION_PLAN_B.md`](./02_PAGOFLEX_INTEGRATION_PLAN_B.md).

---

## 2. Mapa de Documentos de Pagos

| Documento | Enfoque | Rol en el Proyecto |
|---|---|---|
| [`01_WHITE_LABEL_PAYMENTS_ARCHITECTURE.md`](./01_WHITE_LABEL_PAYMENTS_ARCHITECTURE.md) | **Marca Blanca (Agnóstico)** | **PLAN A (Definición Oficial):** Contrato de interfaces (`IPaymentGateway`), modelo por consulta (*fee-per-consult*), retención de comisiones de plataforma (*take-rate*) y aislamiento de reglas de negocio. |
| [`02_PAGOFLEX_INTEGRATION_PLAN_B.md`](./02_PAGOFLEX_INTEGRATION_PLAN_B.md) | **PagoFlex (Argentina)** | **PLAN B (Alternativa bajo revisión):** Flujo de split payment local, liquidación exclusiva en app PagoFlex para veterinarios, impacto fiscal (ARCA/AFIP) y pérdida de neutralidad de marca blanca. |

---

## 3. Matriz Comparativa: Marca Blanca vs. Operación Cautiva con PagoFlex

| Criterio | Plan A: Marca Blanca Universal | Plan B: Operación con PagoFlex |
|---|---|---|
| **Naturaleza del Negocio** | Exportación / Licenciamiento de Software | Operador de Marketplace de Servicios en Argentina |
| **Pasarela de Cobro** | Modular y configurable por país (Stripe, Mercado Pago, etc.) | Cautiva a PagoFlex (PSP local argentino) |
| **Cobro de Veterinarios** | Cuenta bancaria local o billetera configurada por el licenciatario | Exclusivamente a través de la app móvil PagoFlex |
| **Pago de Clientes (Tutores)** | Tarjetas de crédito/débito, transferencias o checkout web | Mercado Pago, transferencias o billeteras con QR |
| **Responsabilidad Fiscal** | Del licenciatario / operador final | De la empresa operadora (retenciones impositivas de ARCA, IIBB, IVA) |
| **Escalabilidad Internacional** | Global (listo para cualquier país) | Restringida a Argentina |

---

## 4. Estructura de Licenciamiento Comercial B2B (Pricing para Ronda de Negocios)

Para rondas de negocios (ej. PromArgentina / compradores corporativos), la comercialización de la Marca Blanca se estructura en 3 modalidades:

* **Tier 1 (Starter Clinic — Clínicas 1 a 5 profesionales):** Setup Fee **$1,500 USD** + **$250 USD / mes** (0% comisión transaccional, hosting administrado).
* **Tier 2 (Hospital Network — Redes 6 a 25 profesionales):** Setup Fee **$3,500 USD** + **$450 USD / mes** + **2.5% take-rate** por consulta (dominio y app propia en Google Play).
* **Tier 3 (Enterprise & InsurTech — Aseguradoras y Cadenas +25 profesionales):** Setup Fee **$8,000 USD** + **$1.50 USD** por consulta (infraestructura dedicada, integración ERP/HIS y SLA 99.9%).
