import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '@/lib/storage';

const AUTH_STORAGE_KEY = 'neighborhood-auth';

interface AuthSession {
  token: string;
  refreshToken: string;
  userId?: string;
  email?: string;
  role?: string;
  isAdmin?: boolean;
  condominioId?: string;
  condominioName?: string;
  nombre?: string;
  apellido?: string;
  apartmentId?: string | null;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  email: string | null;
  role: string | null;
  isAdmin: boolean;
  condominioId: string | null;
  condominioName: string | null;
  nombre: string | null;
  apellido: string | null;
  apartmentId: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  emailTemp: string;
  // Disguise (impersonation) state
  isDisguised: boolean;
  originalSession: AuthSession | null;
  setEmailTemp: (email: string) => void;
  login: (session: AuthSession) => void;
  updateSession: (session: AuthSession) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
  startDisguise: (session: AuthSession) => void;
  endDisguise: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      userId: null,
      email: null,
      role: null,
      isAdmin: false,
      condominioId: null,
      condominioName: null,
      nombre: null,
      apellido: null,
      apartmentId: null,
      isAuthenticated: false,
      hasHydrated: false,
      emailTemp: '',
      isDisguised: false,
      originalSession: null,
      setEmailTemp: (email) => set({ emailTemp: email }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      login: (session) =>
        set({
          token: session.token,
          refreshToken: session.refreshToken,
          userId: session.userId ?? null,
          email: session.email ?? null,
          role: session.role ?? null,
          isAdmin: Boolean(session.isAdmin),
          condominioId: session.condominioId ?? null,
          condominioName: session.condominioName ?? null,
          nombre: session.nombre ?? null,
          apellido: session.apellido ?? null,
          apartmentId: session.apartmentId ?? null,
          isAuthenticated: true,
        }),
      updateSession: (session) =>
        set((state) => ({
          token: session.token,
          refreshToken: session.refreshToken,
          userId: session.userId ?? state.userId,
          email: session.email ?? state.email,
          role: session.role ?? state.role,
          isAdmin: typeof session.isAdmin === 'boolean' ? session.isAdmin : state.isAdmin,
          condominioId: session.condominioId ?? state.condominioId,
          condominioName: session.condominioName ?? state.condominioName,
          nombre: session.nombre ?? state.nombre,
          apellido: session.apellido ?? state.apellido,
          apartmentId: session.apartmentId !== undefined ? (session.apartmentId ?? null) : state.apartmentId,
          isAuthenticated: true,
        })),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          userId: null,
          email: null,
          role: null,
          isAdmin: false,
          condominioId: null,
          condominioName: null,
          nombre: null,
          apellido: null,
          apartmentId: null,
          isAuthenticated: false,
          emailTemp: '',
          isDisguised: false,
          originalSession: null,
        }),
      startDisguise: (session) => {
        const state = get();
        // Save current session before switching
        const original: AuthSession = {
          token: state.token!,
          refreshToken: state.refreshToken!,
          userId: state.userId ?? undefined,
          email: state.email ?? undefined,
          role: state.role ?? undefined,
          isAdmin: state.isAdmin,
          condominioId: state.condominioId ?? undefined,
          condominioName: state.condominioName ?? undefined,
          nombre: state.nombre ?? undefined,
          apellido: state.apellido ?? undefined,
          apartmentId: state.apartmentId,
        };
        set({
          token: session.token,
          refreshToken: session.refreshToken,
          userId: session.userId ?? state.userId,
          email: session.email ?? state.email,
          role: session.role ?? state.role,
          isAdmin: Boolean(session.isAdmin),
          condominioId: session.condominioId ?? null,
          condominioName: session.condominioName ?? null,
          nombre: session.nombre ?? state.nombre,
          apellido: session.apellido ?? state.apellido,
          apartmentId: session.apartmentId ?? null,
          isDisguised: true,
          originalSession: original,
        });
      },
      endDisguise: () => {
        const state = get();
        const original = state.originalSession;
        if (!original) return;
        set({
          token: original.token,
          refreshToken: original.refreshToken,
          userId: original.userId ?? null,
          email: original.email ?? null,
          role: original.role ?? null,
          isAdmin: Boolean(original.isAdmin),
          condominioId: original.condominioId ?? null,
          condominioName: original.condominioName ?? null,
          nombre: original.nombre ?? null,
          apellido: original.apellido ?? null,
          apartmentId: original.apartmentId ?? null,
          isDisguised: false,
          originalSession: null,
        });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => appStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        userId: state.userId,
        email: state.email,
        role: state.role,
        isAdmin: state.isAdmin,
        condominioId: state.condominioId,
        condominioName: state.condominioName,
        nombre: state.nombre,
        apellido: state.apellido,
        apartmentId: state.apartmentId,
        isAuthenticated: state.isAuthenticated,
        isDisguised: state.isDisguised,
        originalSession: state.originalSession,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
