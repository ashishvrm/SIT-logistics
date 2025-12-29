import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { TextInput, Checkbox } from 'react-native-paper';
import { Colors, Spacing } from '../../theme/tokens';
import { PillButton } from '../../components/ui/PillButton';
import { useSessionStore } from '../../store/session';
import { mockApi } from '../../services/mockApi';

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

  const steps = ['Splash', 'Permissions', 'Login', 'OTP', 'Org', 'Branch', 'Role'];

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
    <View style={{ flex: 1, backgroundColor: Colors.darkSurface }}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: '800' }}>Truck Logistics & Live Tracking</Text>
        <Text style={{ color: Colors.textSecondary }}>Step {step + 1}/{steps.length}: {steps[step]}</Text>
        {step === 1 && (
          <View style={{ gap: 8 }}>
            <Text style={{ color: 'white', fontWeight: '700' }}>Permissions</Text>
            <Checkbox.Item label="Location" status="checked" position="leading" />
            <Checkbox.Item label="Notifications" status="checked" position="leading" />
          </View>
        )}
        {step === 2 && (
          <TextInput mode="outlined" label="Phone or Email" value={phone} onChangeText={setPhone} />
        )}
        {step === 3 && <TextInput mode="outlined" label="Enter OTP" value={otp} onChangeText={setOtp} />}
        {step === 4 && (
          <View>
            <Text style={{ color: 'white', marginBottom: 6 }}>Choose Org</Text>
            <PillButton label="Apex Logistics" onPress={() => setOrgId('org1')} mode={orgId === 'org1' ? 'contained' : 'outlined'} />
            <PillButton label="Northlane Freight" onPress={() => setOrgId('org2')} mode={orgId === 'org2' ? 'contained' : 'outlined'} />
          </View>
        )}
        {step === 5 && (
          <View>
            <Text style={{ color: 'white', marginBottom: 6 }}>Choose Branch</Text>
            <PillButton label="Mumbai Hub" onPress={() => setBranchId('b1')} mode={branchId === 'b1' ? 'contained' : 'outlined'} />
            <PillButton label="Delhi Hub" onPress={() => setBranchId('b2')} mode={branchId === 'b2' ? 'contained' : 'outlined'} />
          </View>
        )}
        {step === 6 && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <PillButton label="Driver" onPress={() => setRole('Driver')} mode={role === 'Driver' ? 'contained' : 'outlined'} />
            <PillButton label="Fleet Ops" onPress={() => setRole('Fleet')} mode={role === 'Fleet' ? 'contained' : 'outlined'} />
          </View>
        )}
        <PillButton label={step === steps.length - 1 ? 'Enter App' : 'Next'} onPress={next} />
      </ScrollView>
    </View>
  );
};
