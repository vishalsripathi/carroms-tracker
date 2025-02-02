import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface NavbarProps {
  children?: React.ReactNode;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}


const Navbar: React.FC<NavbarProps> = ({ children, onMenuClick, showMenuButton = true }) => {
  const { user, signOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-card shadow-md fixed w-full top-0 z-40">
      <div className="md:hidden w-full" style={{ 
        paddingTop: 'env(safe-area-inset-top, 16px)',
        backgroundColor: 'hsl(var(--background))'
      }} />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            {showMenuButton && (
                <button
                  onClick={onMenuClick}
                  className="md:hidden p-2 rounded-lg text-muted-foreground"
                >
                  <Menu className="h-6 w-6" />
                </button>
              )}
            <Link to="/" className="flex items-center ml-2 md:ml-0">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                Carrom Tracker
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {children}
            {user && (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => signOut()}
                  variant="destructive"
                  size="sm"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border/10">
                {user && (
                  <>
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          src={user?.photoURL || undefined}
                          fallback={user?.displayName?.[0] || '?'}
                          className="h-10 w-10"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user.displayName}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                      {children}
                    </div>
                    <Button
                      onClick={() => signOut()}
                      variant="destructive"
                      size="sm"
                      className="w-full mt-2"
                    >
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;