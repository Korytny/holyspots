
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types/models';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  appleSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Add actual auth check with Supabase
    // This is a placeholder for now
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Mock auth check - replace with actual Supabase auth check
        const storedUser = localStorage.getItem('holyWandererUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Supabase auth
      // Mock authentication
      const mockUser: User = {
        id: 'user123',
        email,
        name: 'Demo User',
        favorites: {
          cities: [],
          points: [],
          routes: [],
          events: []
        },
        ownedPoints: [],
        ownedEvents: []
      };
      
      setUser(mockUser);
      localStorage.setItem('holyWandererUser', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Supabase auth
      // Mock sign up
      const mockUser: User = {
        id: 'user123',
        email,
        name: name || 'New User',
        favorites: {
          cities: [],
          points: [],
          routes: [],
          events: []
        },
        ownedPoints: [],
        ownedEvents: []
      };
      
      setUser(mockUser);
      localStorage.setItem('holyWandererUser', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Supabase auth
      setUser(null);
      localStorage.removeItem('holyWandererUser');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Supabase auth with Google
      // Mock authentication
      const mockUser: User = {
        id: 'google_user123',
        email: 'google_user@example.com',
        name: 'Google User',
        avatarUrl: 'https://via.placeholder.com/150',
        favorites: {
          cities: [],
          points: [],
          routes: [],
          events: []
        },
        ownedPoints: [],
        ownedEvents: []
      };
      
      setUser(mockUser);
      localStorage.setItem('holyWandererUser', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const appleSignIn = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Supabase auth with Apple
      // Mock authentication
      const mockUser: User = {
        id: 'apple_user123',
        email: 'apple_user@example.com',
        name: 'Apple User',
        favorites: {
          cities: [],
          points: [],
          routes: [],
          events: []
        },
        ownedPoints: [],
        ownedEvents: []
      };
      
      setUser(mockUser);
      localStorage.setItem('holyWandererUser', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        googleSignIn,
        appleSignIn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
