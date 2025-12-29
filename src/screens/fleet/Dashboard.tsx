import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const kpis = [
  { label: 'Active Trips', value: '12', icon: 'truck', color: Colors.primary },
  { label: 'Late Deliveries', value: '3', icon: 'alert-circle', color: Colors.error },
  { label: 'Idle Vehicles', value: '5', icon: 'pause-circle', color: Colors.warning },
  { label: 'Revenue', value: '₹8.2L', icon: 'cash', color: Colors.success }
];

export const FleetDashboard: React.FC = () => (
  <View style={styles.container}>
    <LinearGradient
      colors={[Colors.darkGradientStart, Colors.darkGradientEnd]}
      style={styles.header}
    >
      <Text style={styles.headerTitle}>Operations Dashboard</Text>
      <Text style={styles.headerSubtitle}>Real-time fleet overview</Text>
    </LinearGradient>

    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <View style={styles.kpiGrid}>
        {kpis.map((k) => (
          <View key={k.label} style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: `${k.color}20` }]}>
              <Icon name={k.icon} size={24} color={k.color} />
            </View>
            <Text style={styles.kpiValue}>{k.value}</Text>
            <Text style={styles.kpiLabel}>{k.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityItem}>
          <Icon name="truck" size={20} color={Colors.primary} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>TRK-1042</Text>
            <Text style={styles.activitySubtitle}>On time delivery</Text>
          </View>
          <Text style={styles.activityTime}>5m ago</Text>
        </View>
        <View style={styles.activityItem}>
          <Icon name="alert" size={20} color={Colors.warning} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>TRK-2040</Text>
            <Text style={styles.activitySubtitle}>Assign driver needed</Text>
          </View>
          <Text style={styles.activityTime}>12m ago</Text>
        </View>
      </View>
    </ScrollView>
  </View>
);

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
  content: {
    flex: 1
  },
  contentContainer: {
    padding: Spacing.lg,
    gap: 16
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  kpiCard: {
    width: '48%',
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    ...Shadows.card
  },
  kpiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  kpiLabel: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  card: {
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.cardLarge,
    padding: Spacing.lg,
    ...Shadows.card
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  activityContent: {
    flex: 1,
    marginLeft: 12
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  activitySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary
  }
});
