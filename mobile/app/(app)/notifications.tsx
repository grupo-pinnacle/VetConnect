import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../../src/types';
import { getApiErrorMessage } from '../../src/lib/api';
import MobileNotificationService from '../../src/services/notifications.service';
import { resolveNotificationHref } from '../../src/lib/deepLinks';
import { colors, spacing, radius } from '../../src/theme/tokens';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const data = await MobileNotificationService.fetchNotifications();
      setNotifications(data);
      setError(null);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Error cargando notificaciones. Deslice para reintentar.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handlePressNotification = async (item: Notification) => {
    if (!item.isRead) {
      MobileNotificationService.markAsRead(item.id).catch((err) => {
        console.warn('Failed marking notification as read:', err);
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
    }

    if (item.data) {
      const href = resolveNotificationHref(item.data);
      if (href) {
        router.push(href as any);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await MobileNotificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      console.warn('Failed marking all notifications as read:', err);
    }
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  if (loading) {
    return (
      <View style={styles.centerContainer} testID="notifications-loading">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="notifications-screen">
      <View style={styles.headerRow}>
        <Text style={styles.title}>Alertas Clínicas</Text>
        {hasUnread && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            testID="mark-all-read-btn"
            accessibilityLabel="Marcar todas como leídas"
          >
            <Text style={styles.markAllBtnText}>Marcar leídas</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorBox} testID="notifications-error">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchNotifications();
            }}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer} testID="notifications-empty">
            <Ionicons name="notifications-outline" size={48} color={colors.faint} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>Bandeja al día</Text>
            <Text style={styles.emptyText}>No tienes alertas clínicas pendientes</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemCard, !item.isRead && styles.unreadCard]}
            onPress={() => handlePressNotification(item)}
            testID={`notification-item-${item.id}`}
            accessibilityLabel={`Notificación: ${item.title}`}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {!item.isRead && <View style={styles.badge} />}
            </View>
            <Text style={styles.itemBody}>{item.body}</Text>
            <Text style={styles.itemDate}>
              {new Date(item.createdAt).toLocaleString([], {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.lg,
    paddingTop: 36,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.canvas,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: '#E0F2FE',
    borderRadius: radius.md,
  },
  markAllBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  unreadCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  itemBody: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  itemDate: {
    fontSize: 11,
    color: colors.faint,
    marginTop: spacing.sm,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
});
