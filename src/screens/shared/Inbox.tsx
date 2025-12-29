import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const DriverInbox: React.FC = () => {
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: () => mockApi.fetchNotifications() });
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkGradientStart, Colors.darkGradientEnd]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerSubtitle}>{data?.length || 0} new messages</Text>
      </LinearGradient>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.notificationCard, !item.read && styles.unreadCard]}>
            <View style={styles.iconContainer}>
              <Icon name="bell" size={24} color={Colors.primary} />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationTime}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: Spacing.lg
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textLight,
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  listContent: {
    padding: Spacing.lg,
    gap: 12
  },
  notificationCard: {
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    flexDirection: 'row',
    ...Shadows.card
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  notificationContent: {
    flex: 1
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.textSecondary
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginLeft: 8
  }
});
