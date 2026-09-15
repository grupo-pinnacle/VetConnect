import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Socket } from 'socket.io-client';
import { useAuthStore } from '../../../src/lib/authStore';
import socketManager from '../../../src/lib/socket';
import api from '../../../src/lib/api';
import { Message, ApiResponse } from '../../../src/types';

export default function ChatScreen() {
  const { consultationId } = useLocalSearchParams<{ consultationId: string }>();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!consultationId || !accessToken) return;

    const s = socketManager.connect(accessToken);
    setSocket(s);

    s.emit('join:consultation', { consultationId });

    s.on('message:new', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.createdAt) {
        socketManager.updateLastKnownTimestamp(consultationId, msg.createdAt);
      }
    });

    socketManager.trackConsultation(consultationId);

    // Fetch initial history
    api.get<ApiResponse<Message[]>>(`/api/consultations/${consultationId}/messages`)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setMessages(res.data.data);
          if (res.data.data.length > 0) {
            const latest = res.data.data[res.data.data.length - 1];
            socketManager.updateLastKnownTimestamp(consultationId, latest.createdAt);
          }
        }
      })
      .catch((err) => console.warn('Error fetching messages:', err))
      .finally(() => setLoading(false));

    return () => {
      s.off('message:new');
    };
  }, [consultationId, accessToken]);

  const handleSend = () => {
    if (!inputText.trim() || !socket || !consultationId) return;

    const clientMsgId = `mobile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    socket.emit(
      'message:send',
      {
        consultationId,
        content: inputText.trim(),
        clientMsgId,
      },
      (res: any) => {
        if (res?.success && res?.data) {
          // Idempotent delivery ack
        }
      }
    );

    setInputText('');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat Médico #{consultationId?.slice(0, 8)}</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id || item.clientMsgId}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isMine = item.senderId === user?.id;
          return (
            <View style={[styles.msgWrapper, isMine ? styles.myMsgWrapper : styles.otherMsgWrapper]}>
              <Text style={styles.senderName}>{item.sender?.firstName || 'Usuario'}</Text>
              <View style={[styles.msgBubble, isMine ? styles.myBubble : styles.otherBubble]}>
                <Text style={isMine ? styles.myText : styles.otherText}>{item.content}</Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escriba un mensaje..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 16, fontWeight: 'bold', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0', marginTop: 30 },
  msgWrapper: { marginBottom: 12, maxWidth: '80%' },
  myMsgWrapper: { alignSelf: 'flex-end' },
  otherMsgWrapper: { alignSelf: 'flex-start' },
  senderName: { fontSize: 10, color: '#64748B', marginBottom: 2 },
  msgBubble: { padding: 10, borderRadius: 8 },
  myBubble: { backgroundColor: '#0284C7' },
  otherBubble: { backgroundColor: '#E2E8F0' },
  myText: { color: '#FFF', fontSize: 14 },
  otherText: { color: '#0F172A', fontSize: 14 },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0' },
  input: { flex: 1, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, height: 40 },
  sendBtn: { backgroundColor: '#0284C7', marginLeft: 8, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8 },
  sendText: { color: '#FFF', fontWeight: 'bold' },
});
