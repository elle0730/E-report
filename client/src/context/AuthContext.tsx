import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'resident' | 'admin' | 'super_admin';
  status: 'pending_verification' | 'active' | 'rejected' | 'suspended' | 'archived';
  fullName: string;
  position?: string;
  photoUrl?: string;
  rejectionReason?: string;
  contactNumber?: string;
  houseNumber?: string;
  street?: string;
  barangay?: string;
  helperName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: (allDevices?: boolean) => Promise<void>;
  updateUser: (updatedFields: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('bensican_user');
      if (!saved || saved === 'undefined' || saved === 'null') {
        return null;
      }
      return JSON.parse(saved);
    } catch (err) {
      console.warn('Failed to parse saved user in AuthContext:', err);
      try {
        localStorage.removeItem('bensican_user');
      } catch {}
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('bensican_token');
      if (!saved || saved === 'undefined' || saved === 'null') {
        return null;
      }
      return saved;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (newToken: string, newUser: User, refreshToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem('bensican_token', newToken);
      localStorage.setItem('bensican_user', JSON.stringify(newUser));
      if (refreshToken) {
        localStorage.setItem('bensican_refresh_token', refreshToken);
      }
    } catch (e) {
      console.warn('Failed to save auth to localStorage:', e);
    }
  };

  const logout = async (allDevices = false) => {
    const currentToken = token;
    // 1. Clear all storage immediately so no stale tokens/users are retained
    try {
      localStorage.removeItem('bensican_token');
      localStorage.removeItem('bensican_refresh_token');
      localStorage.removeItem('bensican_user');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }

    // 2. Clear state in memory
    setToken(null);
    setUser(null);

    // 3. Fire backend logout in background without blocking the UI redirection
    if (currentToken) {
      try {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentToken}`
          },
          body: JSON.stringify({ allDevices })
        }).catch((err) => {
          console.log('Logout notice:', err);
        });
      } catch {}
    }

    // 4. Immediately and unconditionally redirect to /login
    window.location.replace('/login');
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updatedFields };
      if (updatedFields.photoUrl === null || updatedFields.photoUrl === '') {
        delete updated.photoUrl;
      }
      setUser(updated);
      localStorage.setItem('bensican_user', JSON.stringify(updated));
    }
  };

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mappedUser: User = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          status: data.user.status,
          fullName: data.user.full_name,
          position: data.user.position,
          photoUrl: data.user.photo_url,
          rejectionReason: data.user.rejection_reason,
          contactNumber: data.user.contact_number,
          houseNumber: data.user.house_number,
          street: data.user.street,
          barangay: data.user.barangay,
          helperName: data.user.helper_name
        };
        setUser(mappedUser);
        localStorage.setItem('bensican_user', JSON.stringify(mappedUser));
      } else {
        // Token invalid or expired
        setToken(null);
        setUser(null);
        localStorage.removeItem('bensican_token');
        localStorage.removeItem('bensican_user');
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

