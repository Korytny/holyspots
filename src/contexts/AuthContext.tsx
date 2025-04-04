import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '../types/models';
import { Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  appleSignIn: () => Promise<void>;
  addFavorite: (itemId: string, itemType: 'city' | 'point' | 'route' | 'event') => Promise<void>;
  removeFavorite: (itemId: string, itemType: 'city' | 'point' | 'route' | 'event') => Promise<void>;
  isFavorite: (itemId: string, itemType: 'city' | 'point' | 'route' | 'event') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  // Fetch user favorites from Supabase
  const fetchUserFavorites = async (userId: string) => {
    try {
      console.log("Fetching favorites for user:", userId);
      const { data, error } = await supabase
        .from('user_favorites')
        .select('item_id, item_type')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }
      
      if (data && user) {
        // Process and organize favorites by type
        const favorites = {
          cities: [] as string[],
          points: [] as string[],
          routes: [] as string[],
          events: [] as string[]
        };
        
        console.log("Favorites data from DB:", data);
        
        data.forEach(fav => {
          switch (fav.item_type) {
            case 'city':
              favorites.cities.push(fav.item_id);
              break;
            case 'spot':
              favorites.points.push(fav.item_id);
              break;
            case 'route':
              favorites.routes.push(fav.item_id);
              break;
            case 'event':
              favorites.events.push(fav.item_id);
              break;
          }
        });
        
        console.log("Processed favorites:", favorites);
        
        // Update user with favorites - ensure we're not overwriting other user data
        setUser(prev => prev ? { ...prev, favorites } : null);
      }
    } catch (error) {
      console.error('Error in fetchUserFavorites:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Convert Supabase user to our User model
          const appUser: User = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            name: currentSession.user.user_metadata?.name || 
                  currentSession.user.user_metadata?.full_name || 
                  'User',
            avatarUrl: currentSession.user.user_metadata?.avatar_url || 
                       currentSession.user.user_metadata?.picture,
            favorites: {
              cities: [],
              points: [],
              routes: [],
              events: []
            },
            ownedPoints: [],
            ownedEvents: []
          };
          
          setUser(appUser);
          
          // We fetch additional user data from our database
          // Using setTimeout to avoid potential auth deadlocks
          setTimeout(() => {
            fetchUserFavorites(appUser.id);
          }, 0);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      
      if (initialSession?.user) {
        // Convert Supabase user to our User model
        const appUser: User = {
          id: initialSession.user.id,
          email: initialSession.user.email || '',
          name: initialSession.user.user_metadata?.name || 
                initialSession.user.user_metadata?.full_name || 
                'User',
          avatarUrl: initialSession.user.user_metadata?.avatar_url || 
                     initialSession.user.user_metadata?.picture,
          favorites: {
            cities: [],
            points: [],
            routes: [],
            events: []
          },
          ownedPoints: [],
          ownedEvents: []
        };
        
        setUser(appUser);
        
        // Fetch user favorites
        setTimeout(() => {
          fetchUserFavorites(appUser.id);
        }, 0);
      }
      
      setIsLoading(false);
    });

    // Check for hash fragment in URL (for OAuth redirects)
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // Clear the hash from the URL without reloading
        window.history.replaceState(null, document.title, window.location.pathname);
      }
    };

    // Handle hash on initial load
    handleHashChange();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add an item to favorites
  const addFavorite = async (itemId: string, itemType: 'city' | 'point' | 'route' | 'event') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add favorites",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Map 'point' to 'spot' for database consistency
      const dbItemType = itemType === 'point' ? 'spot' : itemType;
      
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          item_id: itemId,
          item_type: dbItemType
        });
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: "Already in favorites",
            description: "This item is already in your favorites",
          });
        } else {
          throw error;
        }
      } else {
        // Update local state
        setUser(prev => {
          if (!prev) return null;
          
          const updatedFavorites = { ...prev.favorites };
          
          switch (itemType) {
            case 'city':
              updatedFavorites.cities = [...updatedFavorites.cities, itemId];
              break;
            case 'point':
              updatedFavorites.points = [...updatedFavorites.points, itemId];
              break;
            case 'route':
              updatedFavorites.routes = [...updatedFavorites.routes, itemId];
              break;
            case 'event':
              updatedFavorites.events = [...updatedFavorites.events, itemId];
              break;
          }
          
          return {
            ...prev,
            favorites: updatedFavorites
          };
        });
        
        toast({
          title: "Added to favorites",
          description: "Item has been added to your favorites",
        });
      }
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      toast({
        title: "Failed to add favorite",
        description: error.message || "An error occurred while adding to favorites",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove an item from favorites
  const removeFavorite = async (itemId: string, itemType: 'city' | 'point' | 'route' | 'event') => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Map 'point' to 'spot' for database consistency
      const dbItemType = itemType === 'point' ? 'spot' : itemType;
      
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', dbItemType);
      
      if (error) throw error;
      
      // Update local state
      setUser(prev => {
        if (!prev) return null;
        
        const updatedFavorites = { ...prev.favorites };
        
        switch (itemType) {
          case 'city':
            updatedFavorites.cities = updatedFavorites.cities.filter(id => id !== itemId);
            break;
          case 'point':
            updatedFavorites.points = updatedFavorites.points.filter(id => id !== itemId);
            break;
          case 'route':
            updatedFavorites.routes = updatedFavorites.routes.filter(id => id !== itemId);
            break;
          case 'event':
            updatedFavorites.events = updatedFavorites.events.filter(id => id !== itemId);
            break;
        }
        
        return {
          ...prev,
          favorites: updatedFavorites
        };
      });
      
      toast({
        title: "Removed from favorites",
        description: "Item has been removed from your favorites",
      });
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Failed to remove favorite",
        description: error.message || "An error occurred while removing from favorites",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if an item is in favorites
  const isFavorite = (itemId: string, itemType: 'city' | 'point' | 'route' | 'event'): boolean => {
    if (!user) return false;
    
    switch (itemType) {
      case 'city':
        return user.favorites.cities.includes(itemId);
      case 'point':
        return user.favorites.points.includes(itemId);
      case 'route':
        return user.favorites.routes.includes(itemId);
      case 'event':
        return user.favorites.events.includes(itemId);
      default:
        return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "Failed to sign up. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive" 
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth'
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "Google sign in failed",
        description: error.message || "Failed to sign in with Google. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const appleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin + '/auth'
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      toast({
        title: "Apple sign in failed",
        description: error.message || "Failed to sign in with Apple. Please try again.",
        variant: "destructive"
      });
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
        appleSignIn,
        addFavorite,
        removeFavorite,
        isFavorite
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
