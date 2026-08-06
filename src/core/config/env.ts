const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
export class EnvironmentConfigurationError extends Error { constructor(message: string) { super(message); this.name = 'EnvironmentConfigurationError'; } }
export type Environment = { apiUrl: string }; export type EnvironmentOptions = { apiUrl?: string; isProduction?: boolean };
export function getEnvironment({ apiUrl = configuredApiUrl, isProduction = process.env.NODE_ENV === 'production' }: EnvironmentOptions = {}): Environment {
  if (!apiUrl?.trim()) throw new EnvironmentConfigurationError('EXPO_PUBLIC_API_URL must be configured.');
  let parsed: URL; try { parsed = new URL(apiUrl); } catch { throw new EnvironmentConfigurationError('EXPO_PUBLIC_API_URL must be an absolute URL.'); }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new EnvironmentConfigurationError('EXPO_PUBLIC_API_URL must use http or https.');
  if (isProduction && parsed.protocol !== 'https:') throw new EnvironmentConfigurationError('EXPO_PUBLIC_API_URL must use HTTPS in production.');
  return { apiUrl: parsed.toString().replace(/\/+$/, '') };
}