import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/api';

interface Caregiver {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

interface AuthContextType {
  caregiver: Caregiver | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('carelink_token');
      const storedCaregiver = localStorage.getItem('carelink_caregiver');
      if (storedToken && storedCaregiver) {
        setToken(storedToken);
        setCaregiver(JSON.parse(storedCaregiver));
      }
    } catch (e) {
      console.error('Auth load error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password);
    const { token: t, caregiver: c } = res.data;
    localStorage.setItem('carelink_token', t);
    localStorage.setItem('carelink_caregiver', JSON.stringify(c));
    setToken(t);
    setCaregiver(c);

    // Web push notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  async function register(data: { name: string; email: string; password: string; phone?: string }) {
    const res = await authApi.register(data);
    const { token: t, caregiver: c } = res.data;
    localStorage.setItem('carelink_token', t);
    localStorage.setItem('carelink_caregiver', JSON.stringify(c));
    setToken(t);
    setCaregiver(c);
  }

  async function logout() {
    localStorage.removeItem('carelink_token');
    localStorage.removeItem('carelink_caregiver');
    setToken(null);
    setCaregiver(null);
  }

  return (
    <AuthContext.Provider value={{ caregiver, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
