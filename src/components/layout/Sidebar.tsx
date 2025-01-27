// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  Users, 
  BarChart2,
  ChevronLeft,
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
    <div className="h-full bg-card border-r border-border flex flex-col relative">
      {/* Profile Section */}
      <div className="p-4 border-b border-border">
        <motion.div 
          className="flex items-center gap-3"
          initial={false}
          animate={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <Avatar 
            src={user?.photoURL || undefined}
            fallback={user?.displayName?.[0] || '?'}
            className="h-10 w-10"
          />
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
            >
              <p className="font-medium truncate">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-md transition-colors
              ${isActive 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-muted'
              }
            `}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={onCollapse}
        className="absolute -right-3 top-8 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
};

export default Sidebar;