import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  Users, 
  BarChart2,
  ChevronRight
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
}

const Sidebar = ({ collapsed, onCollapse }: SidebarProps) => {
  const { user } = useAuthStore();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Matches', path: '/matches' },
    { icon: Users, label: 'Players', path: '/players' },
    { icon: BarChart2, label: 'Statistics', path: '/stats' },
  ];

  return (
    <motion.div 
      className="h-full bg-card border-r border-border flex flex-col relative"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Profile Section */}
      <motion.div 
        className="p-4 border-b border-border"
        animate={{ 
          paddingLeft: collapsed ? 8 : 16,
          paddingRight: collapsed ? 8 : 16
        }}
      >
        <motion.div 
          className="flex items-center gap-3"
          initial={false}
          animate={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar 
              src={user?.photoURL || undefined}
              fallback={user?.displayName?.[0] || '?'}
              className="h-10 w-10 ring-2 ring-primary/10 ring-offset-2 ring-offset-background"
            />
          </motion.div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden"
              >
                <p className="font-medium truncate">{user?.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => (
          <motion.div
            key={item.path}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200
                ${isActive 
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <motion.div
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <item.icon className="h-5 w-5" />
              </motion.div>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Collapse Button */}
      <motion.button
        onClick={onCollapse}
        className="absolute -right-3 top-8 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight size={14} />
        </motion.div>
      </motion.button>
    </motion.div>
  );
};

export default Sidebar;