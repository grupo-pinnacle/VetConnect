import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../src/lib/api';
import { Prescription, ApiResponse } from '../../../src/types';

export default function PrescriptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        if (!id) return;
        const res = await api.get<ApiResponse<Prescription>>(`/api/prescriptions/${id}`);
        if (res.data.success && res.data.data) {
          setPrescription(res.data.data);
        } else {
          throw new Error(res.data.error?.message || 'Receta médica no encontrada');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar receta digital');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id]);

  const handleShare = async () => {
    if (!prescription) return;
    try {
      await Share.share({
        message: `Receta Médica Digital VetConnect SENASA\nMedicamento: ${prescription.medication}\nDosis: ${prescription.dosage}\nMatrícula Vet: ${prescription.vet?.licenseNumber || 'N/A'}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer} testID="prescription-loading-view">
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Cargando receta digital oficial SENASA...</Text>
      </View>
    );
  }

  if (error || !prescription) {
    return (
      <View style={styles.centerContainer} testID="prescription-error-view">
        <Text style={styles.errorText}>{error || 'Receta médica no disponible'}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} testID="prescription-mobile-screen">
      {/* High Contrast Header Box */}
      <View style={styles.headerBox} testID="rx-header">
        <Text style={styles.badgeText}>DOCUMENTO OFICIAL FIRMADO SENASA</Text>
        <Text style={styles.headerTitle}>Receta Médica Digital</Text>
        <Text style={styles.prescriptionId}>ID: {prescription.id}</Text>
      </View>

      {/* Vet & Patient Details */}
      <View style={styles.infoCard} testID="rx-info-card">
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Veterinario Prescriptor:</Text>
          <Text style={styles.infoValue} testID="rx-vet-name">
            Dr/a. {prescription.vet?.firstName} {prescription.vet?.lastName}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Matrícula SENASA:</Text>
          <Text style={styles.infoValue} testID="rx-vet-license">
            {prescription.vet?.licenseNumber || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha Emisión:</Text>
          <Text style={styles.infoValue}>
            {new Date(prescription.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Medication Details */}
      <View style={styles.medicationCard} testID="rx-medication-card">
        <Text style={styles.cardSectionTitle}>Prescripción Farmacéutica</Text>

        <View style={styles.medRow}>
          <Text style={styles.medLabel}>Medicamento:</Text>
          <Text style={styles.medValue} testID="rx-medication-name">{prescription.medication}</Text>
        </View>

        <View style={styles.medRow}>
          <Text style={styles.medLabel}>Dosis & Frecuencia:</Text>
          <Text style={styles.medValue}>{prescription.dosage} ({prescription.frequency})</Text>
        </View>

        <View style={styles.medRow}>
          <Text style={styles.medLabel}>Duración:</Text>
          <Text style={styles.medValue}>{prescription.durationDays} días</Text>
        </View>

        <View style={styles.indicationsBox}>
          <Text style={styles.indicationsTitle}>Indicaciones Clínicas:</Text>
          <Text style={styles.indicationsText}>{prescription.indications}</Text>
        </View>
      </View>

      {/* QR Code Banner */}
      {prescription.qrCodeDataUrl && (
        <View style={styles.qrContainer} testID="rx-qr-container">
          <Image
            source={{ uri: prescription.qrCodeDataUrl }}
            style={styles.qrImage}
            testID="rx-qr-image"
          />
          <Text style={styles.qrInstruction}>Escanear en farmacias autorizadas para verificar firma</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity testID="rx-share-button" style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Compartir</Text>
        </TouchableOpacity>

        <TouchableOpacity testID="rx-close-button" style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentContainer: { padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#475569' },
  errorText: { fontSize: 14, color: '#EF4444', marginBottom: 16, textAlign: 'center' },
  headerBox: { backgroundColor: '#0284C7', borderRadius: 16, padding: 20, marginBottom: 16 },
  badgeText: { color: '#BAE6FD', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 4 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  prescriptionId: { color: '#E0F2FE', fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
  infoCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 12, color: '#64748B', flex: 1 },
  infoValue: { fontSize: 12, fontWeight: 'bold', color: '#1E293B', flex: 1, textAlign: 'right' },
  medicationCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  cardSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  medRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  medLabel: { fontSize: 12, color: '#64748B', flex: 1 },
  medValue: { fontSize: 12, fontWeight: 'bold', color: '#0284C7', flex: 1, textAlign: 'right' },
  indicationsBox: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginTop: 12 },
  indicationsTitle: { fontSize: 11, fontWeight: 'bold', color: '#92400E', marginBottom: 2 },
  indicationsText: { fontSize: 12, color: '#78350F', lineHeight: 18 },
  qrContainer: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  qrImage: { width: 140, height: 140, marginBottom: 8 },
  qrInstruction: { fontSize: 11, color: '#64748B', textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  shareButton: { flex: 1, backgroundColor: '#059669', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  shareButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  closeButton: { flex: 1, backgroundColor: '#475569', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  closeButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
