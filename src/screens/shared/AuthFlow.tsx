import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { useSessionStore } from '../../store/session';
import { mockApi } from '../../services/mockApi';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const AuthFlow: React.FC = () => {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [orgId, setOrgId] = useState('org1');
  const [branchId, setBranchId] = useState('b1');
  const [role, setRole] = useState<'Driver' | 'Fleet'>('Driver');
  const setLoggedIn = useSessionStore((s) => s.setLoggedIn);
  const setOrg = useSessionStore((s) => s.setOrg);
  const setBranch = useSessionStore((s) => s.setBranch);
  const setRoleStore = useSessionStore((s) => s.setRole);

  const steps = ['Welcome', 'Permissions', 'Login', 'OTP', 'Organization', 'Branch', 'Role'];

  const next = async () => {
    if (step === 2) await mockApi.login();
    if (step === steps.length - 1) {
      setOrg({ id: orgId, name: 'Apex Logistics' });
      setBranch({ id: branchId, name: 'Mumbai Hub', orgId });
      setRoleStore(role);
      setLoggedIn(true);
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkGradientStart, Colors.darkGradientEnd]}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.logoContainer}>
            <Icon name="truck-fast" size={64} color={Colors.primary} />
            <Text style={styles.title}>Logistics & Tracking</Text>
            <Text style={styles.subtitle}>Real-time cargo management</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.stepIndicator}>
              Step {step + 1} of {steps.length}
            </Text>
            <Text style={styles.stepTitle}>{steps[step]}</Text>

            {step === 1 && (
              <View style={styles.permissionsContainer}>
                <View style={styles.permissionItem}>
                  <Icon name="map-marker" size={24} color={Colors.primary} />
                  <Text style={styles.permissionText}>Location Access</Text>
                  <Icon name="check-circle" size={24} color={Colors.success} />
                </View>
                <View style={styles.permissionItem}>
                  <Icon name="bell" size={24} color={Colors.primary} />
                  <Text style={styles.permissionText}>Notifications</Text>
                  <Icon name="check-circle" size={24} color={Colors.success} />
                </View>
              </View>
            )}

            {step === 2 && (
              <View style={styles.inputContainer}>
                <Icon name="phone" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Phone or Email"
                  placeholderTextColor={Colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                />
              </View>
            )}

            {step === 3 && (
              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter OTP"
                  placeholderTextColor={Colors.textSecondary}
                  value={otp}
                  onChangeText={setOtp}
                  style={styles.input}
                  keyboardType="number-pad"
                />
              </View>
            )}

            {step === 4 && (
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[styles.optionButton, orgId === 'org1' && styles.optionButtonActive]}
                  onPress={() => setOrgId('org1')}
                >
                  <Text style={[styles.optionText, orgId === 'org1' && styles.optionTextActive]}>
                    Apex Logistics
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, orgId === 'org2' && styles.optionButtonActive]}
                  onPress={() => setOrgId('org2')}
                >
                  <Text style={[styles.optionText, orgId === 'org2' && styles.optionTextActive]}>
                    Northlane Freight
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 5 && (
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[styles.optionButton, branchId === 'b1' && styles.optionButtonActive]}
                  onPress={() => setBranchId('b1')}
                >
                  <Text style={[styles.optionText, branchId === 'b1' && styles.optionTextActive]}>
                    Mumbai Hub
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, branchId === 'b2' && styles.optionButtonActive]}
                  onPress={() => setBranchId('b2')}
                >
                  <Text style={[styles.optionText, branchId === 'b2' && styles.optionTextActive]}>
                    Delhi Hub
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 6 && (
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleCard, role === 'Driver' && styles.roleCardActive]}
                  onPress={() => setRole('Driver')}
                >
                  <Icon name="steering" size={48} color={role === 'Driver' ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.roleTitle, role === 'Driver' && styles.roleTextActive]}>
                    Driver
                  </Text>
                  <Text style={styles.roleDescription}>Manage trips and deliveries</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleCard, role === 'Fleet' && styles.roleCardActive]}
                  onPress={() => setRole('Fleet')}
                >
                  <Icon name="office-building" size={48} color={role === 'Fleet' ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.roleTitle, role === 'Fleet' && styles.roleTextActive]}>
                    Fleet Ops
                  </Text>
                  <Text style={styles.roleDescription}>Monitor fleet operations</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={next}>
            <Text style={styles.primaryButtonText}>
              {step === steps.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Icon name="arrow-right" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  background: {
    flex: 1
  },
  content: {
    padding: Spacing.lg,
    paddingTop: 80
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textLight,
    marginTop: 16,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  card: {
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.cardLarge,
    padding: Spacing.lg,
    marginBottom: 20,
    ...Shadows.card
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 20
  },
  permissionsContainer: {
    gap: 16
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.lightBackground,
    borderRadius: Radius.card,
    gap: 12
  },
  permissionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightBackground,
    borderRadius: Radius.button,
    paddingHorizontal: 16,
    height: 56
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary
  },
  optionsContainer: {
    gap: 12
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: Radius.button,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.lightBackground
  },
  optionButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}15`
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center'
  },
  optionTextActive: {
    color: Colors.primary
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12
  },
  roleCard: {
    flex: 1,
    padding: 20,
    borderRadius: Radius.card,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.lightBackground,
    alignItems: 'center'
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}15`
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 4
  },
  roleTextActive: {
    color: Colors.primary
  },
  roleDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center'
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: Radius.button,
    gap: 8,
    ...Shadows.soft
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textLight
  }
});
