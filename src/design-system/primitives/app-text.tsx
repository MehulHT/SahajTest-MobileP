import { type ComponentProps, type ReactNode } from 'react';
import { Text } from 'react-native';
import { useTheme } from '../theme';
import type { TypographyVariant } from '../tokens';
type AppTextColor = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'error';
export type AppTextProps = ComponentProps<typeof Text> & { children: ReactNode; variant?: TypographyVariant; color?: AppTextColor };
export function AppText({ children, variant = 'body', color = 'primary', allowFontScaling, style, ...props }: AppTextProps) {
  const theme = useTheme();
  const colorValue = { primary: theme.colors.textPrimary, secondary: theme.colors.textSecondary, tertiary: theme.colors.textTertiary, accent: theme.colors.primary, error: theme.colors.error }[color];
  return <Text allowFontScaling={allowFontScaling ?? true} style={[theme.typography[variant], { color: colorValue }, style]} {...props}>{children}</Text>;
}