import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, BarChart2, Plus } from 'lucide-react';

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Matches', path: '/matches' },
    { icon: Users, label: 'Players', path: '/players' },
    { icon: BarChart2, label: 'Stats', path: '/stats' },
  ];

  return (
    <>
      {/* FAB for quick actions */}
      <motion.button
        className="fixed right-4 bottom-20 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Bottom Navigation */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <nav className="flex justify-around items-center h-16 px-4 max-w-xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center w-16 py-1"
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative">
                  <Icon 
                    className={`h-5 w-5 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -bottom-2 left-1/2 w-1 h-1 bg-primary rounded-full"
                      style={{ x: '-50%' }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
                <span className={`text-xs mt-1 ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </motion.div>
    </>
  );
};

export default MobileNav;