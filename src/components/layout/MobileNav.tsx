import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, BarChart2 } from 'lucide-react';

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
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-safe"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
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
              className="relative flex flex-col items-center justify-center w-16 py-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
            >
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Icon 
                  className={`h-5 w-5 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
              </motion.div>
              <span className={`text-xs mt-1 ${
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-6 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default MobileNav;