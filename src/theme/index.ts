import { MD3DarkTheme, configureFonts } from 'react-native-paper';
import { Colors, Radius } from './tokens';

const fontConfig = {
  displayMedium: { fontFamily: 'System', fontWeight: '600' as const },
  headlineMedium: { fontFamily: 'System', fontWeight: '600' as const },
  titleMedium: { fontFamily: 'System', fontWeight: '600' as const },
  labelLarge: { fontFamily: 'System', fontWeight: '600' as const }
};

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.lightBackground,
    surface: Colors.lightSurface,
    onSurface: Colors.textPrimary,
    outline: Colors.border,
    secondary: Colors.textSecondary,
    error: Colors.error,
    success: Colors.success
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: Radius.card
};
