import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../src/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { colors, radius } from '../../../src/theme/tokens';
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
      {/* High Contrast Passport/Clinical Header Box */}
      <View style={styles.headerBox} testID="rx-header">
        <View style={styles.badgeRow}>
          <Ionicons name="shield-checkmark" size={16} color={colors.okLight} />
          <Text style={styles.badgeText}>DOCUMENTO OFICIAL FIRMADO SENASA</Text>
        </View>
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
          <View style={styles.indicationsHeader}>
            <Ionicons name="information-circle-outline" size={16} color={colors.indicationsInk} />
            <Text style={styles.indicationsTitle}>Indicaciones Clínicas:</Text>
          </View>
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
        <View style={styles.actionBtn}>
          <PrimaryButton
            testID="rx-share-button"
            title="Compartir"
            icon="share-social-outline"
            onPress={handleShare}
          />
        </View>
        <View style={styles.actionBtn}>
          <PrimaryButton
            testID="rx-close-button"
            title="Cerrar"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  contentContainer: { padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.canvas, padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.muted },
  errorText: { fontSize: 14, color: colors.danger, marginBottom: 16, textAlign: 'center' },
  headerBox: { backgroundColor: colors.passport, borderRadius: radius.pass, padding: 20, marginBottom: 16 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  badgeText: { color: colors.okLight, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  prescriptionId: { color: colors.faint, fontSize: 12, marginTop: 4 },
  infoCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 13, color: colors.muted, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '700', color: colors.ink, flex: 1, textAlign: 'right' },
  medicationCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line, marginBottom: 16 },
  cardSectionTitle: { fontSize: 15, fontWeight: '800', color: colors.ink, marginBottom: 12 },
  medRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  medLabel: { fontSize: 13, color: colors.muted, flex: 1 },
  medValue: { fontSize: 13, fontWeight: '700', color: colors.primary, flex: 1, textAlign: 'right' },
  indicationsBox: { backgroundColor: colors.indicationsBg, padding: 12, borderRadius: radius.md, marginTop: 12 },
  indicationsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  indicationsTitle: { fontSize: 12, fontWeight: '700', color: colors.indicationsInk },
  indicationsText: { fontSize: 13, color: colors.indicationsInk, lineHeight: 18 },
  qrContainer: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.line, marginBottom: 20 },
  qrImage: { width: 140, height: 140, marginBottom: 8 },
  qrInstruction: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1 },
  closeButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  closeButtonText: { color: colors.muted, fontWeight: 'bold', fontSize: 14 },
});
