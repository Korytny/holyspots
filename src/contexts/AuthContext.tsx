import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '../types/models';
import { Session } from '@supabase/supabase-js';
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  addFavorite: (itemId: string, itemType: 'city' | 'point' | 'route' | 'event') => Promise<void>;
  removeFavorite: (itemId: string, itemType: 'city' | 'point' | 'route' | 'event') => Promise<void>;
  isFavorite: (itemId: string, itemType: 'city' | 'point' | 'route' | 'event') => boolean;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  const fetchUserFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('item_id, item_type')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }
      
      if (data && user) {
        const favorites = {
          cities: [] as string[],
          points: [] as string[],
          routes: [] as string[],
          events: [] as string[]
        };
        
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
        
        setUser(prev => prev ? { ...prev, favorites } : null);
      }
    } catch (error) {
      console.error('Error in fetchUserFavorites:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        console.log("Initializing auth context...");
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log("Auth state changed:", event, currentSession ? "Session exists" : "No session");
            
            if (currentSession?.user) {
              console.log("User authenticated:", currentSession.user.id);
              setSession(currentSession);
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
              
              if (event !== 'INITIAL_SESSION') {
                setTimeout(() => {
                  fetchUserFavorites(appUser.id);
                }, 0);
              }
            } else {
              console.log("No user in session, clearing state");
              setUser(null);
              setSession(null);
            }
            
            setIsLoading(false);
          }
        );
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setIsLoading(false);
          return;
        }
        
        if (sessionData?.session?.user) {
          console.log("Session found on initialization:", sessionData.session.user.id);
          setSession(sessionData.session);
          const appUser: User = {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email || '',
            name: sessionData.session.user.user_metadata?.name || 
                  sessionData.session.user.user_metadata?.full_name || 
                  'User',
            avatarUrl: sessionData.session.user.user_metadata?.avatar_url || 
                       sessionData.session.user.user_metadata?.picture,
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
          
          await fetchUserFavorites(appUser.id);
        } else {
          console.log("No session found on initialization");
        }
        
        setIsLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token') || hash.includes('error='))) {
        window.history.replaceState(null, document.title, window.location.pathname);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const addFavorite = async (itemId: string, itemType: 'city' | 'point' | 'route' | 'event') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add favorites",
        variant: "destructive"
      });
      return;
    }

    try {
      const dbItemType = itemType === 'point' ? 'spot' : itemType;
      
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          item_id: itemId,
          item_type: dbItemType
        });
      
      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already in favorites",
            description: "This item is already in your favorites",
          });
        } else {
          throw error;
        }
      } else {
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
    }
  };

  const removeFavorite = async (itemId: string, itemType: 'city' | 'point' | 'route' | 'event') => {
    if (!user) return;
    
    try {
      const dbItemType = itemType === 'point' ? 'spot' : itemType;
      
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', dbItemType);
      
      if (error) throw error;
      
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
    }
  };

  const isFavorite = (itemId: string, itemType: 'city' | 'point' | 'route' | 'event'): boolean => {
    if (!user || !user.favorites) return false;
    
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
      const currentUrl = window.location.origin;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${currentUrl}/cities`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
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

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking auth status:", error);
        return false;
      }
      
      if (currentSession && currentSession.user) {
        console.log("Auth status check: User is authenticated");
        
        if (!session || session.user.id !== currentSession.user.id) {
          setSession(currentSession);
          
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
          
          if (!user || user.id !== appUser.id) {
            setTimeout(() => {
              fetchUserFavorites(appUser.id);
            }, 0);
          }
        }
        
        return true;
      } else {
        console.log("Auth status check: User is not authenticated");
        
        if (session || user) {
          setSession(null);
          setUser(null);
        }
        
        return false;
      }
    } catch (error) {
      console.error("Exception in checkAuthStatus:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !!session,
        signIn,
        signUp,
        signOut,
        googleSignIn,
        addFavorite,
        removeFavorite,
        isFavorite,
        checkAuthStatus
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
