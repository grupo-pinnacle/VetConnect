import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchMediaDataUrl } from '../services/media.service';
import { colors } from '../theme/tokens';

/**
 * Adjunto clínico de un mensaje. Descarga bajo demanda con el token de
 * sesión (nunca expone URLs firmadas) y muestra imágenes en modal.
 */
export function AttachmentView({ attachmentId, testID }: { attachmentId: string; testID?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const open = async () => {
    setBusy(true);
    setError(null);
    try {
      const { dataUrl, mime } = await fetchMediaDataUrl(attachmentId);
      if (!mime.startsWith('image/')) {
        setError(`Adjunto ${mime}: solo se previsualizan imágenes`);
        return;
      }
      setImageUri(dataUrl);
      setViewerOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir el adjunto');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View testID={testID || 'attachment-view'}>
      <TouchableOpacity style={styles.chip} onPress={open} disabled={busy} testID={(testID || 'attachment-view') + '-open'}>
        {busy ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.chipText}>📎 Ver adjunto</Text>
        )}
      </TouchableOpacity>
      {!!error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={viewerOpen} transparent animationType="fade" testID="attachment-modal">
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {!!imageUri && (
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" testID="attachment-image" />
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setViewerOpen(false)} testID="attachment-close">
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  chipText: { fontSize: 12, fontWeight: 'bold', color: colors.primary },
  error: { fontSize: 11, color: colors.danger, marginTop: 4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: '#FFF', borderRadius: 12, padding: 12 },
  image: { width: '100%', height: 320, borderRadius: 8, backgroundColor: colors.canvas },
  closeBtn: { marginTop: 10, backgroundColor: colors.primary, borderRadius: 8, padding: 12, alignItems: 'center' },
  closeText: { color: '#FFF', fontWeight: 'bold' },
});
