import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/design-system/theme';
export default function RootLayout() { return <ThemeProvider><StatusBar style="auto" /><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(public)" /><Stack.Protected guard={false}><Stack.Screen name="(onboarding)" /><Stack.Screen name="(protected)" /><Stack.Screen name="(workflow)" /></Stack.Protected></Stack></ThemeProvider>; }