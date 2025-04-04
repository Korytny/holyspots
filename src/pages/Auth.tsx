
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FcGoogle } from 'react-icons/fc';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = () => {
  const { t } = useLanguage();
  const { signIn, signUp, googleSignIn, isAuthenticated, isLoading: authLoading, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await checkAuthStatus();
      console.log('Auth page - Authentication state:', isAuth);
      if (isAuth) {
        navigate('/cities');
      }
    };
    
    checkAuth();
    
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, [checkAuthStatus, navigate]);
  
  // Display debug alert for authentication state
  useEffect(() => {
    console.log('Auth component render - isAuthenticated:', isAuthenticated);
  }, [isAuthenticated]);
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      toast({
        title: "Sign in successful",
        description: "You have been signed in successfully",
      });
      // Check auth status immediately after sign in
      await checkAuthStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await signUp(email, password, name);
      toast({
        title: "Account created successfully",
        description: "Please check your email for verification instructions.",
      });
      // Don't redirect immediately after registration as the user needs to verify their email
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Call the googleSignIn function from the AuthContext
      await googleSignIn();
      // Redirect is handled by the OAuth provider and the AuthContext
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
      console.error(err);
      setIsLoading(false);
    }
  };
  
  // Show loading indicator during initial authentication check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4 bg-card rounded-lg shadow-xl overflow-hidden">
        <div className="sacred-header text-center p-6">
          <h1 className="text-3xl font-bold">{t('welcome')}</h1>
          {isAuthenticated && (
            <Alert className="mt-4 bg-emerald-50 text-emerald-700 border-emerald-200">
              <AlertDescription>
                You are already authenticated! Redirecting...
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <Tabs defaultValue="signin" className="p-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">{t('signIn')}</TabsTrigger>
            <TabsTrigger value="signup">{t('signUp')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium mb-1">
                  {t('email')}
                </label>
                <Input
                  id="signin-email"
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="signin-password" className="block text-sm font-medium mb-1">
                  {t('password')}
                </label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
              
              <Button disabled={isLoading} className="w-full" type="submit">
                {isLoading ? t('loading') : t('signIn')}
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t('or')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <FcGoogle size={20} />
                  {t('continueWithGoogle')}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium mb-1">
                  {t('name')}
                </label>
                <Input
                  id="signup-name"
                  type="text" 
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium mb-1">
                  {t('email')}
                </label>
                <Input
                  id="signup-email"
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium mb-1">
                  {t('password')}
                </label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
              
              <Button disabled={isLoading} className="w-full" type="submit">
                {isLoading ? t('loading') : t('signUp')}
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t('or')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <FcGoogle size={20} />
                  {t('continueWithGoogle')}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
