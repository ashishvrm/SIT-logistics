import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchTrips, fetchVehicles, fetchInvoices, fetchNotifications } from '../../services/dataService';
import { FIREBASE_FEATURES } from '../../config/featureFlags';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserMenu } from '../../components/ui/UserMenu';

export const FleetBilling: React.FC = () => {
  const { data } = useQuery({ queryKey: ['invoices'], queryFn: () => fetchInvoices(FIREBASE_FEATURES.ORG_ID) });
  
  const totalRevenue = data?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
  const paidCount = data?.filter(inv => inv.status === 'Paid').length || 0;
  const pendingCount = data?.filter(inv => inv.status !== 'Paid').length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return Colors.success;
      case 'Overdue':
        return Colors.error;
      case 'Sent':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'check-circle';
      case 'Overdue':
        return 'alert-circle';
      case 'Sent':
        return 'clock-outline';
      default:
        return 'file-document-outline';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkGradientStart, Colors.darkGradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Billing & Invoices</Text>
          <UserMenu />
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.revenueSection}>
            <Text style={styles.revenueLabel}>Total Revenue</Text>
            <Text style={styles.revenueAmount}>{formatCurrency(totalRevenue)}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.miniStat}>
              <Icon name="check-circle" size={16} color={Colors.success} />
              <Text style={styles.miniStatText}>{paidCount} Paid</Text>
            </View>
            <View style={styles.miniStat}>
              <Icon name="clock-outline" size={16} color={Colors.warning} />
              <Text style={styles.miniStatText}>{pendingCount} Pending</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={data || []}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.invoiceCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                <Icon name={getStatusIcon(item.status)} size={28} color={getStatusColor(item.status)} />
              </View>
              <View style={styles.invoiceInfo}>
                <Text style={styles.customerName}>{item.customer}</Text>
                <Text style={styles.invoiceDate}>Due: {formatDate(item.dueDate)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.amountSection}>
              <View>
                <Text style={styles.amountLabel}>Invoice Amount</Text>
                <Text style={styles.amountValue}>{formatCurrency(item.amount)}</Text>
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="download" size={20} color={Colors.primary} />
                <Text style={styles.actionButtonText}>Download</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <View style={styles.footerItem}>
                <Icon name="calendar" size={16} color={Colors.textSecondary} />
                <Text style={styles.footerText}>Invoice #{item.id}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={Colors.primary} />
            </View>
          </TouchableOpacity>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textLight,
    marginBottom: 16
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Radius.cardLarge,
    padding: Spacing.lg
  },
  revenueSection: {
    marginBottom: 16
  },
  revenueLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8
  },
  revenueAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textLight
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  miniStatText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)'
  },
  listContent: {
    padding: Spacing.lg,
    gap: 16
  },
  invoiceCard: {
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.cardLarge,
    padding: Spacing.lg,
    ...Shadows.card
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  invoiceInfo: {
    flex: 1,
    marginLeft: 12
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  invoiceDate: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.chip
  },
  statusText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600'
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.button,
    gap: 6
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary
  }
});
