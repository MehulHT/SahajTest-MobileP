import { type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, type StyleProp, type ViewStyle, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
export type ScreenProps = PropsWithChildren<{ scroll?: boolean; keyboardAware?: boolean; style?: StyleProp<ViewStyle>; contentContainerStyle?: StyleProp<ViewStyle>; testID?: string }>;
export function Screen({ children, scroll = false, keyboardAware = false, style, contentContainerStyle, testID }: ScreenProps) {
  const theme = useTheme(); const contentStyle = [{ flexGrow: 1, paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[6] }, contentContainerStyle];
  const content = scroll ? <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">{children}</ScrollView> : <View style={contentStyle}>{children}</View>;
  return <SafeAreaView testID={testID} style={[{ flex: 1, backgroundColor: theme.colors.canvas }, style]}>{keyboardAware ? <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={{ flex: 1 }}>{content}</KeyboardAvoidingView> : content}</SafeAreaView>;
}