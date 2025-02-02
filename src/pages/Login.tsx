import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { Toast } from '../components/ui/Toast/Toast';

const FloatingShape = ({ delay = 0, className = "" }) => (
  <motion.div
    className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 ${className}`}
    initial={{ scale: 0.8, opacity: 0.3 }}
    animate={{ 
      scale: [0.8, 1.2, 0.8],
      opacity: [0.3, 0.6, 0.3],
      rotate: [0, 180, 360]
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      delay,
      ease: "linear"
    }}
  />
);

const Login = () => {
  const { signIn, user, error } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [error]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Animated background shapes */}
      <FloatingShape 
        className="w-96 h-96 bg-blue-400 dark:bg-blue-600 -top-10 -left-10" 
        delay={0}
      />
      <FloatingShape 
        className="w-96 h-96 bg-purple-400 dark:bg-purple-600 bottom-0 right-0" 
        delay={5}
      />
      <FloatingShape 
        className="w-96 h-96 bg-primary-400 dark:bg-primary-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
        delay={2}
      />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{
              opacity: 0,
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              opacity: [0, 1, 0],
              y: [null, Math.random() * -500],
              x: [null, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4 relative z-10"
      >
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 shadow-2xl">
          <CardContent className="p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <LogIn className="w-12 h-12 mx-auto text-primary-500 mb-4" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-purple-500 to-primary-400 bg-clip-text text-transparent">
                  Welcome Back
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Sign in to continue to Carrom Tracker
                </p>
              </motion.div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/80 dark:bg-gray-900/80 text-gray-500">
                    Continue with
                  </span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSignIn}
                  loading={isLoading}
                  className="w-full py-6 text-base font-medium relative overflow-hidden group"
                  leftIcon={
                    <motion.svg 
                      className="w-5 h-5 mr-2"
                      animate={{ rotate: isLoading ? 360 : 0 }}
                      transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </motion.svg>
                  }
                >
                  <span className="relative z-10">Continue with Google</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-0 group-hover:opacity-100"
                    initial={false}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>

      <AnimatePresence>
        {showToast && (
          <Toast
            id="error-toast"
            title="Authentication Error"
            description={error || "Authentication Error"}
            variant="error"
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;