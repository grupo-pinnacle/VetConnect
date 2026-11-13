import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export interface FeatureFlagDTO {
  key: 'PAYMENTS_ENABLED' | 'TRIAGE_ACTIVE' | 'VIDEOCALLS_ENABLED' | 'NEW_REGISTRATIONS_ENABLED';
  enabled: boolean;
  description: string;
  updatedAt: string;
  updatedBy?: string | null;
}

export interface AdminFeatureFlagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flags?: FeatureFlagDTO[];
  onToggleFlag?: (key: FeatureFlagDTO['key'], enabled: boolean, reason?: string) => Promise<void>;
}

export function AdminFeatureFlagsModal({
  isOpen,
  onClose,
  flags: externalFlags,
  onToggleFlag,
}: AdminFeatureFlagsModalProps): JSX.Element | null {
  const [internalFlags, setInternalFlags] = useState<FeatureFlagDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('Conmutación operativa desde Admin Suite');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || externalFlags !== undefined) return;
    setLoading(true);
    api
      .get<{ success: boolean; data: FeatureFlagDTO[] }>('/api/admin/feature-flags')
      .then((res) => {
        if (res.data?.data) {
          setInternalFlags(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching feature flags:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, externalFlags]);

  if (!isOpen) return null;

  const currentFlags = externalFlags !== undefined ? externalFlags : internalFlags;

  const handleToggle = async (flag: FeatureFlagDTO) => {
    const nextState = !flag.enabled;
    const currentReason = reason.trim() || 'Conmutación operativa desde Admin Suite';
    setActionInProgress(flag.key);

    try {
      if (onToggleFlag) {
        await onToggleFlag(flag.key, nextState, currentReason);
      } else {
        const res = await api.patch<{ success: boolean; data: FeatureFlagDTO }>('/api/admin/feature-flags', {
          key: flag.key,
          enabled: nextState,
          reason: currentReason,
        });
        if (res.data?.data) {
          setInternalFlags((prev) =>
            prev.map((f) => (f.key === flag.key ? res.data.data : f))
          );
        }
      }
    } catch (err) {
      console.error('Error toggling feature flag:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(24, 60, 58, 0.54)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fffbef',
          border: '1px solid #e4dfd2',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(24, 60, 58, 0.24)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e4dfd2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={24} color="#ae4d45" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#183c3a' }}>
                Kill Switches y Resiliencia en Producción
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#607674' }}>
                Conmutación en caliente sin redeploy. Al desactivar un módulo, responderá HTTP 503.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{ background: '#f2eddd', border: 'none', borderRadius: '999px', cursor: 'pointer', padding: '6px' }}
          >
            <X size={18} color="#183c3a" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="reason-input"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#183c3a', marginBottom: '6px' }}
            >
              Motivo de la acción (Audit Log obligatorio en producción):
            </label>
            <input
              id="reason-input"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Mantenimiento preventivo pasarela de pagos"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '14px',
                border: '1px solid #e4dfd2',
                backgroundColor: '#ffffff',
                color: '#183c3a',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#607674' }}>Cargando banderas operativas...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentFlags.map((flag) => {
                const isBusy = actionInProgress === flag.key;
                return (
                  <div
                    key={flag.key}
                    style={{
                      border: flag.enabled ? '1px solid #e4dfd2' : '1px solid #f3c8be',
                      borderRadius: '18px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      backgroundColor: flag.enabled ? '#ffffff' : '#fcece9',
                    }}
                  >
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#183c3a' }}>{flag.key}</span>
                        {flag.enabled ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#edf6f4',
                              color: '#315f5d',
                              border: '1px solid #d9e8e4',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 10px',
                              borderRadius: '999px',
                            }}
                          >
                            <CheckCircle size={12} /> ACTIVO
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#fcece9',
                              color: '#ae4d45',
                              border: '1px solid #f3c8be',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 10px',
                              borderRadius: '999px',
                            }}
                          >
                            <AlertTriangle size={12} /> INACTIVO (503)
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.825rem', color: '#454e4e' }}>{flag.description}</p>
                    </div>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggle(flag)}
                      aria-label={`Conmutar estado de ${flag.key}`}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: isBusy ? 'not-allowed' : 'pointer',
                        border: 'none',
                        color: '#ffffff',
                        backgroundColor: flag.enabled ? '#ae4d45' : '#609f9c',
                        transition: 'opacity 0.2s, background-color 0.2s',
                        opacity: isBusy ? 0.7 : 1,
                        flexShrink: 0,
                      }}
                    >
                      {flag.enabled ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e4dfd2',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 20px',
              borderRadius: '999px',
              border: '1px solid #d5cec0',
              backgroundColor: '#f2eddd',
              color: '#183c3a',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
export default AdminFeatureFlagsModal;
