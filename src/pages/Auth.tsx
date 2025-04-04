
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Auth = () => {
  const { t } = useLanguage();
  const { signIn, signUp, googleSignIn, appleSignIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/cities');
    return null;
  }
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      navigate('/cities');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
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
      navigate('/cities');
    } catch (err) {
      setError('Failed to sign up. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      await googleSignIn();
      navigate('/cities');
    } catch (err) {
      setError('Failed to sign in with Google.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAppleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      await appleSignIn();
      navigate('/cities');
    } catch (err) {
      setError('Failed to sign in with Apple.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4 bg-card rounded-lg shadow-xl overflow-hidden">
        <div className="sacred-header text-center p-6">
          <h1 className="text-3xl font-bold">{t('welcome')}</h1>
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
                />
              </div>
              
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
              
              <Button disabled={isLoading} className="w-full" type="submit">
                {isLoading ? 'Loading...' : t('signIn')}
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    or
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {t('continueWithGoogle')}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleAppleSignIn}
                  disabled={isLoading}
                >
                  {t('continueWithApple')}
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
                />
              </div>
              
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
              
              <Button disabled={isLoading} className="w-full" type="submit">
                {isLoading ? 'Loading...' : t('signUp')}
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    or
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {t('continueWithGoogle')}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleAppleSignIn}
                  disabled={isLoading}
                >
                  {t('continueWithApple')}
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
