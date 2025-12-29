import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';
import { Colors, Spacing } from '../../theme/tokens';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const FleetBilling: React.FC = () => {
  const { data } = useQuery({ queryKey: ['invoices'], queryFn: () => mockApi.fetchInvoices() });
  return (
    <View style={{ flex: 1, backgroundColor: Colors.darkSurface }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>Billing</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: Colors.lightSurface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <FlatList
          data={data || []}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', padding: Spacing.md, borderRadius: 16 }}>
              <Text style={{ color: Colors.textPrimary, fontWeight: '700' }}>{item.customer}</Text>
              <Text style={{ color: Colors.textSecondary }}>{formatCurrency(item.amount)}</Text>
              <Text style={{ color: Colors.primary }}>{item.status}</Text>
              <Text style={{ color: Colors.textSecondary }}>Due {formatDate(item.dueDate)}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};
