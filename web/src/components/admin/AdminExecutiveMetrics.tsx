import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertOctagon, Percent, RefreshCw, Settings2, Check, X } from 'lucide-react';
import api from '../../services/api';

export type SupportedCurrency = 'ARS' | 'USD' | 'BRL' | 'MXN' | 'EUR';

export interface PricingSettingsDTO {
  baseConsultationFee: number;
  platformTakeRate: number;
  currency: SupportedCurrency;
  updatedAt?: string;
  updatedBy?: string | null;
}

export interface UpdatePricingPayload {
  baseConsultationFee: number;
  platformTakeRate: number; // entre 0 y 1 (ej. 0.20 para 20%)
  currency: SupportedCurrency;
  reason?: string;
}

export interface ExecutiveMetricsData {
  gmvTotal: number;
  netCommission: number;
  noShowLostRevenue: number;
  triageToPaidConversionRate: number;
  counts: {
    totalConsultations: number;
    completed: number;
    cancelledOrNoShow: number;
    waitingOrActive: number;
  };
  pricing?: PricingSettingsDTO;
}

export interface AdminExecutiveMetricsProps {
  metrics?: ExecutiveMetricsData | null;
  loading?: boolean;
  onRefresh?: () => void;
  onUpdatePricing?: (payload: UpdatePricingPayload) => Promise<void>;
}

export function AdminExecutiveMetrics({
  metrics: externalMetrics,
  loading: externalLoading,
  onRefresh,
  onUpdatePricing,
}: AdminExecutiveMetricsProps): JSX.Element {
  const [internalMetrics, setInternalMetrics] = useState<ExecutiveMetricsData | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  // Form local state
  const [feeInput, setFeeInput] = useState<string>('15000');
  const [takeRateInput, setTakeRateInput] = useState<string>('20');
  const [currencyInput, setCurrencyInput] = useState<SupportedCurrency>('ARS');
  const [reasonInput, setReasonInput] = useState<string>('Ajuste de arancel ejecutivo desde panel admin');

  const fetchMetrics = () => {
    let isMounted = true;
    setInternalLoading(true);
    api
      .get<{ success: boolean; data: ExecutiveMetricsData }>('/api/admin/executive-metrics')
      .then((res) => {
        if (isMounted && res.data?.data) {
          setInternalMetrics(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching executive metrics:', err);
      })
      .finally(() => {
        if (isMounted) setInternalLoading(false);
      });
    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    if (externalMetrics !== undefined) return;
    return fetchMetrics();
  }, [externalMetrics]);

  const metrics = externalMetrics !== undefined ? externalMetrics : internalMetrics;
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  // Sync pricing form fields when metrics load
  useEffect(() => {
    if (metrics?.pricing) {
      setFeeInput(String(metrics.pricing.baseConsultationFee));
      setTakeRateInput(String(Math.round(metrics.pricing.platformTakeRate * 100)));
      setCurrencyInput(metrics.pricing.currency);
    }
  }, [metrics?.pricing]);

  const formatCurrency = (val?: number) => {
    if (typeof val !== 'number') return '$0';
    return `$${val.toLocaleString('es-AR')}`;
  };

  const activeFee = metrics?.pricing?.baseConsultationFee ?? 15000;
  const activeRate = Math.round((metrics?.pricing?.platformTakeRate ?? 0.2) * 100);
  const activeCurrency = metrics?.pricing?.currency ?? 'ARS';

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = Number(feeInput);
    const ratePercent = Number(takeRateInput);

    if (isNaN(fee) || fee <= 0) {
      alert('El arancel base debe ser un número positivo.');
      return;
    }
    if (isNaN(ratePercent) || ratePercent < 0 || ratePercent > 100) {
      alert('La comisión debe ser un porcentaje entre 0 y 100.');
      return;
    }

    const payload: UpdatePricingPayload = {
      baseConsultationFee: fee,
      platformTakeRate: ratePercent / 100,
      currency: currencyInput,
      reason: reasonInput.trim() || 'Ajuste de arancel ejecutivo desde panel admin',
    };

    setIsSavingPricing(true);
    try {
      if (onUpdatePricing) {
        await onUpdatePricing(payload);
      } else {
        await api.patch('/api/admin/pricing-settings', payload);
        fetchMetrics();
      }
      setIsEditingPricing(false);
    } catch (err) {
      console.error('Error updating pricing settings:', err);
      alert('Error al actualizar las tarifas');
    } finally {
      setIsSavingPricing(false);
    }
  };

  return (
    <div className="admin-executive-metrics" style={{ marginBottom: '24px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #1e293b)' }}>
              Métricas Ejecutivas y Unit Economics (CEO)
            </h2>
            {/* White-label tariff active badge */}
            {metrics?.pricing && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                }}
              >
                Tarifa Activa: {formatCurrency(activeFee)} {activeCurrency} | Take-Rate: {activeRate}%
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #64748b)' }}>
            Visión económica, margen neto de plataforma y fuga por cancelaciones.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsEditingPricing((prev) => !prev)}
            aria-label="Configurar tarifa"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: isEditingPricing ? '#f8fafc' : '#fff',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#1e293b',
              cursor: 'pointer',
            }}
          >
            <Settings2 size={14} />
            <span>Configurar tarifa</span>
          </button>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#fff',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          )}
        </div>
      </div>

      {/* Inline White-Label Tariff Configuration Panel */}
      {isEditingPricing && (
        <form
          onSubmit={handleSavePricing}
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
              Parametrización de Tarifas Marca Blanca (Unit Economics del Tenant)
            </span>
            <button
              type="button"
              onClick={() => setIsEditingPricing(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={16} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <div>
              <label
                htmlFor="baseConsultationFee"
                style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
              >
                Arancel Base
              </label>
              <input
                id="baseConsultationFee"
                aria-label="Arancel Base"
                type="number"
                value={feeInput}
                onChange={(e) => setFeeInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="platformTakeRate"
                style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
              >
                Comisión Take-Rate (%)
              </label>
              <input
                id="platformTakeRate"
                aria-label="Comisión Take-Rate (%)"
                type="number"
                min="0"
                max="100"
                step="1"
                value={takeRateInput}
                onChange={(e) => setTakeRateInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="currency"
                style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
              >
                Moneda
              </label>
              <select
                id="currency"
                aria-label="Moneda"
                value={currencyInput}
                onChange={(e) => setCurrencyInput(e.target.value as SupportedCurrency)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  backgroundColor: '#fff',
                }}
              >
                <option value="ARS">ARS ($)</option>
                <option value="USD">USD ($)</option>
                <option value="BRL">BRL (R$)</option>
                <option value="MXN">MXN ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="pricingReason"
                style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
              >
                Motivo del ajuste
              </label>
              <input
                id="pricingReason"
                aria-label="Motivo del ajuste"
                type="text"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="Ej: Actualización arancel colegio profesional"
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsEditingPricing(false)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#fff',
                fontSize: '0.825rem',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSavingPricing}
              aria-label="Guardar tarifa"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: '#183c3a',
                color: '#fff',
                fontSize: '0.825rem',
                fontWeight: 600,
                border: 'none',
                cursor: isSavingPricing ? 'not-allowed' : 'pointer',
                opacity: isSavingPricing ? 0.7 : 1,
              }}
            >
              <Check size={14} />
              <span>Guardar tarifa</span>
            </button>
          </div>
        </form>
      )}

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* GMV Total */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>GMV Total</span>
            <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '4px', borderRadius: '6px' }}>
              <DollarSign size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            {formatCurrency(metrics?.gmvTotal)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Consultas completadas ({metrics?.counts?.completed ?? 0})
          </div>
        </div>

        {/* Comisión Neta */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>
              Comisión Neta ({metrics?.pricing ? Math.round(metrics.pricing.platformTakeRate * 100) : 20}%)
            </span>
            <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px', borderRadius: '6px' }}>
              <TrendingUp size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>
            {formatCurrency(metrics?.netCommission)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Margen retenido plataforma
          </div>
        </div>

        {/* Fuga de Ingresos No-Shows */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #fee2e2',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#b91c1c' }}>Fuga por No-Shows</span>
            <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px', borderRadius: '6px' }}>
              <AlertOctagon size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>
            {formatCurrency(metrics?.noShowLostRevenue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '4px' }}>
            {metrics?.counts?.cancelledOrNoShow ?? 0} turnos cancelados
          </div>
        </div>

        {/* Conversión Triage a Pago */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Conversión Triage a Pago</span>
            <span style={{ backgroundColor: '#f3e8ff', color: '#7c3aed', padding: '4px', borderRadius: '6px' }}>
              <Percent size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>
            {typeof metrics?.triageToPaidConversionRate === 'number'
              ? `${metrics.triageToPaidConversionRate}%`
              : '0%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            De {metrics?.counts?.totalConsultations ?? 0} consultas iniciadas
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminExecutiveMetrics;
