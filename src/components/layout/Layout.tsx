import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { ThemeToggle } from "../ui/ThemeToggle/ThemeToggle";
import { ScrollProgress } from "../ui/ScrollProgress/ScrollProgress";

const Layout = () => {
  const location = useLocation();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    isMobile: window.innerWidth < 1024
  });
  const [sidebarState, setSidebarState] = useState({
    isVisible: window.innerWidth >= 1024,
    isCollapsed: false
  });

  // Memoized resize handler to prevent recreating on every render
  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const isMobile = width < 1024;
    
    setDimensions(prev => {
      if (prev.width !== width) {
        return { width, isMobile };
      }
      return prev;
    });

    setSidebarState(prev => {
      const newVisible = !isMobile;
      if (prev.isVisible !== newVisible) {
        return {
          ...prev,
          isVisible: newVisible
        };
      }
      return prev;
    });
  }, []);

  // Setup resize listener
  useEffect(() => {
    const debouncedResize = debounce(handleResize, 100);
    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, [handleResize]);

  // Handle route changes
  useEffect(() => {
    if (dimensions.isMobile) {
      setSidebarState(prev => ({ ...prev, isVisible: false }));
    }
  }, [location.pathname, dimensions.isMobile]);

  const toggleSidebar = useCallback(() => {
    setSidebarState(prev => ({ ...prev, isVisible: !prev.isVisible }));
  }, []);

  const toggleCollapse = useCallback(() => {
    setSidebarState(prev => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      
      <Navbar 
        onMenuClick={toggleSidebar} 
        showMenuButton={!dimensions.isMobile}
      >
        <ThemeToggle />
      </Navbar>

      <div className="flex pt-16 h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          {sidebarState.isVisible && !dimensions.isMobile && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: sidebarState.isCollapsed ? 72 : 240,
                opacity: 1 
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="h-full"
            >
              <Sidebar
                collapsed={sidebarState.isCollapsed}
                onCollapse={toggleCollapse}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto px-4 py-8 md:py-8" style={{ 
          paddingTop: 'calc(env(safe-area-inset-top, 16px) + 2rem)'
        }}>
          <Outlet />
        </main>
      </div>

      {dimensions.isMobile && <MobileNav />}
    </div>
  );
};

function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}

export default Layout;