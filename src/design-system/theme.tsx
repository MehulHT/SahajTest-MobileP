import { createContext, type PropsWithChildren, useContext } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { darkColors, lightColors, radius, spacing, typography, type ColorTheme } from './tokens';
export type SahajTheme = { colorScheme: 'light' | 'dark'; colors: ColorTheme; spacing: typeof spacing; radius: typeof radius; typography: typeof typography };
const lightTheme: SahajTheme = { colorScheme: 'light', colors: lightColors, spacing, radius, typography };
const darkTheme: SahajTheme = { colorScheme: 'dark', colors: darkColors, spacing, radius, typography };
const ThemeContext = createContext<SahajTheme>(lightTheme);
export function ThemeProvider({ children }: PropsWithChildren) { const colorScheme = useColorScheme(); return <ThemeContext.Provider value={colorScheme === 'dark' ? darkTheme : lightTheme}>{children}</ThemeContext.Provider>; }
export function useTheme() { return useContext(ThemeContext); }