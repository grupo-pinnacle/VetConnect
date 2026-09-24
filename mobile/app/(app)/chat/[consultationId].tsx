import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Socket } from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../../src/lib/authStore';
import socketManager from '../../../src/lib/socket';
import api, { getApiErrorMessage } from '../../../src/lib/api';
import { Message, ApiResponse } from '../../../src/types';
import { uploadMediaFile, mimeFromExtension } from '../../../src/services/media.service';
import { colors } from '../../../src/theme/tokens';

interface SendAck {
  success: boolean;
  data?: Message;
  error?: { message: string };
}

export default function ChatScreen() {
  const { consultationId } = useLocalSearchParams<{ consultationId: string }>();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!consultationId || !accessToken) return;

    const s = socketManager.connect(accessToken);
    setSocket(s);
    setConnected(s.connected);

    const onConnect = () => {
      setConnected(true);
      setError(null);
      socketManager.syncIncrementalMessages().catch(() => {});
    };
    const onDisconnect = () => setConnected(false);
    const onNew = (msg: Message) => {
      setMessages((prev) => (prev.some((m) => m.clientMsgId === msg.clientMsgId) ? prev : [...prev, msg]));
      if (msg.createdAt) socketManager.updateLastKnownTimestamp(consultationId, msg.createdAt);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.emit('join:consultation', { consultationId });
    s.on('message:new', onNew);

    socketManager.trackConsultation(consultationId);

    api
      .get<ApiResponse<Message[]>>(`/api/consultations/${consultationId}/messages`)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setMessages(res.data.data);
          if (res.data.data.length > 0) {
            const latest = res.data.data[res.data.data.length - 1];
            socketManager.updateLastKnownTimestamp(consultationId, latest.createdAt);
          }
        } else {
          setError(res.data.error?.message || 'Error cargando mensajes');
        }
      })
      .catch((err: unknown) => setError(getApiErrorMessage(err, 'Error cargando mensajes. Verifique su conexión.')))
      .finally(() => setLoading(false));

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('message:new', onNew);
    };
  }, [consultationId, accessToken]);

  const sendText = (content: string, attachmentUrl?: string) => {
    if ((!content.trim() && !attachmentUrl) || !socket || !consultationId) return;
    const clientMsgId = `mobile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    socket.emit(
      'message:send',
      { consultationId, content: content.trim() || '(adjunto)', clientMsgId, ...(attachmentUrl ? { attachmentUrl } : {}) },
      (res: SendAck | undefined) => {
        if (res && !res.success) {
          Alert.alert('No enviado', res.error?.message || 'Reintente cuando recupere conexión');
        }
      }
    );
  };

  const handleSend = () => {
    sendText(inputText);
    setInputText('');
  };

  const handleAttach = async () => {
    if (!consultationId) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Permita acceso a fotos para adjuntar imágenes clínicas.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (picked.canceled || !picked.assets[0]) return;
    const asset = picked.assets[0];
    const name = asset.fileName || `chat-${Date.now()}.jpg`;
    setUploading(true);
    try {
      const uploaded = await uploadMediaFile(asset.uri, name, mimeFromExtension(name), consultationId);
      sendText(inputText, String(uploaded.id));
      setInputText('');
    } catch (err) {
      Alert.alert('Adjunto fallido', err instanceof Error ? err.message : 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center} testID="chat-loading">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="chat-screen">
      <Text style={styles.header}>Chat Médico #{consultationId?.slice(0, 8)}</Text>

      {!connected && (
        <View style={styles.offlineBar} testID="chat-offline">
          <Text style={styles.offlineText}>Sin conexión · reintentando… los mensajes se sincronizarán</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorBox} testID="chat-error">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id || item.clientMsgId}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty} testID="chat-empty">Aún no hay mensajes. Escriba el primero.</Text>}
        renderItem={({ item }) => {
          const isMine = item.senderId === user?.id;
          return (
            <View style={[styles.msgWrapper, isMine ? styles.myMsgWrapper : styles.otherMsgWrapper]}>
              <Text style={styles.senderName}>{item.sender?.firstName || 'Usuario'}</Text>
              <View style={[styles.msgBubble, isMine ? styles.myBubble : styles.otherBubble]}>
                <Text style={isMine ? styles.myText : styles.otherText}>{item.content}</Text>
                {!!item.attachmentUrl && <Text style={styles.attachText}>📎 adjunto</Text>}
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.attachBtn} onPress={handleAttach} disabled={uploading} testID="chat-attach">
          <Text style={styles.attachBtnText}>{uploading ? '…' : '+'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Escriba un mensaje..."
          value={inputText}
          onChangeText={setInputText}
          testID="chat-input"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} testID="chat-send">
          <Text style={styles.sendText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 16, fontWeight: 'bold', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: colors.line, marginTop: 30 },
  offlineBar: { backgroundColor: '#FEF3C7', padding: 8 },
  offlineText: { color: '#92400E', fontSize: 12, textAlign: 'center' },
  errorBox: { backgroundColor: '#FEF2F2', padding: 8 },
  errorText: { color: colors.danger, fontSize: 12, textAlign: 'center' },
  empty: { color: colors.faint, textAlign: 'center', marginTop: 32 },
  msgWrapper: { marginBottom: 12, maxWidth: '80%' },
  myMsgWrapper: { alignSelf: 'flex-end' },
  otherMsgWrapper: { alignSelf: 'flex-start' },
  senderName: { fontSize: 10, color: colors.muted, marginBottom: 2 },
  msgBubble: { padding: 10, borderRadius: 8 },
  myBubble: { backgroundColor: colors.primary },
  otherBubble: { backgroundColor: colors.line },
  myText: { color: '#FFF', fontSize: 14 },
  otherText: { color: colors.ink, fontSize: 14 },
  attachText: { fontSize: 11, marginTop: 4, opacity: 0.8 },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: colors.line, alignItems: 'center' },
  attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.line, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  attachBtnText: { fontSize: 20, color: colors.primary, fontWeight: 'bold' },
  input: { flex: 1, borderWidth: 1, borderColor: colors.lineDark, borderRadius: 8, paddingHorizontal: 12, height: 40 },
  sendBtn: { backgroundColor: colors.primary, marginLeft: 8, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8, height: 40 },
  sendText: { color: '#FFF', fontWeight: 'bold' },
});
