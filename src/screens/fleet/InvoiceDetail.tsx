import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchInvoices } from '../../services/dataService';
import { FIREBASE_FEATURES } from '../../config/featureFlags';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const FleetInvoiceDetail: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const { data: invoices } = useQuery({ 
    queryKey: ['invoices'], 
    queryFn: () => fetchInvoices(FIREBASE_FEATURES.ORG_ID) 
  });
  
  const invoice = invoices?.find(inv => inv.id === route.params.id);

  if (!invoice) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invoice not found</Text>
      </View>
    );
  }

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={28} color={Colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invoice Details</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
            <Icon name={getStatusIcon(invoice.status)} size={20} color={Colors.textLight} />
            <Text style={styles.statusText}>{invoice.status}</Text>
          </View>
        </View>

        <Text style={styles.invoiceNumber}>Invoice #{invoice.id}</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>{formatCurrency(invoice.amount)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoRow}>
            <Icon name="account" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Customer Name</Text>
              <Text style={styles.infoValue}>{invoice.customer}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>
          
          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Due Date</Text>
              <Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Icon name="file-document" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Invoice ID</Text>
              <Text style={styles.infoValue}>#{invoice.id}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Icon name={getStatusIcon(invoice.status)} size={20} color={getStatusColor(invoice.status)} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Payment Status</Text>
              <Text style={[styles.infoValue, { color: getStatusColor(invoice.status) }]}>
                {invoice.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="download" size={24} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Download Invoice</Text>
            <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="email" size={24} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Send Email</Text>
            <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="printer" size={24} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Print Invoice</Text>
            <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {invoice.status !== 'Paid' && (
          <TouchableOpacity style={styles.primaryButton}>
            <Icon name="cash" size={20} color={Colors.textLight} />
            <Text style={styles.primaryButtonText}>Mark as Paid</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  backButton: {
    padding: 4
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textLight
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.chip
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textLight
  },
  invoiceNumber: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: Spacing.lg,
    gap: 16
  },
  card: {
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.cardLarge,
    padding: Spacing.lg,
    ...Shadows.card
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8
  },
  amountValue: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.primary
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12
  },
  infoContent: {
    flex: 1
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.button,
    gap: 8,
    marginTop: 8,
    ...Shadows.card
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textLight
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 100
  }
});
