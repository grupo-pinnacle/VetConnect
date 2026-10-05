import React, { useMemo, useState } from 'react';
import type { ComponentClass } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView as RNWebView, WebViewProps, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../src/lib/authStore';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { evaluateCallPermissions } from '../../../src/lib/callPermissions';
import { buildAuthSeedScript, isLoopbackUrl, resolveWebCallUrl } from '../../../src/lib/webviewBridge';
import { colors, radius, spacing } from '../../../src/theme/tokens';

// webview@13.17 declara `class WebView<P = undefined> extends Component<Props & P>`:
// `Props & undefined` colapsa a `never` y rechaza toda prop en JSX.
// Cast quirúrgico (vía unknown, cero `any`) hasta corrección upstream.
const WebView = RNWebView as unknown as ComponentClass<WebViewProps>;

const DEFAULT_WEB_BASE_URL = 'http://localhost:5173';

export default function CallScreen() {
  const { consultationId } = useLocalSearchParams<{ consultationId: string }>();
  const router = useRouter();

  // The access token lives in memory only; SecureStore holds just the refresh
  // token, so the store is the only place it can be read from.
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isPageReady, setIsPageReady] = useState<boolean>(false);
  const [isPermissionRequestInFlight, setIsPermissionRequestInFlight] = useState<boolean>(false);
  const [webViewError, setWebViewError] = useState<string | null>(null);

  const webBaseUrl = process.env.EXPO_PUBLIC_WEB_URL || DEFAULT_WEB_BASE_URL;
  const callRoomUrl = useMemo(
    () => resolveWebCallUrl(webBaseUrl, consultationId ?? ''),
    [webBaseUrl, consultationId]
  );

  // `null` from either hook means the OS has not answered yet, which is not the
  // same as a denial and must not flash the denied panel.
  const permissionState = evaluateCallPermissions({
    cameraLoading: cameraPermission === null,
    cameraGranted: cameraPermission?.granted === true,
    micLoading: micPermission === null,
    micGranted: micPermission?.granted === true,
  });

  // Every one of these is a misconfiguration or a dead session. Reported
  // explicitly instead of rendering a silently blank WebView.
  const baseUrlError = useMemo(
    () =>
      isLoopbackUrl(webBaseUrl)
        ? `La dirección de la videollamada apunta a ${webBaseUrl}, que en el teléfono ` +
          'resuelve al propio dispositivo y no al servidor web. Configura ' +
          'EXPO_PUBLIC_WEB_URL con la IP o dominio de tu máquina para probar en un handset real.'
        : null,
    [webBaseUrl]
  );

  const authSeed = useMemo(
    () => (accessToken && user ? buildAuthSeedScript(accessToken, user) : null),
    [accessToken, user]
  );

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as { type?: string };

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

  const handleRequestPermissions = async () => {
    setIsPermissionRequestInFlight(true);
    try {
      // Both are requested: the room negotiates an audio and a video track.
      // The hooks re-render this screen with the new answer, which is what
      // actually leaves the `denied` branch.
      await Promise.all([requestCameraPermission(), requestMicPermission()]);
    } finally {
      setIsPermissionRequestInFlight(false);
    }
  };

  if (!consultationId) {
    return <CallError message="No se recibió el identificador de la consulta." onBack={router.back} />;
  }

  if (baseUrlError) {
    return <CallError message={baseUrlError} onBack={router.back} />;
  }

  if (!authSeed) {
    return (
      <CallError
        message="Tu sesión expiró. Vuelve a iniciar sesión para entrar a la llamada."
        onBack={router.back}
      />
    );
  }

  if (permissionState === 'loading') {
    return (
      <View style={styles.centerContainer} testID="call-permission-loading">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.body}>Verificando permisos de cámara y micrófono...</Text>
      </View>
    );
  }

  if (permissionState === 'denied') {
    return (
      <View style={styles.centerContainer} testID="permission-denied-screen">
        <View style={styles.permissionIcon}>
          <Ionicons name="videocam-off-outline" size={36} color={colors.primary} />
        </View>
        <Text style={styles.title}>Permisos de Cámara y Micrófono Requeridos</Text>
        <Text style={styles.body}>
          Para llevar a cabo la videoconsulta médica en vivo, VetConnect necesita acceso a la cámara y al micrófono de tu dispositivo.
        </Text>
        <View style={styles.permissionAction}>
          <PrimaryButton
            testID="request-permission-button"
            title={isPermissionRequestInFlight ? 'Solicitando...' : 'Habilitar Permisos'}
            icon="shield-checkmark"
            loading={isPermissionRequestInFlight}
            onPress={handleRequestPermissions}
          />
        </View>
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

  return (
    <View style={styles.container} testID="call-room-view">
      {!isPageReady && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.overlayText}>Preparando cámara y micrófono...</Text>
        </View>
      )}
      <WebView
        source={{ uri: callRoomUrl }}
        onMessage={handleWebViewMessage}
        // Runs before the document's own scripts: the only point where seeding
        // localStorage still precedes the web client's module-load read of it.
        //
        // This replaces an `injectJavaScript` call on `page:ready` that was a
        // no-op: the identifier it invoked has zero occurrences in `web/`, and
        // it could never have run anyway, because `page:ready` only fires after
        // the room mounts, and mounting required the credentials it was
        // supposed to deliver.
        injectedJavaScriptBeforeContentLoaded={authSeed}
        onError={() => setWebViewError('No se pudo conectar con el servidor de la videollamada.')}
        onHttpError={(event) => {
          if (event.nativeEvent.statusCode >= 500) {
            setWebViewError(
              `El servidor de la videollamada respondió con error ${event.nativeEvent.statusCode}.`
            );
          }
        }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        // Required for the seeded storage to persist and be readable.
        domStorageEnabled
        originWhitelist={['http://*', 'https://*']}
        style={styles.webview}
      />
      {webViewError ? (
        <View style={styles.webViewErrorBox} testID="call-webview-error">
          <Text style={styles.body}>{webViewError}</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            testID="call-webview-error-back"
          >
            <Text style={styles.cancelButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

function CallError({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <View style={styles.centerContainer} testID="call-config-error">
      <Text style={styles.title}>No se pudo abrir la videollamada</Text>
      <Text style={styles.body}>{message}</Text>
      <TouchableOpacity style={styles.cancelButton} onPress={onBack} testID="call-config-error-back">
        <Text style={styles.cancelButtonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.canvas,
    padding: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  permissionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  permissionAction: { width: '100%', maxWidth: 320, marginBottom: spacing.md },
  cancelButton: { paddingVertical: 10, paddingHorizontal: spacing.lg },
  cancelButtonText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  overlayLoading: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: spacing.md,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: { marginLeft: spacing.md, color: colors.primary, fontWeight: 'bold' },
  webViewErrorBox: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  webview: { flex: 1 },
});
