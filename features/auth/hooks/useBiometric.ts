import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// ── Storage keys ─────────────────────────────────────────────────────────────
const ENABLED_KEY       = 'nbhd_bio_enabled';
const EMAIL_KEY         = 'nbhd_bio_email';
const REFRESH_TOKEN_KEY = 'nbhd_bio_rt';

// ── Types ─────────────────────────────────────────────────────────────────────
export type BiometricType = 'face' | 'fingerprint' | 'none';

// ── Hardware detection ────────────────────────────────────────────────────────

/** Returns true if the device has biometric hardware AND the user has enrolled. */
export async function isBiometricHardwareAvailable(): Promise<boolean> {
  try {
    const [hasHw, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    return hasHw && enrolled;
  } catch {
    return false;
  }
}

/** Returns the most capable biometric type available on the device. */
export async function getBiometricType(): Promise<BiometricType> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'face';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'fingerprint';
    }
    return 'none';
  } catch {
    return 'none';
  }
}

// ── Preference management ─────────────────────────────────────────────────────

/** Whether the user has opted in to biometric login (any account). */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(ENABLED_KEY)) === 'true';
  } catch {
    return false;
  }
}

/**
 * Whether biometric login is enabled for this specific email.
 * This is the security check — prevents cross-account biometric access.
 */
export async function isBiometricEnabledForEmail(email: string): Promise<boolean> {
  try {
    if ((await SecureStore.getItemAsync(ENABLED_KEY)) !== 'true') return false;
    const stored = await SecureStore.getItemAsync(EMAIL_KEY);
    return stored?.toLowerCase().trim() === email.toLowerCase().trim();
  } catch {
    return false;
  }
}

/** Returns the email address for which biometric login is currently stored. */
export async function getBiometricEmail(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(EMAIL_KEY);
  } catch {
    return null;
  }
}

/**
 * Enable biometric login for a specific account.
 * Stores the email alongside the refresh token so only the right
 * account gets biometric access on this device.
 */
export async function enableBiometric(email: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(ENABLED_KEY, 'true');
  await SecureStore.setItemAsync(EMAIL_KEY, email.toLowerCase().trim());
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Disable biometric login and erase all stored credentials.
 */
export async function disableBiometric(): Promise<void> {
  await SecureStore.deleteItemAsync(ENABLED_KEY);
  await SecureStore.deleteItemAsync(EMAIL_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

/**
 * Keep the stored refresh token up to date after a token rotation.
 * No-op if biometric is disabled.
 */
export async function syncBiometricRefreshToken(refreshToken: string): Promise<void> {
  try {
    if ((await SecureStore.getItemAsync(ENABLED_KEY)) === 'true') {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch {
    // Non-critical — biometric login will fail gracefully next time
  }
}

/**
 * Retrieve the refresh token stored for biometric login.
 * Returns null if biometric is disabled or the token was not found.
 */
export async function getBiometricRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

// ── Prompt ────────────────────────────────────────────────────────────────────

/**
 * Show the native biometric prompt.
 * Returns the raw result so callers can distinguish success / user-cancel / hardware failure.
 *
 * result.success === true                              → authenticated
 * result.error === 'user_cancel' | 'system_cancel'    → dismissed intentionally
 * anything else                                        → hardware/permission problem
 */
export async function promptBiometric(
  type: BiometricType,
): Promise<LocalAuthentication.LocalAuthenticationResult> {
  const promptMessage =
    type === 'face'
      ? 'Usa Face ID para ingresar'
      : 'Usa tu huella digital para ingresar';

  return LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancelar',
    // Disable system passcode fallback — the app's own PIN screen is the fallback
    disableDeviceFallback: true,
  });
}
