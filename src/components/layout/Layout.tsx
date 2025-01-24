import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { ThemeToggle } from '../ui/ThemeToggle/ThemeToggle';

const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar>
        <ThemeToggle />
      </Navbar>

      <div className="flex">
        <AnimatePresence mode="wait">
          {showSidebar && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`${isMobile ? 'fixed inset-y-0 left-0 z-50' : ''}`}
            >
              <Sidebar 
                collapsed={sidebarCollapsed} 
                onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
              />
              {isMobile && (
                <motion.div
                  className="fixed inset-0 bg-black/50 z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSidebar(false)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <main className={`flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 ${
          showSidebar && !isMobile ? 'lg:ml-64' : ''
        }`}>
          <Outlet />
          {isMobile && <div className="h-16" />} {/* Bottom navigation spacer */}
        </main>
      </div>

      {isMobile && <MobileNav />}
    </div>
  );
};

export default Layout;