import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { formatCurrency } from '../../utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const DriverEarnings: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkGradientStart, Colors.darkGradientEnd]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total This Week</Text>
          <Text style={styles.totalAmount}>{formatCurrency(23500)}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Recent Trips</Text>
        
        <View style={styles.earningCard}>
          <View style={styles.earningHeader}>
            <Icon name="truck" size={24} color={Colors.primary} />
            <View style={styles.earningInfo}>
              <Text style={styles.earningTrip}>TRK-1042</Text>
              <Text style={styles.earningDate}>Dec 27, 2024</Text>
            </View>
            <Text style={styles.earningAmount}>{formatCurrency(6200)}</Text>
          </View>
        </View>

        <View style={styles.earningCard}>
          <View style={styles.earningHeader}>
            <Icon name="truck" size={24} color={Colors.primary} />
            <View style={styles.earningInfo}>
              <Text style={styles.earningTrip}>TRK-2040</Text>
              <Text style={styles.earningDate}>Dec 26, 2024</Text>
            </View>
            <Text style={styles.earningAmount}>{formatCurrency(7800)}</Text>
          </View>
        </View>

        <View style={styles.earningCard}>
          <View style={styles.earningHeader}>
            <Icon name="truck" size={24} color={Colors.primary} />
            <View style={styles.earningInfo}>
              <Text style={styles.earningTrip}>TRK-1891</Text>
              <Text style={styles.earningDate}>Dec 25, 2024</Text>
            </View>
            <Text style={styles.earningAmount}>{formatCurrency(9500)}</Text>
          </View>
        </View>
      </View>
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
    marginBottom: 20
  },
  totalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Radius.cardLarge,
    padding: Spacing.lg
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textLight,
    marginBottom: 16
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4
  },
  content: {
    flex: 1,
    padding: Spacing.lg
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16
  },
  earningCard: {
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    marginBottom: 12,
    ...Shadows.card
  },
  earningHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  earningInfo: {
    flex: 1,
    marginLeft: 12
  },
  earningTrip: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  earningDate: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  earningAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary
  }
});
