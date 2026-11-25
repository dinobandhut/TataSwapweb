import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

export const OWNER_ADMIN_EMAIL = 'dinobandhu8158@gmail.com';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signingIn: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatAuthError(err: unknown): { message: string; isCancellation: boolean } {
  const code = (err as { code?: string })?.code || '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return {
      message: 'Google sign-in popup was closed before completing. Please try again and finish selecting your account.',
      isCancellation: true,
    };
  }
  if (code === 'auth/popup-blocked') {
    return {
      message: 'Sign-in popup was blocked by your browser. Allow popups for this site or open TataSwap in a regular browser tab.',
      isCancellation: false,
    };
  }
  if (code === 'auth/unauthorized-domain') {
    return {
      message: 'This domain is not listed under Firebase Authentication Authorized Domains yet.',
      isCancellation: false,
    };
  }
  return {
    message: err instanceof Error ? err.message : 'Google sign-in failed.',
    isCancellation: false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const inFlightPopupRef = useRef<Promise<User | null> | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isAdmin = Boolean(
    user?.email &&
      user.emailVerified &&
      user.email.trim().toLowerCase() === OWNER_ADMIN_EMAIL
  );

  const signInWithGoogle = async (): Promise<User | null> => {
    if (inFlightPopupRef.current) {
      return inFlightPopupRef.current;
    }

    setAuthError(null);
    setSigningIn(true);

    const run = (async () => {
      try {
        await auth.authStateReady();
        const credential = await signInWithPopup(auth, googleAuthProvider);
        setUser(credential.user);
        return credential.user;
      } catch (err: unknown) {
        const formatted = formatAuthError(err);
        setAuthError(formatted.message);
        return null;
      } finally {
        inFlightPopupRef.current = null;
        setSigningIn(false);
      }
    })();

    inFlightPopupRef.current = run;
    return run;
  };

  const logout = async () => {
    setAuthError(null);
    await signOut(auth);
  };

  const getIdToken = async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        signingIn,
        authError,
        clearAuthError: () => setAuthError(null),
        signInWithGoogle,
        logout,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
