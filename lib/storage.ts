import { Platform } from "react-native";
import type { StateStorage } from "zustand/middleware";

/**
 * Platform-aware storage adapter for Zustand persist middleware.
 *
 * - iOS / Android → expo-secure-store (encrypted keychain / keystore)
 * - Web           → window.localStorage (no secure alternative exists)
 *
 * expo-secure-store is imported dynamically so the web bundle never
 * references native modules that would crash at runtime.
 */

let SecureStore: typeof import("expo-secure-store") | null = null;

if (Platform.OS !== "web") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SecureStore = require("expo-secure-store");
}

export const appStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(name);
    }
    const value = await SecureStore!.getItemAsync(name);
    return value ?? null;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(name, value);
      return;
    }
    await SecureStore!.setItemAsync(name, value);
  },

  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(name);
      return;
    }
    await SecureStore!.deleteItemAsync(name);
  },
};
