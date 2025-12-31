import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, Modal } from 'react-native';
import * as Location from 'expo-location';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { useSessionStore } from '../../store/session';
import { fetchTrips, fetchVehicles, fetchInvoices, fetchNotifications } from '../../services/dataService';
import { FIREBASE_FEATURES } from '../../config/featureFlags';
import { authService } from '../../services/authService';
import { fetchOrganizations, createOrganization } from '../../services/firebaseService';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const AuthFlow: React.FC = () => {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [orgId, setOrgId] = useState('org1');
  const [role, setRole] = useState<'Driver' | 'Fleet'>('Driver');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [organizations, setOrganizations] = useState<Array<{id: string; name: string}>>([]);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  
  const setLoggedIn = useSessionStore((s) => s.setLoggedIn);
  const setUserId = useSessionStore((s) => s.setUserId);
  const setPhoneNumber = useSessionStore((s) => s.setPhoneNumber);
  const setAuthExpiry = useSessionStore((s) => s.setAuthExpiry);
  const setOrg = useSessionStore((s) => s.setOrg);
  const setBranch = useSessionStore((s) => s.setBranch);
  const setRoleStore = useSessionStore((s) => s.setRole);

  const steps = ['Welcome', 'Permissions', 'Login', 'OTP', 'Organization', 'Role'];

  // Load organizations when step 4 is reached
  useEffect(() => {
    if (step === 4 && organizations.length === 0) {
      loadOrganizations();
    }
  }, [step]);

  const loadOrganizations = async () => {
    try {
      const orgs = await fetchOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error('Error loading organizations:', error);
      Alert.alert('Error', 'Failed to load organizations');
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      Alert.alert('Error', 'Please enter an organization name');
      return;
    }
    
    setLoading(true);
    try {
      const newOrg = await createOrganization(newOrgName.trim());
      setOrganizations([...organizations, newOrg]);
      setOrgId(newOrg.id);
      setNewOrgName('');
      setShowCreateOrg(false);
      Alert.alert('Success', 'Organization created successfully');
    } catch (error) {
      console.error('Error creating organization:', error);
      Alert.alert('Error', 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        Alert.alert('Success', 'Location access granted');
      } else {
        Alert.alert('Permission Denied', 'Location access is optional but recommended for better tracking');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const requestNotificationPermission = async () => {
    // Notification permissions temporarily disabled
    setNotificationGranted(true);
    Alert.alert('Skipped', 'Notification permissions are optional and can be configured later');
  };

  const next = async () => {
    setError('');
    
    // Step 2: Send OTP
    if (step === 2) {
      if (!phone || phone.length < 10) {
        setError('Please enter a valid phone number');
        return;
      }
      
      setLoading(true);
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone}`;
      const result = await authService.sendOTP(formattedPhone);
      setLoading(false);
      
      if (!result.success) {
        setError(result.error || 'Failed to send OTP');
        Alert.alert('Error', result.error || 'Failed to send OTP');
        return;
      }
      
      Alert.alert('Success', 'OTP sent to your phone');
      setStep((s) => s + 1);
      return;
    }
    
    // Step 3: Verify OTP
    if (step === 3) {
      if (!otp || otp.length !== 6) {
        setError('Please enter the 6-digit OTP');
        return;
      }
      
      setLoading(true);
      const result = await authService.verifyOTP(otp);
      setLoading(false);
      
      if (!result.success) {
        setError(result.error || 'Invalid OTP');
        Alert.alert('Error', result.error || 'Invalid OTP');
        return;
      }
      
      // Store user info
      if (result.user) {
        setUserId(result.user.uid);
        setPhoneNumber(result.user.phoneNumber || phone);
        const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
        setAuthExpiry(expiry);
      }
      
      setStep((s) => s + 1);
      return;
    }
    
    // Final step: Complete onboarding
    if (step === steps.length - 1) {
      setLoading(true);
      try {
        // Update user profile in Firestore with org and role
        const userId = useSessionStore.getState().userId;
        if (userId) {
          await authService.updateUserOrgAndRole(
            userId,
            orgId, // Use selected org ID
            role
          );
        }
        
        // Find selected org name
        const selectedOrg = organizations.find(org => org.id === orgId);
        setOrg({ id: orgId, name: selectedOrg?.name || 'Organization' });
        setBranch({ id: 'default', name: 'Main Branch', orgId: orgId });
        setRoleStore(role);
        setLoggedIn(true);
      } catch (error) {
        console.error('Error completing onboarding:', error);
        Alert.alert('Error', 'Failed to complete registration. Please try again.');
      } finally {
        setLoading(false);
      }
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
                <Text style={styles.permissionDescription}>
                  Grant optional permissions for a better experience
                </Text>
                
                <TouchableOpacity 
                  style={styles.permissionItem}
                  onPress={requestLocationPermission}
                  disabled={locationGranted}
                >
                  <Icon name="map-marker" size={24} color={Colors.primary} />
                  <View style={styles.permissionContent}>
                    <Text style={styles.permissionText}>Location Access</Text>
                    <Text style={styles.permissionSubtext}>For real-time tracking</Text>
                  </View>
                  {locationGranted ? (
                    <Icon name="check-circle" size={24} color={Colors.success} />
                  ) : (
                    <Icon name="chevron-right" size={24} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.permissionItem}
                  onPress={requestNotificationPermission}
                  disabled={notificationGranted}
                >
                  <Icon name="bell" size={24} color={Colors.primary} />
                  <View style={styles.permissionContent}>
                    <Text style={styles.permissionText}>Notifications</Text>
                    <Text style={styles.permissionSubtext}>For important updates</Text>
                  </View>
                  {notificationGranted ? (
                    <Icon name="check-circle" size={24} color={Colors.success} />
                  ) : (
                    <Icon name="chevron-right" size={24} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
                
                <Text style={styles.skipText}>
                  Both permissions are optional. You can continue without granting them.
                </Text>
              </View>
            )}

            {step === 2 && (
              <>
                <View style={styles.inputContainer}>
                  <Icon name="phone" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Phone Number (e.g., +1234567890)"
                    placeholderTextColor={Colors.textSecondary}
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    keyboardType="phone-pad"
                    editable={!loading}
                  />
                </View>
                {error && <Text style={styles.errorText}>{error}</Text>}
              </>
            )}

            {step === 3 && (
              <>
                <Text style={styles.otpHint}>
                  📱 For testing, use OTP: <Text style={styles.otpCode}>123456</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor={Colors.textSecondary}
                    value={otp}
                    onChangeText={setOtp}
                    style={styles.input}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />
                </View>
                {error && <Text style={styles.errorText}>{error}</Text>}
              </>
            )}

            {step === 4 && (
              <View style={styles.optionsContainer}>
                {organizations.length === 0 ? (
                  <ActivityIndicator size="large" color={Colors.primary} />
                ) : (
                  <>
                    {organizations.map((org) => (
                      <TouchableOpacity
                        key={org.id}
                        style={[styles.optionButton, orgId === org.id && styles.optionButtonActive]}
                        onPress={() => setOrgId(org.id)}
                      >
                        <Text style={[styles.optionText, orgId === org.id && styles.optionTextActive]}>
                          {org.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.createNewButton}
                      onPress={() => setShowCreateOrg(true)}
                    >
                      <Icon name="plus-circle" size={20} color={Colors.primary} />
                      <Text style={styles.createNewText}>Create New Organization</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {step === 5 && (
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

          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
            onPress={next}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textLight} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>
                  {step === steps.length - 1 ? 'Get Started' : 'Continue'}
                </Text>
                <Icon name="arrow-right" size={20} color={Colors.textLight} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Create Organization Modal */}
        <Modal
          visible={showCreateOrg}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCreateOrg(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Organization</Text>
                <TouchableOpacity onPress={() => setShowCreateOrg(false)}>
                  <Icon name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Icon name="office-building" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Organization Name"
                  placeholderTextColor={Colors.textSecondary}
                  value={newOrgName}
                  onChangeText={setNewOrgName}
                  style={styles.input}
                  editable={!loading}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowCreateOrg(false)}
                  disabled={loading}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveButton, loading && styles.primaryButtonDisabled]}
                  onPress={handleCreateOrganization}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.textLight} size="small" />
                  ) : (
                    <Text style={styles.modalSaveText}>Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  permissionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.lightBackground,
    borderRadius: Radius.card,
    gap: 12
  },
  permissionContent: {
    flex: 1
  },
  permissionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  permissionSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  skipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic'
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
  primaryButtonDisabled: {
    opacity: 0.6
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textLight
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center'
  },
  otpHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: `${Colors.primary}15`,
    padding: 12,
    borderRadius: Radius.button
  },
  otpCode: {
    fontWeight: '800',
    color: Colors.primary,
    fontSize: 16
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: Radius.button,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.lightBackground,
    gap: 8,
    marginTop: 8
  },
  createNewText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg
  },
  modalContent: {
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.cardLarge,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...Shadows.card
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.button,
    backgroundColor: Colors.lightBackground,
    alignItems: 'center'
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.button,
    backgroundColor: Colors.primary,
    alignItems: 'center'
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textLight
  }
});
