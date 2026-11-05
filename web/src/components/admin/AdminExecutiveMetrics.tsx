import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertOctagon, Percent, RefreshCw } from 'lucide-react';
import api from '../../services/api';

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
}

export interface AdminExecutiveMetricsProps {
  metrics?: ExecutiveMetricsData | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export function AdminExecutiveMetrics({
  metrics: externalMetrics,
  loading: externalLoading,
  onRefresh,
}: AdminExecutiveMetricsProps): JSX.Element {
  const [internalMetrics, setInternalMetrics] = useState<ExecutiveMetricsData | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);

  useEffect(() => {
    if (externalMetrics !== undefined) return;
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
  }, [externalMetrics]);

  const metrics = externalMetrics !== undefined ? externalMetrics : internalMetrics;
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  const formatCurrency = (val?: number) => {
    if (typeof val !== 'number') return '$0';
    return `$${val.toLocaleString('es-AR')}`;
  };

  return (
    <div className="admin-executive-metrics" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #1e293b)' }}>
            Métricas Ejecutivas y Unit Economics (CEO)
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #64748b)' }}>
            Visión económica, margen neto de plataforma y fuga por cancelaciones.
          </p>
        </div>
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
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Comisión Neta (20%)</span>
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
