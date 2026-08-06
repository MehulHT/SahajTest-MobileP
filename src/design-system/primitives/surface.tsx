import { type PropsWithChildren } from 'react';
import { type StyleProp, type ViewStyle, View } from 'react-native';
import { useTheme } from '../theme';
export type SurfaceProps = PropsWithChildren<{ variant?: 'default' | 'secondary' | 'subtle'; bordered?: boolean; style?: StyleProp<ViewStyle>; testID?: string }>;
export function Surface({ children, variant = 'default', bordered = false, style, testID }: SurfaceProps) {
  const theme = useTheme(); const backgroundColor = { default: theme.colors.surface, secondary: theme.colors.surfaceSecondary, subtle: theme.colors.surfaceSubtle }[variant];
  return <View testID={testID} style={[{ backgroundColor, borderRadius: theme.radius.standard }, bordered && { borderColor: theme.colors.border, borderWidth: 1 }, style]}>{children}</View>;
}