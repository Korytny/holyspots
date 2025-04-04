
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FcGoogle } from 'react-icons/fc';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Redirect to cities
  useEffect(() => {
    // Auto login without authentication
    toast({
      title: "Authentication Disabled",
      description: "The authentication system has been removed. Redirecting to main page...",
    });
    
    // Redirect after a brief delay
    const timer = setTimeout(() => {
      navigate('/cities');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate, toast]);
  
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/cities');
  };
  
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/cities');
  };
  
  const handleGoogleSignIn = () => {
    navigate('/cities');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4 bg-card rounded-lg shadow-xl overflow-hidden">
        <div className="sacred-header text-center p-6">
          <h1 className="text-3xl font-bold">{t('welcome')}</h1>
          <Alert className="mt-4 bg-amber-50 text-amber-700 border-amber-200">
            <AlertDescription>
              Authentication has been disabled. Redirecting to main page...
            </AlertDescription>
          </Alert>
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
                  disabled={true}
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
                  disabled={true}
                />
              </div>
              
              <Button disabled={true} className="w-full opacity-50" type="submit">
                {t('authDisabled')}
              </Button>
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
                  disabled={true}
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
                  disabled={true}
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
                  disabled={true}
                />
              </div>
              
              <Button disabled={true} className="w-full opacity-50" type="submit">
                {t('authDisabled')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
