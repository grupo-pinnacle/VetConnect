import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import api from '../../../src/lib/api';
import { ApiResponse } from '../../../src/types';

export default function CallScreen() {
  const { consultationId } = useLocalSearchParams<{ consultationId: string }>();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPageReady, setIsPageReady] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(true);

  const WEB_CALL_URL = process.env.EXPO_PUBLIC_WEB_URL || 'http://localhost:5173';

  useEffect(() => {
    let isMounted = true;

    const fetchToken = async () => {
      try {
        const res = await api.post<ApiResponse<{ token: string; wsUrl: string }>>(
          `/api/calls/${consultationId}/token`
        );

        if (res.data.success && res.data.data?.token) {
          if (isMounted) {
            setToken(res.data.data.token);
          }
        } else {
          throw new Error(res.data.error?.message || 'Error obteniendo token WebRTC');
        }
      } catch (err: any) {
        Alert.alert('Error de Videollamada', err.message || 'No se pudo iniciar la llamada', [
          { text: 'Volver', onPress: () => router.back() },
        ]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (consultationId) {
      fetchToken();
    }

    return () => {
      isMounted = false;
    };
  }, [consultationId, router]);

  // Safely inject token when BOTH token and isPageReady are available
  useEffect(() => {
    if (token && isPageReady && webViewRef.current) {
      const jsInject = `window.initLiveKitCall && window.initLiveKitCall(${JSON.stringify(token)}); true;`;
      webViewRef.current.injectJavaScript(jsInject);
    }
  }, [token, isPageReady]);

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'page:ready') {
        setIsPageReady(true);
      } else if (data.type === 'call:ended') {
        Alert.alert('Llamada Finalizada', 'La videollamada ha concluido', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err) {
      console.warn('Error parsing WebView message:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer} testID="call-loading-screen">
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Conectando con sala de telemedicina...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer} testID="permission-denied-screen">
        <Text style={styles.permissionTitle}>Permisos de Cámara y Micrófono Requeridos</Text>
        <Text style={styles.permissionBody}>
          Para llevar a cabo la videoconsulta médica en vivo, VetConnect necesita acceso a la cámara y al micrófono de tu dispositivo.
        </Text>
        <TouchableOpacity
          testID="request-permission-button"
          style={styles.permissionButton}
          onPress={() => setHasPermission(true)}
        >
          <Text style={styles.permissionButtonText}>Habilitar Permisos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="cancel-call-button"
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const callRoomUrl = `${WEB_CALL_URL}/call/${consultationId}`;

  return (
    <View style={styles.container} testID="call-room-view">
      {!isPageReady && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="small" color="#0284C7" />
          <Text style={styles.overlayText}>Preparando cámara y micrófono...</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: callRoomUrl }}
        onMessage={handleWebViewMessage}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#333' },
  permissionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 8, textAlign: 'center' },
  permissionBody: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  permissionButton: { backgroundColor: '#0284C7', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginBottom: 12 },
  permissionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 20 },
  cancelButtonText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  overlayLoading: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: { marginLeft: 10, color: '#0284C7', fontWeight: 'bold' },
  webview: { flex: 1 },
});
