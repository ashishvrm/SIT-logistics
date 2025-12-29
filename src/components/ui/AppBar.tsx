import { Appbar } from 'react-native-paper';
import { Colors } from '../../theme/tokens';
import React from 'react';

interface Props {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const AppBar: React.FC<Props> = ({ title, onBack, actions }) => (
  <Appbar.Header style={{ backgroundColor: Colors.darkSurface }}>
    {onBack && <Appbar.BackAction onPress={onBack} />}
    <Appbar.Content title={title} titleStyle={{ color: 'white', fontWeight: '700' }} />
    {actions}
  </Appbar.Header>
);
