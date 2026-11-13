import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [pricingError, setPricingError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Form local state
  const [feeInput, setFeeInput] = useState<string>('15000');
  const [takeRateInput, setTakeRateInput] = useState<string>('20');
  const [currencyInput, setCurrencyInput] = useState<SupportedCurrency>('ARS');
  const [reasonInput, setReasonInput] = useState<string>('Ajuste de arancel ejecutivo desde panel admin');

  const fetchMetrics = useCallback(() => {
    setInternalLoading(true);
    api
      .get<{ success: boolean; data: ExecutiveMetricsData }>('/api/admin/executive-metrics')
      .then((res) => {
        if (isMountedRef.current && res.data?.data) {
          setInternalMetrics(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching executive metrics:', err);
      })
      .finally(() => {
        if (isMountedRef.current) setInternalLoading(false);
      });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (externalMetrics === undefined) {
      fetchMetrics();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [externalMetrics, fetchMetrics]);

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
    setPricingError(null);
    const fee = Number(feeInput);
    const ratePercent = Number(takeRateInput);

    if (isNaN(fee) || fee <= 0) {
      setPricingError('El arancel base debe ser un número positivo.');
      return;
    }
    if (isNaN(ratePercent) || ratePercent < 0 || ratePercent > 100) {
      setPricingError('La comisión debe ser un porcentaje entre 0 y 100.');
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
        if (externalMetrics === undefined) {
          fetchMetrics();
        }
      } else {
        await api.patch('/api/admin/pricing-settings', payload);
        fetchMetrics();
      }
      setIsEditingPricing(false);
    } catch (err) {
      console.error('Error updating pricing settings:', err);
      setPricingError('Error al actualizar las tarifas. Verificá los valores e intentá nuevamente.');
    } finally {
      setIsSavingPricing(false);
    }
  };

  const handleRefresh = () => {
    if (externalMetrics === undefined) {
      fetchMetrics();
    }
    onRefresh?.();
  };

  return (
    <div className="admin-executive-metrics" style={{ marginBottom: '24px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#183c3a' }}>
              Métricas Ejecutivas y Unit Economics (CEO)
            </h2>
            {/* White-label tariff active badge */}
            {metrics?.pricing && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#edf6f4',
                  color: '#315f5d',
                  border: '1px solid #d9e8e4',
                }}
              >
                Tarifa Activa: {formatCurrency(activeFee)} {activeCurrency} | Take-Rate: {activeRate}%
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#607674' }}>
            Visión económica, margen neto de plataforma y fuga por cancelaciones.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setPricingError(null);
              setIsEditingPricing((prev) => !prev);
            }}
            aria-label="Configurar tarifa"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '999px',
              border: '1px solid #d5cec0',
              backgroundColor: isEditingPricing ? '#f2eddd' : '#fffbef',
              fontSize: '0.825rem',
              fontWeight: 700,
              color: '#183c3a',
              cursor: 'pointer',
            }}
          >
            <Settings2 size={14} />
            <span>Configurar tarifa</span>
          </button>

          {onRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '999px',
                border: '1px solid #d5cec0',
                backgroundColor: '#fffbef',
                color: '#183c3a',
                fontSize: '0.825rem',
                fontWeight: 700,
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
            backgroundColor: '#f2eddd',
            border: '1px solid #e4dfd2',
            borderRadius: '20px',
            padding: '18px',
            marginBottom: '20px',
            boxShadow: '0 8px 20px rgba(24, 60, 58, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#183c3a' }}>
              Parametrización de Tarifas Marca Blanca (Unit Economics del Tenant)
            </span>
            <button
              type="button"
              onClick={() => {
                setPricingError(null);
                setIsEditingPricing(false);
              }}
              style={{ background: '#fffbef', border: '1px solid #e4dfd2', borderRadius: '999px', padding: '4px', cursor: 'pointer', color: '#183c3a' }}
            >
              <X size={16} />
            </button>
          </div>

          {pricingError && (
            <div
              role="alert"
              style={{
                marginBottom: '12px',
                padding: '10px 14px',
                borderRadius: '14px',
                backgroundColor: '#fcece9',
                border: '1px solid #f3c8be',
                color: '#ae4d45',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {pricingError}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <div>
              <label
                htmlFor="baseConsultationFee"
                style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#183c3a', marginBottom: '4px' }}
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
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid #e4dfd2',
                  backgroundColor: '#ffffff',
                  color: '#183c3a',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="platformTakeRate"
                style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#183c3a', marginBottom: '4px' }}
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
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid #e4dfd2',
                  backgroundColor: '#ffffff',
                  color: '#183c3a',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="currency"
                style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#183c3a', marginBottom: '4px' }}
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
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid #e4dfd2',
                  backgroundColor: '#ffffff',
                  color: '#183c3a',
                  fontSize: '0.875rem',
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
                style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#183c3a', marginBottom: '4px' }}
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
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid #e4dfd2',
                  backgroundColor: '#ffffff',
                  color: '#183c3a',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setPricingError(null);
                setIsEditingPricing(false);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                border: '1px solid #d5cec0',
                backgroundColor: '#fffbef',
                color: '#183c3a',
                fontSize: '0.825rem',
                fontWeight: 700,
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
                padding: '8px 18px',
                borderRadius: '999px',
                backgroundColor: '#609f9c',
                color: '#ffffff',
                fontSize: '0.825rem',
                fontWeight: 700,
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
            backgroundColor: '#ffffff',
            padding: '18px',
            borderRadius: '22px',
            border: '1px solid #e4dfd2',
            boxShadow: '0 8px 24px rgba(24, 60, 58, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#607674' }}>GMV Total</span>
            <span style={{ backgroundColor: '#edf6f4', color: '#315f5d', padding: '6px', borderRadius: '10px' }}>
              <DollarSign size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#183c3a' }}>
            {formatCurrency(metrics?.gmvTotal)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#607674', marginTop: '4px' }}>
            Consultas completadas ({metrics?.counts?.completed ?? 0})
          </div>
        </div>

        {/* Comisión Neta */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '18px',
            borderRadius: '22px',
            border: '1px solid #e4dfd2',
            boxShadow: '0 8px 24px rgba(24, 60, 58, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#607674' }}>
              Comisión Neta ({metrics?.pricing ? Math.round(metrics.pricing.platformTakeRate * 100) : 20}%)
            </span>
            <span style={{ backgroundColor: '#edf6f4', color: '#609f9c', padding: '6px', borderRadius: '10px' }}>
              <TrendingUp size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#315f5d' }}>
            {formatCurrency(metrics?.netCommission)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#607674', marginTop: '4px' }}>
            Margen retenido plataforma
          </div>
        </div>

        {/* Fuga de Ingresos No-Shows */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '18px',
            borderRadius: '22px',
            border: '1px solid #f3c8be',
            boxShadow: '0 8px 24px rgba(24, 60, 58, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ae4d45' }}>Fuga por No-Shows</span>
            <span style={{ backgroundColor: '#fcece9', color: '#ae4d45', padding: '6px', borderRadius: '10px' }}>
              <AlertOctagon size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ae4d45' }}>
            {formatCurrency(metrics?.noShowLostRevenue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8f3f38', marginTop: '4px' }}>
            {metrics?.counts?.cancelledOrNoShow ?? 0} turnos cancelados
          </div>
        </div>

        {/* Conversión Triage a Pago */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '18px',
            borderRadius: '22px',
            border: '1px solid #e4dfd2',
            boxShadow: '0 8px 24px rgba(24, 60, 58, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#607674' }}>Conversión Triage a Pago</span>
            <span style={{ backgroundColor: '#f2eddd', color: '#183c3a', padding: '6px', borderRadius: '10px' }}>
              <Percent size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#183c3a' }}>
            {typeof metrics?.triageToPaidConversionRate === 'number'
              ? `${metrics.triageToPaidConversionRate}%`
              : '0%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#607674', marginTop: '4px' }}>
            De {metrics?.counts?.totalConsultations ?? 0} consultas iniciadas
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminExecutiveMetrics;
