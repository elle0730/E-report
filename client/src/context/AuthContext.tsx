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
    const saved = localStorage.getItem('bensican_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('bensican_token') || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (newToken: string, newUser: User, refreshToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('bensican_token', newToken);
    localStorage.setItem('bensican_user', JSON.stringify(newUser));
    if (refreshToken) {
      localStorage.setItem('bensican_refresh_token', refreshToken);
    }
  };

  const logout = async (allDevices = false) => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ allDevices })
        });
      }
    } catch (err) {
      console.log('Logout notice:', err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('bensican_token');
      localStorage.removeItem('bensican_refresh_token');
      localStorage.removeItem('bensican_user');
      window.location.replace('/');
    }
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

