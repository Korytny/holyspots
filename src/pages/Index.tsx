
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/cities');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-saffron to-burgundy">
      <div className="text-center text-white animate-pulse-gentle">
        <h1 className="text-4xl font-bold mb-4">Holy Wanderer</h1>
        <p className="text-xl">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
